'use strict';
/* Portfolio server - zero dependencies (Node >= 18). */
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto'), zlib = require('zlib');

const PROD = process.env.NODE_ENV === 'production';
const PORT = +process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const DATA = path.resolve(process.env.DATA_DIR || path.join(__dirname, 'data'));
const UPLOADS = path.join(DATA, 'uploads');
const PUBLIC = path.join(__dirname, 'public');
const MAX_PHOTOS = +process.env.MAX_PHOTOS || 300;
const MAX_BODY = 14 * 1024 * 1024, MAX_IMG = 6 * 1024 * 1024;
const TRUST_PROXY = process.env.TRUST_PROXY === '1';
const COOKIE_SECURE = process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : PROD;
const PASSWORD = process.env.ADMIN_PASSWORD || '';
if (PASSWORD.length < 8) { console.error('FATAL: set ADMIN_PASSWORD (min 8 chars) in the environment.'); process.exit(1); }
if (PROD && PASSWORD.length < 12) console.warn('WARN: use an ADMIN_PASSWORD of 12+ characters in production.');

fs.mkdirSync(UPLOADS, { recursive: true });
const SECRET = (() => {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const f = path.join(DATA, '.secret');
  try { return fs.readFileSync(f, 'utf8'); } catch { const s = crypto.randomBytes(32).toString('hex'); fs.writeFileSync(f, s, { mode: 0o600 }); return s; }
})();

/* ---------- storage (JSON files, atomic writes, serialized) ---------- */
const F = { site: path.join(DATA, 'site.json'), photos: path.join(DATA, 'photos.json'), trash: path.join(DATA, 'trash.json') };
const read = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return d; } };
let site = Object.assign({ name: 'Your Name', tag: 'Photography & moments — captured, not posed.', about: { text: '', email: '', src: '' } }, read(F.site, {}));
let photos = read(F.photos, []);
let trash = read(F.trash, []);
let chain = Promise.resolve();
const persist = () => (chain = chain.then(() => {
  for (const [f, v] of [[F.site, site], [F.photos, photos], [F.trash, trash]]) { const t = f + '.tmp'; fs.writeFileSync(t, JSON.stringify(v, null, 1)); fs.renameSync(t, f); }
}));

/* ---------- helpers ---------- */
const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clip = (v, n) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, n);
const sha = s => crypto.createHash('sha256').update(s).digest();
const safeEq = (a, b) => crypto.timingSafeEqual(sha(a), sha(b));
const HttpError = (status, error) => Object.assign(new Error(error), { status });

const sign = p => { const b = Buffer.from(JSON.stringify(p)).toString('base64url'); return b + '.' + crypto.createHmac('sha256', SECRET).update(b).digest('base64url'); };
const verify = t => {
  const [b, m] = String(t || '').split('.'); if (!b || !m) return null;
  const e = crypto.createHmac('sha256', SECRET).update(b).digest('base64url');
  if (e.length !== m.length || !crypto.timingSafeEqual(Buffer.from(e), Buffer.from(m))) return null;
  try { const p = JSON.parse(Buffer.from(b, 'base64url')); return p.exp > Date.now() ? p : null; } catch { return null; }
};
const cookies = req => Object.fromEntries((req.headers.cookie || '').split(';').map(c => c.trim().split('=')).filter(c => c[0]).map(([k, ...v]) => [k, v.join('=')]));
const isAdmin = req => !!verify(cookies(req).sid);
const ip = req => (TRUST_PROXY && String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || req.socket.remoteAddress || 'x';

const fails = new Map(); // ip -> [timestamps]
const locked = k => { const a = (fails.get(k) || []).filter(t => Date.now() - t < 15 * 60e3); fails.set(k, a); return a.length >= 5; };
setInterval(() => fails.forEach((a, k) => { if (!a.some(t => Date.now() - t < 15 * 60e3)) fails.delete(k); }), 60e3).unref();

function send(res, status, body, headers = {}) {
  const isObj = typeof body === 'object' && !Buffer.isBuffer(body);
  res.writeHead(status, { 'Content-Type': isObj ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(isObj ? JSON.stringify(body) : body);
}
function body(req) {
  return new Promise((ok, no) => {
    let n = 0; const chunks = [];
    req.on('data', c => { n += c.length; if (n > MAX_BODY) { no(HttpError(413, 'Upload too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { ok(JSON.parse(Buffer.concat(chunks).toString() || '{}')); } catch { no(HttpError(400, 'Invalid JSON')); } });
    req.on('error', no);
  });
}
function jpeg(dataUrl) { // accepts JPEG or WebP data URLs
  const m = /^data:image\/(jpeg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''));
  if (!m) throw HttpError(400, 'Images must be JPEG or WebP');
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length < 12) throw HttpError(400, 'Image too small');
  if (buf.length > MAX_IMG) throw HttpError(413, 'Image too large');
  const okJ = buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF;
  const okW = buf.toString('latin1', 0, 4) === 'RIFF' && buf.toString('latin1', 8, 12) === 'WEBP';
  if (m[1] === 'jpeg' ? !okJ : !okW) throw HttpError(400, 'Not a valid image');
  buf.ext = m[1] === 'webp' ? '.webp' : '.jpg'; return buf;
}
const saveImg = (buf, prefix = '') => { const n = prefix + crypto.randomBytes(12).toString('hex') + buf.ext; fs.writeFileSync(path.join(UPLOADS, n), buf); return '/uploads/' + n; };
const rmImg = u => { if (typeof u === 'string' && /^\/uploads\/[\w-]+\.(jpg|webp)$/.test(u)) fs.rm(path.join(DATA, u), { force: true }, () => {}); };
const lqip = v => /^data:image\/(jpeg|webp);base64,[A-Za-z0-9+/=]{20,4000}$/.test(String(v || '')) ? v : '';
const dim = v => Math.min(20000, Math.max(1, parseInt(v, 10) || 1));
const orient = (w, h) => { const k = w / h; return k > 1.15 ? 'l' : k < .87 ? 'p' : 's'; };
// deleted photos stay recoverable for 24h ("Undo"), then their files are removed
const purge = () => { const keep = trash.filter(t => Date.now() - t.at <= 864e5); trash.filter(t => !keep.includes(t)).forEach(t => { rmImg(t.photo.src); rmImg(t.photo.thumb); }); if (keep.length !== trash.length) { trash = keep; persist(); } };
purge(); setInterval(purge, 36e5).unref();

/* ---------- API ---------- */
async function api(req, res, url) {
  const m = req.method, p = url.pathname;
  if (m !== 'GET' && m !== 'HEAD') {
    if (req.headers['x-requested-with'] !== 'portfolio') throw HttpError(403, 'Forbidden');
    const o = req.headers.origin; if (o && new URL(o).host !== req.headers.host) throw HttpError(403, 'Bad origin');
  }
  if (m === 'GET' && p === '/api/site') return send(res, 200, { name: site.name, tag: site.tag, about: site.about });
  if (m === 'GET' && p === '/api/photos') return send(res, 200, { photos }, { 'Cache-Control': 'no-cache' });
  if (m === 'GET' && p === '/api/me') return send(res, 200, { admin: isAdmin(req) });

  if (m === 'POST' && p === '/api/login') {
    const k = ip(req); if (locked(k)) throw HttpError(429, 'Too many attempts - try again in 15 minutes');
    const b = await body(req);
    if (!safeEq(String(b.password || ''), PASSWORD)) { fails.get(k).push(Date.now()); throw HttpError(401, 'Wrong password'); }
    fails.delete(k);
    const tok = sign({ exp: Date.now() + 7 * 864e5 });
    return send(res, 200, { ok: true }, { 'Set-Cookie': `sid=${tok}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${7 * 86400}${COOKIE_SECURE ? '; Secure' : ''}` });
  }
  if (m === 'POST' && p === '/api/logout') return send(res, 200, { ok: true }, { 'Set-Cookie': 'sid=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' });

  if (m !== 'GET' && !isAdmin(req)) throw HttpError(401, 'Please log in');

  if (m === 'POST' && p === '/api/photos') {
    if (photos.length >= MAX_PHOTOS) throw HttpError(400, `Limit of ${MAX_PHOTOS} photos reached`);
    const b = await body(req), full = jpeg(b.full), thumb = jpeg(b.thumb), w = dim(b.w), h = dim(b.h);
    const photo = { id: crypto.randomBytes(8).toString('hex'), title: clip(b.title, 120), cat: clip(b.cat, 40) || 'Photography', note: clip(b.note, 600), w, h, o: orient(w, h), lq: lqip(b.lq), src: saveImg(full), thumb: saveImg(thumb, 't-'), created: new Date().toISOString() };
    photos.unshift(photo); await persist(); return send(res, 201, { photo });
  }
  let mm = /^\/api\/photos\/([a-f0-9]{16})$/.exec(p);
  if (mm) {
    const i = photos.findIndex(x => x.id === mm[1]); if (i < 0) throw HttpError(404, 'Photo not found');
    if (m === 'PATCH') { const b = await body(req), x = photos[i]; if ('title' in b) x.title = clip(b.title, 120); if ('cat' in b) x.cat = clip(b.cat, 40) || x.cat; if ('note' in b) x.note = clip(b.note, 600); await persist(); return send(res, 200, { photo: x }); }
    if (m === 'DELETE') { const [x] = photos.splice(i, 1); trash.push({ photo: x, index: i, at: Date.now() }); await persist(); return send(res, 200, { ok: true }); }
  }
  mm = /^\/api\/photos\/([a-f0-9]{16})\/restore$/.exec(p);
  if (m === 'POST' && mm) {
    const i = trash.findIndex(t => t.photo.id === mm[1]); if (i < 0) throw HttpError(404, 'Nothing to restore');
    const [t] = trash.splice(i, 1), at = Math.min(t.index, photos.length); photos.splice(at, 0, t.photo);
    await persist(); return send(res, 200, { photo: t.photo, index: at });
  }
  if (m === 'PUT' && p === '/api/photos/order') {
    const b = await body(req); if (!Array.isArray(b.ids)) throw HttpError(400, 'ids required');
    const by = new Map(photos.map(x => [x.id, x])); photos = [...b.ids.map(i => by.get(i)).filter(Boolean), ...photos.filter(x => !b.ids.includes(x.id))];
    await persist(); return send(res, 200, { ok: true });
  }
  if (m === 'PUT' && p === '/api/site') {
    const b = await body(req), a = b.about || {}, e = clip(a.email, 120);
    if (e && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) throw HttpError(400, 'Invalid email address');
    site.name = clip(b.name, 80) || site.name; site.tag = clip(b.tag, 200); site.about = { ...site.about, text: clip(a.text, 1200), email: e };
    await persist(); return send(res, 200, { ok: true });
  }
  if (m === 'POST' && p === '/api/portrait') {
    const b = await body(req), old = site.about.src; site.about.src = saveImg(jpeg(b.data), 'p-'); await persist(); rmImg(old);
    return send(res, 200, { src: site.about.src });
  }
  throw HttpError(404, 'Not found');
}

/* ---------- static files ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8' };
const template = fs.readFileSync(path.join(PUBLIC, 'index.html'), 'utf8');
function page(req, res, photo) {
  const proto = TRUST_PROXY ? (req.headers['x-forwarded-proto'] || 'http') : 'http';
  const base = process.env.BASE_URL || `${proto}://${req.headers.host}`, first = photo || photos[0];
  const title = photo ? `${photo.title || 'Photo'} — ${site.name}` : `${site.name} — Portfolio`, desc = (photo && photo.note) || site.tag;
  const img = first ? base + (photo ? first.src : (first.thumb || first.src)) : '';
  send(res, 200, template.replace(/{{TITLE}}/g, esc(title)).replace(/{{DESC}}/g, esc(desc)).replace('{{OG_IMAGE}}', img ? `<meta property="og:image" content="${esc(img)}">` : ''),
    { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-cache' });
}
function serve(req, res, root, rel, cache) {
  const f = path.join(root, path.normalize(decodeURIComponent(rel)).replace(/^(\.\.[/\\])+/, ''));
  if (!f.startsWith(root + path.sep)) return send(res, 404, 'Not found');
  fs.stat(f, (e, st) => {
    if (e || !st.isFile()) return send(res, 404, 'Not found');
    const ext = path.extname(f).toLowerCase(), etag = `"${st.size}-${st.mtimeMs.toString(36)}"`;
    const h = { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': cache, ETag: etag };
    if (req.headers['if-none-match'] === etag) return (res.writeHead(304, h), res.end());
    const gz = /\b(css|js|svg|html|json)$/.test(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] || '');
    if (gz) { h['Content-Encoding'] = 'gzip'; h.Vary = 'Accept-Encoding'; }
    res.writeHead(200, h); if (req.method === 'HEAD') return res.end();
    const rs = fs.createReadStream(f); rs.on('error', () => res.destroy());
    gz ? rs.pipe(zlib.createGzip()).pipe(res) : rs.pipe(res);
  });
}

/* ---------- server ---------- */
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'";
const server = http.createServer(async (req, res) => {
  const t0 = Date.now();
  res.setHeader('Content-Security-Policy', CSP); res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin'); res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (PROD) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.on('finish', () => console.log(JSON.stringify({ t: new Date().toISOString(), m: req.method, u: req.url.split('?')[0], s: res.statusCode, ms: Date.now() - t0 })));
  try {
    const url = new URL(req.url, 'http://x'), p = url.pathname;
    if (p === '/healthz') return send(res, 200, { ok: true });
    if (p.startsWith('/api/')) return await api(req, res, url);
    if (req.method !== 'GET' && req.method !== 'HEAD') throw HttpError(405, 'Method not allowed');
    const pm = /^\/photo\/([a-f0-9]{16})$/.exec(p); if (pm) return page(req, res, photos.find(x => x.id === pm[1]));
    if (p === '/' || p === '/index.html') return page(req, res);
    if (p.startsWith('/uploads/')) return serve(req, res, UPLOADS, p.slice(9), 'public, max-age=31536000, immutable');
    return serve(req, res, PUBLIC, p.slice(1), 'public, max-age=300');
  } catch (e) {
    if (!e.status) console.error(e);
    if (!res.headersSent) send(res, e.status || 500, { error: e.status ? e.message : 'Server error' });
  }
});
server.requestTimeout = 60e3; server.headersTimeout = 15e3; server.keepAliveTimeout = 5e3;
if (require.main === module) {
  server.listen(PORT, HOST, () => console.log(`Portfolio running on http://${HOST}:${PORT}  (data: ${DATA})`));
  const stop = () => server.close(() => chain.then(() => process.exit(0))); process.on('SIGTERM', stop); process.on('SIGINT', stop);
}
module.exports = server;

const { test, before, after } = require('node:test'); const assert = require('node:assert');
const fs = require('fs'), os = require('os'), path = require('path');
process.env.ADMIN_PASSWORD = 'test-password-123'; process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pf-'));
const server = require('../server'); let base, cookie = '';
const JPG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
const call = (m, u, b, h = {}) => fetch(base + u, { method: m, headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'portfolio', cookie, ...h }, body: b && JSON.stringify(b) });
before(() => new Promise(r => server.listen(0, '127.0.0.1', () => { base = 'http://127.0.0.1:' + server.address().port; r(); })));
after(() => server.close());
test('public pages and health', async () => {
  assert.equal((await fetch(base + '/healthz')).status, 200);
  const h = await (await fetch(base + '/')).text(); assert.match(h, /<title>Your Name/);
  assert.equal((await fetch(base + '/css/styles.css')).status, 200);
  assert.equal((await fetch(base + '/js/app.js')).status, 200);
  assert.equal((await fetch(base + '/../server.js')).status, 404);
  assert.equal((await fetch(base + '/%2e%2e/server.js')).status, 404);
});
test('writes need auth and the CSRF header', async () => {
  assert.equal((await call('POST', '/api/photos', { full: JPG, thumb: JPG, w: 4, h: 3 })).status, 401);
  assert.equal((await call('PUT', '/api/site', { name: 'x' }, { 'X-Requested-With': '' })).status, 403);
  assert.equal((await call('POST', '/api/login', { password: 'nope' })).status, 401);
});
test('admin CRUD', async () => {
  const l = await call('POST', '/api/login', { password: 'test-password-123' }); assert.equal(l.status, 200);
  cookie = l.headers.get('set-cookie').split(';')[0]; assert.match(l.headers.get('set-cookie'), /HttpOnly/);
  assert.equal((await (await call('GET', '/api/me')).json()).admin, true);
  assert.equal((await call('POST', '/api/photos', { full: 'data:image/png;base64,AAAA', thumb: JPG, w: 4, h: 3 })).status, 400);
  const c = await call('POST', '/api/photos', { full: JPG, thumb: JPG, w: 4000, h: 3000, title: '<b>Sunset</b>', cat: 'Summer' });
  assert.equal(c.status, 201); const { photo } = await c.json(); assert.equal(photo.o, 'l');
  assert.equal((await fetch(base + photo.src)).status, 200);
  assert.equal((await call('PATCH', '/api/photos/' + photo.id, { title: 'Golden', note: 'hi' })).status, 200);
  const list = await (await call('GET', '/api/photos')).json(); assert.equal(list.photos[0].title, 'Golden');
  assert.equal((await call('PUT', '/api/site', { name: 'Ada', tag: 'Hello', about: { text: 'bio', email: 'bad' } })).status, 400);
  assert.equal((await call('PUT', '/api/site', { name: 'Ada', tag: 'Hello', about: { text: 'bio', email: 'a@b.co' } })).status, 200);
  assert.match(await (await fetch(base + '/')).text(), /<title>Ada/);
  assert.equal((await call('DELETE', '/api/photos/' + photo.id)).status, 200);
  assert.equal((await call('DELETE', '/api/photos/' + photo.id)).status, 404);
  await call('POST', '/api/logout'); cookie = '';
  assert.equal((await (await call('GET', '/api/me')).json()).admin, false);
});
test('login rate limit', async () => {
  let s; for (let i = 0; i < 7; i++) s = (await call('POST', '/api/login', { password: 'bad' })).status; assert.equal(s, 429);
});

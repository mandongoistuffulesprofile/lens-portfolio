# Art Portfolio

Animated, mobile-friendly photo portfolio (old-album layout, scatter table, clean grid, envelope intro, film-strip viewer)
with a password-protected admin API to add, edit and delete photos. **Plain HTML + CSS + JS, zero npm dependencies** (Node 18+).

## Run locally
```bash
ADMIN_PASSWORD='a-long-passphrase' npm start      # http://localhost:3000
npm test                                           # API smoke tests
```

## Using the admin
1. Open your site, scroll to the footer and click **Admin** (or visit `/#admin`) and log in.
2. Edit mode turns on: drag-and-drop photos, **Edit / Delete** on each photo (title, category = album page, love note),
   **Name & tagline**, and **Edit about** / click the portrait box. Everything saves instantly - there is no publish step.
3. Click **Log out** when done. Visitors never see edit controls.

## Deploy
**Docker (easiest):** `cp .env.example .env`, set `ADMIN_PASSWORD`, then `docker compose up -d --build`. Data lives in the `portfolio-data` volume.
**VPS / any Node host (Render, Railway, Fly, etc.):** set env vars from `.env.example`, run `npm start`, mount a persistent disk at `DATA_DIR`.
Put it behind HTTPS (Caddy: `yourdomain.com { reverse_proxy localhost:3000 }`, or see `nginx.example.conf`) and set `TRUST_PROXY=1`.
**Backups:** copy the `data/` folder (photos.json, site.json, uploads/). That is the entire state.

## API (JSON; writes require login cookie + `X-Requested-With: portfolio`)
| Method | Path | Notes |
|---|---|---|
| GET | `/api/site`, `/api/photos`, `/api/me` | public |
| POST | `/api/login` `{password}`, `/api/logout` | rate-limited: 5 failures / 15 min / IP |
| POST | `/api/photos` `{full,thumb,w,h,title,cat,note}` | JPEG data URLs, max 6 MB each |
| PATCH / DELETE | `/api/photos/:id` | edit title/cat/note, delete |
| PUT | `/api/photos/order` `{ids:[...]}` | reorder |
| PUT | `/api/site` `{name,tag,about:{text,email}}` | |
| POST | `/api/portrait` `{data}` | |

## Security notes
HttpOnly + SameSite=Strict signed session cookie (7 days), constant-time password check, CSRF header + origin check,
strict CSP, input length limits, JPEG magic-byte validation, random upload filenames, atomic writes, non-root Docker user.
Single-admin design: for multiple users or very large galleries (1000s of photos) move to a database + object storage.
Uploads are resized in the browser (1800px full + 640px thumbnail) before sending.

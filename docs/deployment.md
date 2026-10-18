# Deploying to SCU cPanel

Both websites are static after a build; only the API needs Node.js. The plan:

```
https://<you>.scu.edu.au/          -> built client-side files   (public_html)
https://<you>.scu.edu.au/admin/    -> built admin-side files    (public_html/admin)
https://<you>.scu.edu.au/api/      -> Node.js application       (Setup Node.js App)
```

---

## 0. Before you start

```bash
# client site
cd clientside && npm install && npx ng build

# admin site - the --base-href matters: it lives in a sub-folder
cd adminside && npm install && npx ng build --base-href=/admin/
```

Build output:

* `clientside/dist/clientside/browser/` → upload to `public_html/`
* `adminside/dist/adminside/browser/` → upload to `public_html/admin/`

---

## 1. Database

1. cPanel → **MySQL Databases** → create a database, a user, and add the user
   to the database with **ALL PRIVILEGES**.
2. Open **phpMyAdmin**, select the new database, **Import** →
   `database/charityevents-db.sql` → Go.
3. Note down: database name, username, password. The API needs all three.

> The SQL file drops and recreates `charityevents_db`. On cPanel your database
> name is prefixed (e.g. `scuxxx_charityevents`), so either rename the
> database in the file before importing, or import only the `CREATE TABLE` and
> `INSERT` statements after selecting your database in phpMyAdmin.

---

## 2. The API (Setup Node.js App)

1. cPanel → **Setup Node.js App** → **Create Application**.
   * Node.js version: the newest available (18+; this project was built on 22).
   * Application mode: **Production**
   * Application root: `api` (create the folder under your home directory)
   * Application URL: `/api`
   * Application startup file: `server.js`
2. Upload the API folder (File Manager or FTP) **except** `node_modules`:
   `server.js`, `event_db.js`, `package.json`, `routes/`.
3. In the Node.js App screen, **Run NPM Install** (it reads `package.json`).
4. Add the environment variables in the same screen:

   ```
   DB_HOST      = 127.0.0.1
   DB_PORT      = 3306
   DB_USER      = <your cPanel db user>
   DB_PASSWORD  = <your cPanel db password>
   DB_NAME      = <your cPanel db name>
   ALLOWED_ORIGIN = https://<you>.scu.edu.au
   ```

   `PORT` is assigned by cPanel automatically — do not set it.
5. **Restart** the application.
6. Check it: open `https://<you>.scu.edu.au/api/health`.
   You should see `"database":"connected"` and the row counts.

---

## 3. The two websites

Upload the built files with File Manager or FTP:

| Local folder | Remote folder |
|---|---|
| `clientside/dist/clientside/browser/*` | `public_html/` |
| `adminside/dist/adminside/browser/*` | `public_html/admin/` |
| `clientside/public/assets/img/*` | `public_html/assets/img/` |

Because the API URL is `/api` (an absolute path) and the admin site was built
with `--base-href=/admin/`, no code change is needed between local and live.

### Apache rewrite (needed for Angular routing)

Angular routes such as `/event/5` or `/admin/events/3/edit` do not exist as
files, so Apache must hand them back to `index.html`. Create
`public_html/.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # API requests belong to the Node app - never rewrite them
  RewriteCond %{REQUEST_URI} ^/api/
  RewriteRule ^ - [L]

  # admin sub-folder
  RewriteCond %{REQUEST_URI} ^/admin/
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ admin/index.html [L]

  # public site
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [L]
</IfModule>
```

---

## 4. Post-deployment checks

| Check | Expected |
|---|---|
| `https://<you>.scu.edu.au/api/health` | `database: connected` |
| Home page | upcoming and past events listed |
| Search | filtering returns fewer rows |
| Event page | attendee list + weather panel |
| Registration | form submits, new row appears in the attendee list |
| Admin list | **all** events incl. suspended (event 13 “Late Night Street Food Night”) |
| Admin delete on event 12 | succeeds (no registrations) |
| Admin delete on event 5 | refused with “3 registration(s) are attached to it” |

---

## 5. When something breaks

| Symptom | Likely cause |
|---|---|
| Page loads, no events, console shows a failed `/api/...` | Node app not running, or `DB_*` variables wrong → check `/api/health` |
| `/api/health` says `database: error` | wrong database name/user, or the SQL import failed |
| Refreshing `/event/5` gives 404 | missing/incorrect `.htaccess` |
| Admin page is blank | built without `--base-href=/admin/` |
| Weather panel never appears | event has no coordinates, or the date is more than ~16 days ahead (both are handled, not errors) |
| CORS error in the console | `ALLOWED_ORIGIN` is set to a different host than the one in the address bar |

---

## 6. My deployment — Jie Bao (jbao14)

| Part | URL |
|---|---|
| Public site | https://24831941.it.scu.edu.au/ |
| Admin site | https://24831941.it.scu.edu.au/admin/ |
| API health | https://24831941.it.scu.edu.au/api/health |

Deployed on SCU cPanel: MySQL database `jbao14_charityevents` imported from
`database/charityevents-db-cpanel.sql` (the version without CREATE DATABASE,
which the shared host refuses to run), the API registered as a Node.js
application mounted at `/api`, and both Angular builds uploaded to
`public_html/` and `public_html/admin/`.

Verified after deployment: `/api/health` reports `database: connected` with
13 events and 16 registrations; deep links such as `/event/5` and
`/admin/events/5/edit` return `index.html` (the `.htaccess` rewrite works).

---

## 7. My deployment — Chengyu Gao (cgao15)

| Part | URL |
|---|---|
| Public site | https://24832054.it.scu.edu.au/ |
| Admin site | https://24832054.it.scu.edu.au/admin/ |
| API health | https://24832054.it.scu.edu.au/api/health |

Deployed on my own SCU cPanel, following the same procedure: MySQL database
`cgao15_charityevents` imported from `database/charityevents-db-cpanel.sql`,
the API registered as a Node.js application mounted at `/api`, and both
Angular builds uploaded to `public_html/` and `public_html/admin/` (the admin
build with `--base-href=/admin/`).

Verified after deployment: `/api/health` returns

```json
{"api":"running","database":"connected","dbName":"cgao15_charityevents",
 "counts":{"events":13,"registrations":16,"categories":6}}
```

which is the check I rely on — it names the database the API is actually
connected to, so a wrong credential cannot hide behind a page that looks fine.

The one thing that went wrong is described in Section 5: the API answered
`Access denied for user root@localhost` because the environment variables had
been typed into the cPanel form but never applied. Moving them into a `.env`
file read by dotenv fixed it, and that is the change I would make first on any
deployment now.

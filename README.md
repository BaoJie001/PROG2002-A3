# Giving Coast — PROG2002 Assessment 3

A complete dynamic website for a charity-events case study: a public
**client-side site**, a staff **admin-side site**, and a **RESTful API** on top
of a MySQL database. Built from the Assessment 2 case study (Giving Coast,
Gold Coast charity events) and extended with event registration, full CRUD
administration and a live weather forecast.

---

## 1. What was added for Assessment 3

| Brief part | What was built |
|---|---|
| **1. Database** | New `registrations` table (FK → `events`, `UNIQUE (event_id, email)`), `latitude`/`longitude` on `events` for the weather API, 16 sample registrations, `v_event_summary` view, single-file SQL export |
| **2. REST API** | Full C.R.U.D.: `POST /api/events`, `PUT /api/events/:id`, `DELETE /api/events/:id` (blocked with **409** when registrations exist); `GET /api/events/:id` now returns its registrations; `POST /api/registrations`; `GET /api/weather/:id` (Open-Meteo proxy) |
| **3. Client-side** | Registration page (validated form → API), event page now lists who is going (newest purchase first) and shows the forecast |
| **4. Admin-side** | Dashboard listing every event including suspended/past, new-event form, edit form that also shows that event's registrations, delete with clear feedback when blocked |
| **5. Deployment** | Both Angular apps built to static files, API run as a Node.js app — see [`docs/deployment.md`](docs/deployment.md) |
| **6. External API** | Open-Meteo forecast, cached server-side for 10 minutes, degrades to hidden panel when unavailable |

---

## 2. Technology

| Layer | Choice | Why |
|---|---|---|
| Client + admin sites | **Angular 22 (TypeScript)**, standalone components, signals, reactive forms, `HttpClient` | Requirement for the higher grade band; typed models, one component per screen |
| Styling | Hand-written CSS | No frameworks permitted |
| API | **Node.js + Express**, `mysql2` connection pool | Required stack; parameterised SQL everywhere |
| Database | **MySQL 8** | Relational schema with PK/FK/CHECK/UNIQUE enforcing the business rules |
| Weather | **Open-Meteo** via our own API | Optional extra credit; proxied and cached server-side |

Angular CLI version used: **22.2.3** (npm `latest`), requiring Node ≥ 22.22.3.

---

## 3. Repository layout

```
PROG2002-A3/
├── database/
│   └── charityevents-db.sql      # whole database: schema + sample data (single file)
├── api/
│   ├── server.js                 # Express entry point
│   ├── event_db.js               # MySQL pool + query/transaction helpers
│   ├── routes/
│   │   ├── events.js             # GET list / detail, POST, PUT, DELETE
│   │   ├── registrations.js      # POST + GET
│   │   ├── categories.js         # GET
│   │   ├── organisations.js      # GET (organiser dropdown)
│   │   ├── weather.js            # Open-Meteo proxy with cache
│   │   └── validate.js           # shared input validation
│   └── .env.example
├── clientside/                   # public site (Angular)
│   └── src/app/{pages,components,services,models,utils}
├── adminside/                    # staff site (Angular)
│   └── src/app/{pages,components,services,models,utils}
└── docs/
    ├── deployment.md             # SCU cPanel deployment guide
    ├── video-script.md           # 15-minute demo video plan
    └── genai-declaration.md      # GenAI Level 2 declaration
```

---

## 4. Running it locally

```bash
# 1. database (MySQL 8 must be running)
mysql -u root < database/charityevents-db.sql

# 2. API
cd api
npm install
cp .env.example .env        # edit if your MySQL is not root@localhost with no password
npm start                   # http://localhost:3000/api/health

# 3. public site (terminal 2)
cd clientside
npm install
npm start                   # http://localhost:4200  (proxies /api to :3000)

# 4. admin site (terminal 3)
cd adminside
npm install
npm start                   # http://localhost:4201  (proxies /api to :3000)
```

`npm start` in each Angular project maps to `ng serve`, which uses
`src/proxy.conf.json` so `/api` calls reach the Express API without CORS
trouble.

---

## 5. API reference

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API + database status |
| GET | `/api/events` | Upcoming active events. Query: `date`, `location`, `category`, `status` (`active`\|`suspended`\|`all`), `period` (`upcoming`\|`past`\|`all`) |
| GET | `/api/events/past` | Finished events |
| GET | `/api/events/:id` | One event **plus its registrations** (newest first). `?status=all` opens suspended events (admin) |
| POST | `/api/events` | Create → `201` + `Location` |
| PUT | `/api/events/:id` | Partial update → `200` |
| DELETE | `/api/events/:id` | Delete → `200`, or **409** with the registration count when people have booked |
| GET | `/api/registrations?event_id=` | Bookings for one event |
| POST | `/api/registrations` | Register → `201`; `409` on a duplicate email, a suspended event, or a finished event |
| GET | `/api/categories` | Categories + upcoming counts |
| GET | `/api/organisations` | Charities + event counts |
| GET | `/api/weather/:eventId` | Forecast for the event's day and place |

Every endpoint answers JSON, validates input, binds parameters with `?`
placeholders, and returns a useful status code (200/201/400/404/409/500/502).

---

## 6. Business rules the database enforces

* one person may book many events, but **only once per event** —
  `UNIQUE (event_id, email)`;
* a booking is for **at least one ticket** — `CHECK (tickets > 0)`;
* an event with registrations **cannot be deleted** —
  `ON DELETE RESTRICT`, plus an explicit `409` from the API;
* money and ticket values cannot be negative;
* suspended events stay invisible on the public site but visible to staff.

---

## 7. Assessment deliverables

* `usernameA3-clientside.zip`, `usernameA3-adminside.zip`, `usernameA3-api.zip`
* GitHub repository link (private, marker invited as collaborator)
* Demo video (≤ 15 minutes, SCU OneDrive share link)
* Peer evaluation form emailed to the tutor
* GenAI declaration — see [`docs/genai-declaration.md`](docs/genai-declaration.md)

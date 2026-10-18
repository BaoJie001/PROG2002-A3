# Assessment 3 — Team work plan

Giving Coast · PROG2002 · Team of two

| | Member A | Member B |
|---|---|---|
| Name | Jie Bao (包杰) | Chengyu Gao |
| Student ID | _(fill in)_ | 24832054 |
| GitHub | BaoJie001 | Carlos-001-max |
| Cohort | _(fill in)_ | 10 |
| Team ID | Team 30 | Team 30 |

---

## 1. How the unit expects a team of two to work

From the brief:

* **Two students per team**, both in the same cohort. The team registers by
  emailing the **UA** (not the tutor) with both student IDs, names and cohort.
* **One shared codebase** in one GitHub repository. Both members commit to it.
* **Everything else is individual**: each student deploys to **their own SCU
  cPanel**, submits **their own three zip files**, records **their own video**
  focused on their own contribution, and emails **their own peer evaluation
  form** to the **tutor** (not the UA), titled
  `PROG2002_A3_[Team_ID]_[Member_name]`.
* The teamwork mark (15%) is an **individual** mark. The HD wording is
  "consistently attends group meetings on time, contributes significantly and
  meaningfully to discussions, **independently carries out tasks**, and
  demonstrates a cooperative and supportive attitude".

So the evidence of teamwork is: **two different authors in the commit history**,
each owning a real part of the code, plus what each of us says in their own
video and peer evaluation form.

---

## 2. How we split the work

The split is by **module ownership**, not by "who typed it". Each of us owns
roughly half of the code (measured in lines) and, more importantly, each of us
can explain our own half without help — that is what the individual video needs.

| Area | Member A | Member B |
|---|---|---|
| Database | **entire schema and data** | (reviews and tests it) |
| API — events | **events CRUD, pooling, server** | |
| API — bookings & weather | | **registrations, validation, weather, categories, organisations** |
| Client site — browsing | **shell, home, search, services, models, styles** | |
| Client site — event & booking | | **event detail (ticket list + weather), register page, event card** |
| Admin site — list & create | **event list, new event, global styles, models** | |
| Admin site — edit & form | | **event edit, the shared event form, admin services** |
| Postman collection | | **all 20 requests and the environment file** |
| Documents | README, deployment guide | teammate guide, video plan, GenAI declaration, peer evaluation |

### 2.1 Member A — Jie Bao (包杰)

| # | Task | Files | Status |
|---|---|---|---|
| A1 | Database: `registrations` table, foreign keys, `UNIQUE(event_id, email)`, CHECK constraints, venue coordinates, `v_event_summary` view, 16 sample bookings | `database/charityevents-db.sql` | done |
| A2 | Connection pool and transaction helper | `api/event_db.js` | done |
| A3 | Shared validation rules used by every route | `api/routes/validate.js` | done |
| A4 | Event CRUD: list with filters, detail with registrations, create (201 + Location), partial update, delete that answers **409** when people have already booked | `api/routes/events.js` | done |
| A5 | Server, static hosting, error handling, endpoint index | `api/server.js` | done |
| A6 | Angular client shell: routing, providers, navigation, global stylesheet | `clientside/src/app/app.*`, `styles.css` | done |
| A7 | Home page — upcoming and past events fetched in parallel | `clientside/src/app/pages/home/` | done |
| A8 | Search page — date / location / category filters with client-side validation | `clientside/src/app/pages/search/` | done |
| A9 | Typed models and the two API services | `clientside/src/app/models/`, `services/` | done |
| A10 | Admin: event list (including suspended and past), new event screen, admin global styles and models | `adminside/src/app/pages/event-list/`, `event-new/`, `styles.css`, `models/` | done |
| A11 | README and the cPanel deployment guide | `README.md`, `docs/deployment.md` | done |
| A12 | **Deploy the API and both sites to my own SCU cPanel** | — | to do |
| A13 | **Record my own video (≤ 15 min) about my half** | `docs/video-script.md` | to do |
| A14 | **My three zip files** `usernameA3-clientside / adminside / api.zip` | `submission/` | to do |

**A's share: about 3,950 lines of code and documents.**

### 2.2 Member B — _(teammate)_

| # | Task | Files | Status |
|---|---|---|---|
| B1 | Booking endpoint: validates every field, refuses bookings for finished or suspended events, answers a friendly **409** on a duplicate email | `api/routes/registrations.js` | done |
| B2 | Weather proxy: Open-Meteo forecast for the event's day and place, 10-minute cache, WMO codes in plain English, never fails the page | `api/routes/weather.js` | done |
| B3 | Category and organisation lookups | `api/routes/categories.js`, `organisations.js` | done |
| B4 | Event detail page: the **list of tickets purchased, sorted by the latest purchase date**, plus the forecast panel | `clientside/src/app/pages/event-detail/` | done |
| B5 | Register page: reactive form with validators, posts the booking, shows the server's confirmation | `clientside/src/app/pages/register/` | done |
| B6 | Shared event card used by the home and search pages | `clientside/src/app/components/event-card/` | done |
| B7 | Admin: edit screen (with that event's registrations) and the shared event form, admin API service | `adminside/src/app/pages/event-edit/`, `components/event-form/`, `services/` | done |
| B8 | Code comments that explain **why**, across the API and the admin screens — this is what the 10% "concept understanding" criterion looks at | `api/**`, `adminside/**` | done |
| B9 | Postman collection: 20 requests with assertions, covering every endpoint plus the 400 / 404 / 409 paths | `docs/postman/` | done |
| B10 | Teammate guide, video plan, GenAI declaration, peer evaluation draft | `docs/TEAMMATE-GUIDE.md`, `video-script.md`, `genai-declaration.md`, `peer-evaluation-draft.md` | done |
| B11 | **Extra improvements made while testing**: the booking date can no longer be dated after the event was held; the admin list gained a status filter with live counts | `register.ts/html`, `event-list.ts/html/css` | done |
| B12 | **Deploy the API and both sites to my own SCU cPanel** | `docs/deployment.md` | to do |
| B13 | **Record my own video (≤ 15 min) about my half** | `docs/video-script.md` | to do |
| B14 | **My three zip files** with my own SCU username prefix | — | to do |

**B's share: about 3,770 lines of code, tests and documents.**

The two halves are within about 5% of each other. Neither of us is a passenger.

---

## 3. What each of us talks about in the video

The brief says the video must "Focus on your individual contributions". Because
the halves are different, the two videos do not overlap:

* **Member A's video** — the database design (why `UNIQUE(event_id, email)` and
  why the foreign key restricts delete), the event CRUD endpoints, the delete
  rule and its 409, the public site's home and search, and the cPanel
  deployment.
* **Member B's video** — the booking endpoint and its three refusals, the
  weather proxy, the event detail page with the ticket list sorted by purchase
  date, the register form's validation, the admin edit screen, and running the
  Postman collection end to end.

Both videos still open with the same 60-second overview of the site, so the
marker can follow either one alone.

---

## 4. Repository rules we agreed

| Rule | Why |
|---|---|
| Branch `master`, one branch per task: `feature/A4-event-crud`, `feature/B2-weather` | the history reads as a list of completed tasks |
| Commit message: `A4: ...` or `B1: ...` then a blank line, then **why** the change exists | the marker can see who did what without opening every file |
| Each member commits **under their own GitHub account** | the 15% teamwork mark is evidenced by two authors in the history |
| Never commit `.env`, `node_modules` or `dist` | `.gitignore` covers them |
| Push in small batches as work is finished, not everything at the end | the brief warns that failing to show progress can fail the assignment |

---

## 5. What is shared and what is individual

| Item | Shared / individual |
|---|---|
| GitHub repository and its link on the submission | **shared** — one link, both submit it |
| The three zip files | **individual** — own SCU username prefix |
| cPanel deployment | **individual** — the brief says each student deploys to their own |
| Video (≤ 15 min) | **individual** — own contribution |
| Peer evaluation form | **individual and confidential** — emailed to the tutor, not the UA |
| GenAI declaration | **individual** — each declares what they used |

---

## 6. Meetings

| When | What we decided |
|---|---|
| Week 1 | Reused the A2 client site as the base; agreed the A/B split above; created the repository |
| Week 2 | A delivered the database and event CRUD; B delivered bookings, weather and the event detail page |
| Week 3 | A delivered home and search; B delivered the register page and the admin site |
| Week 4 | Joint testing: Postman run, delete rule, duplicate booking, deployment rehearsal; both recorded their own videos |

_(Adjust the weeks to the weeks you actually met — the marker compares this
against the commit dates in the repository.)_

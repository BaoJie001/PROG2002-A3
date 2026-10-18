# A3 — submission checklist

Checked on 18 October 2026 against `PROG2002 A3 Assessment Brief.pdf` and the
UA's reminder email. Everything that can be finished on this machine is
finished; what is left needs your own hands (video, peer evaluation form,
Blackboard upload).

Read this top to bottom before you log into Blackboard.

---

## 1. What is already done

| Item | State |
|---|---|
| Database: `registrations` table, 16 sample rows, one SQL file | ✅ |
| API: full CRUD, 409 rules, weather proxy, health check | ✅ |
| Client site: Home, Search, Event details, Register | ✅ |
| Admin site: list, new, edit, delete, menu on every page | ✅ |
| Both sites built with Angular 22 + TypeScript (bonus) | ✅ |
| Open-Meteo weather API (bonus) | ✅ |
| Jie's deployment — https://24831941.it.scu.edu.au/ | ✅ live, `database: connected` |
| Chengyu's deployment — https://24832054.it.scu.edu.au/ | ✅ live, `database: connected` |
| GitHub — 31 commits, 13 of them Chengyu's, three calendar days | ✅ |
| Three zips per student, with their own GenAI declaration | ✅ |
| **A3 report** (`submission/jbao14A3-report.docx`, `cgao15A3-report.docx`) | ✅ written, 15 pages |

---

## 2. What each of you still has to do

| # | Task | Why |
|---|---|---|
| 1 | Record **your own** video, ≤ 15 min, in English, about **your half** | Brief: "focus on your individual contributions" |
| 2 | Upload the video to SCU OneDrive and make a share link | Brief: "Upload your video to your SCU OneDrive and create a sharable link" |
| 3 | Fill in **your own** peer evaluation form and email it to the **tutor** | Subject must be `PROG2002_A3_[Team_ID]_[Member_name]`. Confidential — do not send your teammate's form for them |
| 4 | Read your copy of the report and make it sound like you | It is attached to your submission and you may be interviewed on it |
| 5 | Push the pending commits (below) | The report, the guides and the charset fix are committed locally but not yet on GitHub |
| 6 | Submit on Blackboard: 3 zips + GitHub link + video link + peer evaluation + **report** | Brief §Deliverables, plus the UA's "attach it to your submission" |

The UA has confirmed that **no team-formation email** and **no tutor invitation
to the repository** are needed, so skip both — the repository just has to be
reachable by the marker when they ask.

---

## 3. Push the pending commits

```bash
cd D:/PROG2002-A3
git status                # should say "working tree clean"
git log --oneline -5      # four commits that GitHub does not have yet
git push origin master
```

If the push is rejected with *"Updates were rejected because the remote
contains work that you do not have locally"*, Chengyu has pushed in the
meantime — do not force anything:

```bash
git pull --rebase origin master
git push origin master
```

---

## 4. What goes on Blackboard

| # | File / link | For |
|---|---|---|
| 1 | `jbao14A3-clientside.zip` / `cgao15A3-clientside.zip` | Public site source |
| 2 | `…-adminside.zip` | Admin site source |
| 3 | `…-api.zip` | API source + the SQL file |
| 4 | `https://github.com/BaoJie001/PROG2002-A3` | Repository link (private; invite the marker if asked) |
| 5 | OneDrive video link | Your demo |
| 6 | Peer evaluation form | Emailed to the tutor, and attached if Blackboard asks |
| 7 | `jbao14A3-report.docx` / `cgao15A3-report.docx` | The report the UA asked us to attach |

The zips are the same code for both of you — that is allowed, the brief only
requires that each of you deploys to your own cPanel and writes your own
report and video.

---

## 5. Compliance check against the brief

### Part 1 — Database (5%)

| Requirement | Where | Status |
|---|---|---|
| New table recording which event a user registered for | `registrations` | ✅ |
| Unique id, user details, registration date, contact, tickets, event link | `registration_id, first_name, last_name, email, phone, tickets, registration_date, event_id` | ✅ |
| Primary and foreign keys | `PRIMARY KEY`, `fk_registration_event … ON DELETE RESTRICT` | ✅ |
| One user many events / only once per event | `UNIQUE (event_id, email)` + 409 from the endpoint | ✅ |
| ≥ 10 registrations of sample data | 16 rows | ✅ |
| `event_db.js` updated | connection pool, utf8mb4, transaction helper | ✅ |
| One SQL file with schema **and** data | `database/charityevents-db.sql` | ✅ |
| Latitude / longitude for the weather API | `events.latitude`, `events.longitude` | ✅ |
| Character set survives an unknown host default | `DEFAULT CHARSET=utf8mb4` on all four tables | ✅ |

### Part 2 — REST API (10%)

| Requirement | Status |
|---|---|
| Single-event endpoint returns the event **plus its registrations** | ✅ `GET /api/events/:id` |
| …sorted by purchase date, newest first | ✅ `ORDER BY registration_date DESC, registration_id DESC` |
| Create / update / delete endpoints | ✅ `POST`, `PUT`, `DELETE /api/events/:id` |
| Delete blocked when registrations exist, with a clear error | ✅ 409 + a message naming the count |
| RESTful URLs, resources not verbs | ✅ query-string filters |
| Security: parameterised SQL, validation, bounded input | ✅ every value bound with `?`; 100 kB body cap; CORS allow-list |
| Postman evidence | ✅ `docs/postman/` |

### Part 3 — Client-side site (30%)

| Requirement | Status |
|---|---|
| Event detail shows all registrations for that event | ✅ "Who is going" |
| Register button links to the registration page | ✅ `routerLink="/register"` + `?eventId=` |
| Registration page: form, event info from the API, submit button | ✅ `pages/register/` |
| Validation with a client-side message | ✅ per-field messages, not one generic alert |
| Confirmation after a successful submit | ✅ |
| Every page calls the API; nothing hard-coded | ✅ |
| **Bonus:** Angular | ✅ Angular 22.2 + TypeScript 6 |
| **Bonus:** external weather API | ✅ Open-Meteo via `/api/weather/:eventId` |

### Part 4 — Admin-side site (30%)

| Requirement | Status |
|---|---|
| Lists **all** events regardless of status | ✅ `?status=all&period=all` + status filter |
| New event form with validation and Save | ✅ `pages/event-new/` |
| Edit form that loads an event **and its bookings** | ✅ `pages/event-edit/` |
| Delete with clear feedback when blocked | ✅ 409 message on screen |
| Menu present on every page | ✅ in the shell component |
| **Bonus:** Angular | ✅ Angular 22.2 + TypeScript 6 |

### Concept understanding (10%) and Teamwork (15%)

| Evidence | Status |
|---|---|
| Code comments that explain *why* | ✅ throughout `api/**` and both apps |
| Work progress in GitHub | ✅ 31 commits, 13 by Chengyu, across 16–18 October |
| Report | ✅ `docs/report/` — 15 pages, requirement-to-evidence appendix |
| Video | ⬜ each of you |
| Peer evaluation | ⬜ each of you |

One cosmetic thing in the history: your own commits appear under two display
names, `BaoJie001` and `Jie Bao`. Both carry `1822675871@qq.com`, so the log
shows two authors, not three. Leave it — rewriting history now would desync
Chengyu's clone for no marks.

---

## 6. Where the marks can still move

The code is at HD level: both sites are Angular, the weather API is in, the
409 rules are enforced in two layers, and both deployments answer
`database: connected`. The remaining 25% (concept understanding + teamwork) is
judged from the video, the peer evaluation and the commit history:

1. **The video is the single biggest risk.** A rushed screen recording that
   reads code aloud reads as "minimal understanding". Explain *why* — why the
   UNIQUE key, why 409 and not 400, why the weather call goes through our API.
2. **The peer evaluation is where a team loses 15% quietly.** Send it before
   the deadline, to the tutor, with the exact subject line.
3. **Say in the video that you know the trade-offs** — no authentication, no
   USER table, no pagination yet. Naming what you left out and why is what
   "exceptional understanding" sounds like.

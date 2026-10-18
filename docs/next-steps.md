# A3 — What to do now that the invitation is accepted

Short version: **the code is finished and working**. What is left is evidence
of teamwork (GitHub), deployment, the two videos, the two peer evaluation
forms, and the Blackboard submission. None of that can be done by someone else
on your behalf — the brief marks it as individual work.

> ⚠️ **Check the due date first.** The brief says *12 October 2026, 11:59 pm*.
> Today is 16 October. Open Blackboard and confirm the real due date (and any
> extension) before you plan anything else. If it has passed, submit today.

---

## 1. Do this today (both of you)

| # | Who | Action | Why the brief wants it |
|---|---|---|---|
| 1 | Jie | Confirm the Blackboard due date and your **Team ID** | Peer evaluation email title needs `PROG2002_A3_[Team_ID]_[Member_name]` |
| 2 | Jie | Email the **UA** (not the tutor) with both student IDs, names and cohort | "Once your team is formed, inform UA by sending an email" |
| 3 | Jie | Invite your **tutor/marker** as a collaborator on the repository | "Ensure it is accessible. You may invite your marker to be a collaborator" |
| 4 | Chengyu | Accept the invitation (done) → `git clone` → make **your own** commits | The 15% teamwork mark is evidenced by two authors in the history |
| 5 | Both | Check the SCU username prefix on the zip files (`JieBaoA3-…`) | Deliverables are `usernameA3-clientside.zip` etc. |

---

## 2. Chengyu's first commits (do them on two different days)

Hand him **`docs/teammate-quickstart.md`** — it is a five-minute card that
needs nothing but Git. The idea: the code is already in the repository, so
re-adding his own files would produce `nothing to commit`. What only he can
supply is *his own information*:

* **Day 1** — fill his Student ID, Cohort and Team ID into the Member B column
  of `docs/teamwork-plan.md`, commit, push.
* **Day 2** (after deploying) — fill his own cPanel URLs into
  `docs/deployment.md`, commit, push.

Two commits on two different days is exactly what "regularly committing" looks
like to a marker. Setup in full:

```bash
git clone https://Carlos-001-max@github.com/BaoJie001/PROG2002-A3.git PROG2002-A3-teammate
cd PROG2002-A3-teammate
git config --local user.name  "Chengyu Gao"
git config --local user.email "190163452+Carlos-001-max@users.noreply.github.com"
```

Full step-by-step instructions: `docs/TEAMMATE-GUIDE.md` (updated — step 7 now
explains why re-committing existing files will not work).

---

## 3. Then, individually (each of you, on your own account)

| Order | Task | Guide |
|---|---|---|
| 1 | Deploy the API + both sites to **your own** SCU cPanel | `docs/deployment.md` (admin site builds with `--base-href=/admin/`) |
| 2 | Record **your** video ≤ 15 min about **your** half | `docs/video-script.md` |
| 3 | Build **your** three zip files with your own username prefix | `submission/` |
| 4 | Email **your** peer evaluation form to the **tutor** (not the UA), titled `PROG2002_A3_[Team_ID]_[Member_name]` | `docs/peer-evaluation-draft.md` + the form in the Assessment 3 folder |
| 5 | Submit to Blackboard: 3 zips + GitHub link + video link + peer evaluation | brief §Deliverables |

Nothing in step 1–4 may be shared or copied from your teammate: the brief says
each student deploys to their own cPanel, and the peer evaluation is
confidential.

---

## 4. Compliance check against the brief

Checked on 16 October 2026 against `PROG2002 A3 Assessment Brief.pdf`.

### Part 1 — Database (5%)

| Requirement | Where | Status |
|---|---|---|
| New table recording which event a user registered for | `registrations` | ✅ |
| Unique id, user details, registration date, contact, tickets, event link | `registration_id, first_name, last_name, email, phone, tickets, registration_date, event_id` | ✅ |
| Primary and foreign keys | `PRIMARY KEY`, `fk_registration_event … ON DELETE RESTRICT` | ✅ |
| One user may register many times / only once per event | `UNIQUE (event_id, email)` + endpoint returns 409 | ✅ |
| ≥ 10 registrations of sample data | 16 rows in `database/charityevents-db.sql` | ✅ |
| `event_db.js` updated | connection pool + transaction helper | ✅ |
| One SQL file with schema **and** data | `database/charityevents-db.sql` | ✅ |
| Latitude / longitude for the weather API | `events.latitude`, `events.longitude` | ✅ |

### Part 2 — REST API (10%)

| Requirement | Status |
|---|---|
| Single-event endpoint returns the event **plus its registrations** | ✅ `GET /api/events/:id` |
| …sorted by the date the tickets were bought, newest first | ✅ `ORDER BY registration_date DESC, registration_id DESC` (verified live) |
| Create / update / delete endpoints | ✅ `POST`, `PUT`, `DELETE /api/events/:id` |
| Delete blocked when registrations exist, with a clear error | ✅ 409 + message (verified live) |
| Intuitive, logical URLs; resources not verbs | ✅ query-string filters, not `/by-date` |
| Security: parameterised SQL, validation, no leakage | ✅ all values bound with `?`; errors logged server-side |
| Postman evidence | ✅ 21 requests + environment in `docs/postman/` |

### Part 3 — Client-side site (30%)

| Requirement | Status |
|---|---|
| Event detail shows all registrations for that event | ✅ "Who is going" |
| Register button links to the new registration page | ✅ `routerLink="/register"` + `?eventId=` |
| Registration page: form, event info from the API, submit button | ✅ `pages/register/` |
| Client-side validation with an alert | ✅ reactive form validators |
| Calls the API and shows a confirmation | ✅ |
| Pages call APIs (nothing is hard-coded) | ✅ |
| **Bonus:** built with Angular | ✅ Angular 22 + TypeScript |
| **Bonus:** external weather API | ✅ Open-Meteo via `/api/weather` |

### Part 4 — Admin-side site (30%)

| Requirement | Status |
|---|---|
| Lists **all** events regardless of status (Active / Past / Suspended) | ✅ `?status=all&period=all` + status filter with live counts |
| New event form with validation and a Save button | ✅ `pages/event-new/` |
| Edit form that loads an event **and its registrations** | ✅ `pages/event-edit/` |
| Delete button with clear feedback when blocked | ✅ 409 message shown on screen |
| Menu present on every page | ✅ `adminside/src/app/app.html` |
| **Bonus:** built with Angular | ✅ Angular 22 + TypeScript |

### Concept understanding (10%) and Teamwork (15%)

| Evidence | Status |
|---|---|
| Code comments that explain *why* | ✅ across `api/**` and both Angular apps |
| Work progress in GitHub | ⚠️ 24 commits, 12 by each member — **but all pushed on 16 October**. Chengyu must add his own commits on two separate days, otherwise "regularly committing" is not demonstrated |
| Video | ⬜ each of you, ≤ 15 min |
| Peer evaluation | ⬜ each of you, emailed to the tutor |

---

## 5. What is still missing for a High Distinction

HD = "effectively and efficiently **without errors**", plus the bonuses. The
code side is there. The two gaps that can still cost marks are both
non-technical:

1. **Deployed and publicly working.** Both criteria say *design, develop, and
   deploy*. An undeployed site cannot score full marks on 30% + 30%. Deploy
   early, then test every page on the public URL, not just on localhost.
2. **Chengyu's own commits.** Right now the history shows 12:12, but all of it
   was pushed from one machine. His own clone-and-commit is what turns the
   15% teamwork criterion into real evidence.

Optional extras that push further: HTTPS on the cPanel URL, a short
`README` section on the API contract, and mentioning the 409 rules in the
video (they are the clearest sign of "exceptional understanding").

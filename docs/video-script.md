# Demo video plan — Assessment 3 (max 15 minutes)

The brief asks the video to cover three questions, and to focus on **your own
contribution**. Timings below add up to about 13 minutes, leaving room to
breathe. Everything you need is on screen already: keep the code editor, the
browser and Postman open before you start recording.

---

## Which half is whose

We record **two separate videos**. The first 60 seconds (the project overview)
are the same; from there on each of us only presents their own modules, so the
two videos do not repeat each other and neither of us presents work we cannot
explain.

| | Member A — Jie Bao (包杰) | Member B — teammate |
|---|---|---|
| Database | schema, foreign keys, `UNIQUE(event_id, email)`, the view | — |
| API | events CRUD, pooling, server, the delete rule and its 409 | registrations, validation, weather proxy, categories, organisations |
| Client site | shell, home, search, services, models, styles | event detail (ticket list sorted by purchase date), register page, event card |
| Admin site | event list, new event, status filter, global styles | edit screen, shared event form, admin service |
| Testing | manual walkthrough of the public site | the whole Postman collection, including 400 / 404 / 409 |
| Deployment | own cPanel walkthrough | own cPanel walkthrough |

**Member A follows the timings below as written.**

**Member B uses the same three sections but swaps in these items:**

* *Question 1 (database and API)* — the three refusals built into
  `POST /api/registrations` (duplicate email, finished event, suspended event),
  and why the forecast is fetched by our server rather than the browser.
* *Question 2 (data flow)* — how the event page renders the ticket list sorted
  by purchase date, and how the register form's validation reaches the user.
* *Question 3 (the websites)* — the admin **edit** screen with that event's
  registrations, the status filter, then the Postman run.

Say "this part was mine" when it was, and name the other half as your
teammate's — the marker cross-checks this against the commit history.

---

## 0:00 – 0:45 Introduce the project

> "This is Giving Coast, the Assessment 3 build. Two websites — the public site
> and the staff admin — both Angular 22 with TypeScript, both talking to one
> Express API over MySQL. I'll cover the database and API design, the data flow
> from a click through to the DOM, then demo both sites. I'll say which parts
> were mine as I go."

Show: repository folder structure (database / api / clientside / adminside).

---

## 0:45 – 3:30 Question 1 — Database and API architecture (ULO3)

**Say what you decided, then why.**

1. `database/charityevents-db.sql`
   * `organisations` → `events` → `registrations`: show the two foreign keys.
   * `UNIQUE (event_id, email)` — this is the rule "one person, one booking per
     event", enforced by MySQL itself, not by hope.
   * `ON DELETE RESTRICT` on `registrations.event_id` — the database refuses to
     orphan a booking.
   * `latitude` / `longitude` — added for the weather API.
   * `v_event_summary` — pre-aggregated counts so the admin list is one query.
2. `api/routes/events.js`
   * `GET /api/events/:id` — the same endpoint now returns the event **and** its
     registrations, ordered newest-purchase-first. Point at the SQL
     `ORDER BY registration_date DESC, registration_id DESC`.
   * `POST` / `PUT` / `DELETE` — walk the validation function, then the
     `DELETE` guard: count registrations → 409 with an explanation.
3. **Postman**: run `DELETE /api/events/5` and show the 409 body, then
   `DELETE` on an event with no registrations and show the success.

Say which files you wrote. (← your contribution)

---

## 3:30 – 6:30 Question 2 — Data flow, click to DOM (ULO1 + ULO3)

The full round trip, narrated in this order:

1. **Component** — `clientside/src/app/pages/home/home.ts`:
   `Promise.all([getUpcomingEvents(), getPastEvents()])`.
2. **Service** — `services/events-api.service.ts`:
   `HttpClient` → `firstValueFrom()` → a Promise; why a Promise (one-shot
   request) and where the error message is flattened.
3. **Wire** — DevTools Network tab: click Home, show `GET /api/events`, show
   the JSON.
4. **Server** — `api/routes/events.js` → `event_db.js` → the parameterised SQL
   (`?` placeholders = no injection).
5. **Back to the DOM** — `components/event-card/event-card.html`: signal
   `event()` input, `@for` loop, one card per row. Click an event and show the
   detail page building from the same data.

Finish this section with the registration POST:
form → `POST /api/registrations` → `201` → confirmation message.

---

## 6:30 – 10:30 Question 3 — Live demo

**Public site (localhost:4200)**

* Home: upcoming + past sections.
* Search: pick a date, a suburb and a category; show the URL query string;
  then pick a **past date** and show the validation message.
* Event page: the **attendee list** (new in A3) with the sort order, and the
  **weather panel** from Open-Meteo.
* Register: fill in the form, submit, show the confirmation, then reload the
  event page and show your new row at the top of the list. Try the same email
  again to show the duplicate guard.

**Admin site (localhost:4201)**

* List: 13 events, including the suspended one and finished ones.
* New: create an event, watch it appear on the public site.
* Edit: open an event, show its registrations underneath, change the ticket
  price, save, and show the change on the public site.
* Delete: delete the event you just made (allowed), then try one with
  registrations (refused, with the reason).

---

## 10:30 – 12:30 Deployment + the extras

* Show `docs/deployment.md` and the cPanel layout: `public_html`,
  `public_html/admin`, Node app at `/api`.
* Show `/api/health` in the browser and explain what it proves.
* Mention the two deliberate extras: Angular 22 + TypeScript, and the
  Open-Meteo integration (proxied and cached, degrades quietly).

---

## 12:30 – 13:30 Wrap up

* Restate your own contribution in one sentence per area (e.g. "I wrote the
  database changes and the events route; my partner built X").
* One thing you would do next.

---

## Recording checklist

- [ ] MySQL running, API on 3000, both dev servers up
- [ ] Postman collection open with the DELETE requests ready
- [ ] Browser zoomed to ~125% so the code is readable
- [ ] Close unrelated tabs and notifications
- [ ] Export, upload to SCU OneDrive, create an **"anyone with the link"** link

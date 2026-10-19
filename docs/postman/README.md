# Running the Postman collection

23 requests with assertions, covering every endpoint plus the error paths the
brief asks us to have thought about (400, 404, 409).

> If you have never used Postman before, `docs/postman-guide-chengyu.md`
> walks through it click by click — import, environment, which five requests
> matter for the video, and what to do when everything is red.

## 1. Import

Postman → **Import** → select both files:

* `Giving-Coast-A3.postman_collection.json`
* `Giving-Coast-A3.postman_environment.json`

Select the **Giving Coast A3** environment in the top-right corner. It has one
variable, `base_url`:

| Where you are running | `base_url` |
|---|---|
| local dev server | `http://localhost:3000` |
| your cPanel deployment | `https://<you>.scu.edu.au` |

Because the whole collection reads `{{base_url}}`, the same file tests both.

## 2. Collection variables

| Variable | Default | Meaning |
|---|---|---|
| `event_id` | `5` | an event that **has** registrations — used by the detail request, the registration list and the blocked delete |
| `new_event_id` | empty | filled in automatically by "Admin - create an event", then used by update and delete |

## 3. Run it

Click **…** on the collection → **Run collection** → **Run Giving Coast A3**.
All 23 should be green.

## 4. The three refusals worth looking at

These are the ones that show the API protects the data instead of just moving
it around:

| Request | Expected |
|---|---|
| `Admin - delete blocked because people booked (409)` | **409**, and the body says how many registrations are attached |
| `Registrations - duplicate booking (409)` | **409** — the same email books the same event twice |
| `Registrations - booking a finished event (409)` | **409** — the event date has passed |
| `Registrations - booking a suspended event (409)` | **409** — the event is not active |
| `Registrations - booking dated in the future (400)` | **400**, naming `registration_date` — a malformed request, unlike the three above |
| `Events - invalid filter (400)` | **400** with a per-field message |
| `Events - unknown id (404)` | **404** |

## 5. If something is red

| Symptom | Cause |
|---|---|
| every request fails to connect | API not running, or `base_url` wrong → open `{{base_url}}/api/health` in a browser first |
| `Events - detail with registrations` is empty | `event_id` points at an event with no bookings — set it to `5` |
| create/update chain fails | run them **in order**: create writes `new_event_id`, update and delete read it |
| delete returns 409 on the wrong event | the request is using `{{event_id}}` (5, which has bookings) — that one is *meant* to fail |

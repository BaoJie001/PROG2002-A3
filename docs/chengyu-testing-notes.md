# My testing notes — Chengyu Gao

These are the checks I ran on my own half of the project, and what each one
was actually proving. I keep them here because the video and the report both
claim these things, and this is where the claim is backed up.

---

## 1. The three ways a booking is refused

`POST /api/registrations` can refuse a booking for three reasons that have
nothing to do with each other, and all three answer **409 Conflict**:

| Situation | Message the caller gets |
|---|---|
| The event is suspended | "Registrations for this event are closed." |
| The event has already happened | "This event has already finished and can no longer be booked." |
| This email already booked this event | "This email address is already registered for that event." |

**Why 409 and not 400.** A 400 means "your request is malformed". None of these
requests is malformed — the JSON is fine, every field is valid. The request
cannot be carried out because of the state the world is in. That is the
definition of 409, and the difference matters to the front end: a 409 can be
printed straight to the user as an explanation, while a 400 means the form
itself needs correcting.

I checked this by hand with each of the three events in the sample data
(one suspended, one in the past, one active) rather than trusting the code.

### The one that is a race, not a rule

The duplicate check runs a `SELECT` before the `INSERT`. Two people submitting
the same address in the same instant can both pass that check, so the endpoint
also catches MySQL error 1062 and answers with the same friendly 409. The
`UNIQUE (event_id, email)` key in the database gets the last word.

I could not make that race happen on purpose, and I am not going to claim I
tested it. What I did verify is that the 1062 branch is reachable, by sending
a duplicate insert directly against the database and confirming the route
turns it into a 409 rather than a 500.

---

## 2. The booking date ceiling

The register form puts a `max` attribute on the date input. While testing I
removed that attribute in the browser's inspector and submitted a booking
dated after the event, and it was accepted — which is the whole point of that
attribute: it is a hint to the browser, not a guarantee to the server.

So the server now checks the ceiling as well and answers **400** with the
offending field, because this one genuinely is a malformed request. The rule
exists in two places on purpose, and only one of them can be trusted.

---

## 3. Weather

`GET /api/weather/:eventId` is a proxy, and I tested the boring cases because
those are the ones that break a demo:

- an event with coordinates and a date inside the forecast horizon → a real
  forecast, cached for ten minutes;
- the same request twice within ten minutes → the second one does not hit
  Open-Meteo (I watched the logs);
- an event whose date is beyond the horizon → `available: false`, and the page
  simply hides the panel instead of showing an empty box;
- Open-Meteo unreachable (I blocked it on purpose) → still `available: false`,
  and **the event page itself still loads**. An optional feature must never be
  able to break a required one.

---

## 4. The Postman collection

`docs/postman/` holds 20 requests, and the ones I care about are the failures:

| Request | Expected |
|---|---|
| Delete an event that has bookings | **409**, and the message names the number of bookings |
| Register twice with the same email | **409** |
| Register for a past event | **409** |
| Register with a booking date after the event | **400**, pointing at `registration_date` |
| Unknown event id | **404** |
| Bad filter value | **400** |

A collection that only tests the happy path proves nothing, so the failing
cases are written down here and asserted in the collection rather than left to
memory.

---

## 5. What I got wrong, and what it cost

On cPanel the API answered `Access denied for user root@localhost`. I spent a
long time looking at the connection string before I read the message properly:
it names the user (`root`) and the host (`localhost`), and neither was what I
had configured — which meant no credentials were being read at all and MySQL
was falling back to defaults. The variables had been typed into the cPanel
form but never applied. We moved to a `.env` file read by dotenv so the
configuration is explicit and visible.

The lesson I wrote in the report is the one I actually learned: an error
message that names a user and a host is telling you where to look, and I had
been looking somewhere else.

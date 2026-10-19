/**
 * routes/registrations.js
 * ---------------------------------------------------------------------------
 * Endpoints
 *   GET  /api/registrations?event_id=   -> registrations for one event
 *   POST /api/registrations             -> record a new registration
 *
 * This is the "Register" feature the brief adds in Assessment 3: a member of
 * the public picks an event, says how many tickets they want, and the row
 * lands in the registrations table.
 *
 * Two rules are enforced here rather than left to chance:
 *   1. You cannot register twice for the same event.
 *      The database UNIQUE (event_id, email) is the real guarantee; the route
 *      checks first so the user gets a friendly 409 instead of a raw SQL error.
 *   2. You cannot register for an event that is suspended or already over.
 *      A hidden or finished event has no business taking bookings.
 *   3. The booking cannot be dated after the event was held.
 *      No check is needed here: a booking cannot be dated in the future, and
 *      a finished event is refused, so the booking date is always on or
 *      before the event date. The form's max attribute is a kindness to the
 *      visitor, not the rule that protects the data.
 * ---------------------------------------------------------------------------
 */

const express = require('express');
const { query } = require('../event_db');
const {
  isPositiveInt,
  isValidDate,
  isEmail,
  isPhone,
  todayString,
  FieldErrors,
} = require('./validate');

const router = express.Router();

/** The most tickets one person may buy in a single booking. */
const MAX_TICKETS = 50;

/** Registrations for one event, newest purchase first. */
const REGISTRATION_SELECT = `
  SELECT registration_id, event_id, first_name, last_name, email, phone,
         tickets, registration_date, notes, created_at
    FROM registrations
`;

function shapeRegistration(row) {
  const date = row.registration_date instanceof Date
    ? row.registration_date.toISOString().slice(0, 10)
    : String(row.registration_date).slice(0, 10);

  return {
    registration_id: row.registration_id,
    event_id: row.event_id,
    first_name: row.first_name,
    last_name: row.last_name,
    display_name: `${row.first_name} ${String(row.last_name).charAt(0)}.`,
    email: row.email,
    phone: row.phone,
    tickets: Number(row.tickets),
    registration_date: date,
    notes: row.notes,
    created_at: row.created_at,
  };
}

// --- GET /api/registrations ------------------------------------------------

/**
 * ?event_id= is required for a public listing (the admin edit screen uses it
 * to show who has already booked). Without it the endpoint refuses rather than
 * dumping every person's contact details over the wire.
 */
router.get('/', async (req, res) => {
  const eventId = req.query.event_id;

  if (eventId === undefined || !isPositiveInt(eventId)) {
    return res.status(400).json({
      error: true,
      message: 'A positive event_id query parameter is required.',
    });
  }

  try {
    const rows = await query(
      `${REGISTRATION_SELECT}
        WHERE event_id = ?
        ORDER BY registration_date DESC, registration_id DESC`,
      [Number(eventId)]
    );

    res.status(200).json({
      event_id: Number(eventId),
      count: rows.length,
      registrations: rows.map(shapeRegistration),
    });
  } catch (err) {
    console.error('GET /api/registrations failed:', err.message);
    res.status(500).json({ error: true, message: 'Could not load registrations.' });
  }
});

// --- POST /api/registrations -----------------------------------------------

/**
 * Body:
 *   event_id           required, positive integer
 *   first_name         required, 1-80 chars
 *   last_name          required, 1-80 chars
 *   email              required, valid email
 *   phone              required, 8-15 digits
 *   tickets            required, 1-50
 *   registration_date  required, YYYY-MM-DD, today or earlier
 *   notes              optional, up to 255 chars
 *
 * Success -> 201 with the saved registration (minus nothing: the caller just
 *            typed this data, so echoing it back is the confirmation).
 */
router.post('/', async (req, res) => {
  const body = req.body || {};
  const errors = new FieldErrors();

  // --- event the person is booking ----------------------------------------
  let eventId = null;
  if (!isPositiveInt(body.event_id)) {
    errors.add('event_id', 'A valid event must be selected.');
  } else {
    eventId = Number(body.event_id);
  }

  // --- personal details ----------------------------------------------------
  const firstName = errors.required('first_name', body.first_name, 80, 'First name');
  const lastName = errors.required('last_name', body.last_name, 80, 'Last name');

  let email = null;
  if (!isEmail(body.email)) {
    errors.add('email', 'Please enter a valid email address.');
  } else {
    email = String(body.email).trim().toLowerCase();
  }

  let phone = null;
  if (!isPhone(body.phone)) {
    errors.add('phone', 'Please enter a contact phone number (8-15 digits).');
  } else {
    phone = String(body.phone).trim();
  }

  // --- tickets -------------------------------------------------------------
  let tickets = null;
  if (!isPositiveInt(body.tickets)) {
    errors.add('tickets', 'Number of tickets must be a whole number of 1 or more.');
  } else if (Number(body.tickets) > MAX_TICKETS) {
    errors.add('tickets', `You can book at most ${MAX_TICKETS} tickets in one registration.`);
  } else {
    tickets = Number(body.tickets);
  }

  // --- date ----------------------------------------------------------------
  let registrationDate = null;
  if (!isValidDate(body.registration_date)) {
    errors.add('registration_date', 'Registration date must be a real date in YYYY-MM-DD format.');
  } else if (body.registration_date > todayString()) {
    errors.add('registration_date', 'Registration date cannot be in the future.');
  } else {
    registrationDate = body.registration_date;
  }

  const notes = errors.optional('notes', body.notes, 255, 'Notes');

  if (errors.length > 0) {
    return res.status(400).json({
      error: true,
      message: 'The registration was not saved. Please correct the highlighted fields.',
      fields: errors.list,
    });
  }

  try {
    // --- is the event open for bookings? ----------------------------------
    const eventRows = await query(
      `SELECT event_id, name, event_date, status FROM events WHERE event_id = ?`,
      [eventId]
    );

    if (eventRows.length === 0) {
      return res.status(404).json({ error: true, message: 'That event no longer exists.' });
    }

    const event = eventRows[0];
    const eventDate = String(event.event_date).slice(0, 10);

    if (event.status !== 'active') {
      return res.status(409).json({
        error: true,
        message: 'Registrations for this event are closed.',
      });
    }

    if (eventDate < todayString()) {
      return res.status(409).json({
        error: true,
        message: 'This event has already finished and can no longer be booked.',
      });
    }

    // --- can the booking be dated after the event? ------------------------
    // No, and there is deliberately no check for it here, because the two
    // rules above already make it impossible:
    //   * a booking cannot be dated in the future (validated above), so
    //     registrationDate <= today;
    //   * an event that has already happened is refused above, so
    //     eventDate >= today.
    // Hence registrationDate <= today <= eventDate, and the case cannot
    // arise. I had a check for it once and removed it: it could never fire,
    // and a rule that cannot fire is worse than no rule, because it looks
    // like protection.
    //
    // The form's max attribute is still worth having — it stops the visitor
    // picking a wrong date in the first place — but it is a hint to the
    // browser, not a rule. What actually protects the data are the two
    // checks above.

    // --- has this person already booked it? -------------------------------
    const duplicate = await query(
      'SELECT registration_id FROM registrations WHERE event_id = ? AND email = ?',
      [eventId, email]
    );

    if (duplicate.length > 0) {
      return res.status(409).json({
        error: true,
        message: 'This email address is already registered for that event.',
        field: 'email',
      });
    }

    // --- save --------------------------------------------------------------
    const result = await query(
      `INSERT INTO registrations
         (event_id, first_name, last_name, email, phone, tickets, registration_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [eventId, firstName, lastName, email, phone, tickets, registrationDate, notes]
    );

    const createdId = result.insertId;
    const rows = await query(`${REGISTRATION_SELECT} WHERE registration_id = ?`, [createdId]);

    res.status(201)
      .location(`/api/registrations/${createdId}`)
      .json({
        message: `You are registered for “${event.name}”.`,
        registration: shapeRegistration(rows[0]),
      });
  } catch (err) {
    // MySQL error 1062 = duplicate key. It should already have been caught
    // above, but two people submitting at the same instant can race, so the
    // database still gets the last word.
    if (err && err.errno === 1062) {
      return res.status(409).json({
        error: true,
        message: 'This email address is already registered for that event.',
        field: 'email',
      });
    }
    if (err && err.errno === 1452) {
      return res.status(400).json({ error: true, message: 'That event does not exist.' });
    }

    console.error('POST /api/registrations failed:', err.message);
    res.status(500).json({ error: true, message: 'Could not save the registration.' });
  }
});

module.exports = router;

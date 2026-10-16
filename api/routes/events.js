/**
 * routes/events.js
 * ---------------------------------------------------------------------------
 * Endpoints
 *   GET    /api/events           -> events for the home page / search results
 *   GET    /api/events/past      -> events that have already finished
 *   GET    /api/events/:id       -> one event PLUS its list of registrations
 *   POST   /api/events           -> create an event            (admin-side)
 *   PUT    /api/events/:id       -> update an event            (admin-side)
 *   DELETE /api/events/:id       -> delete an event            (admin-side)
 *
 * The four verbs above are the full C.R.U.D. cycle the brief asks for. Two
 * deliberate design decisions are worth stating out loud:
 *
 * 1. Filtering stays in the query string.
 *    /api/events?date=&location=&category= filters the collection; it does not
 *    create /api/events/by-date and friends. One predictable URL per resource
 *    is what makes a REST API learnable. The admin screens add ?status=all and
 *    ?period=all so they can see suspended and finished events - the same
 *    endpoint, a wider filter.
 *
 * 2. DELETE is blocked, not silent.
 *    An event that people have already registered for must not vanish. The
 *    route counts registrations first and answers 409 Conflict with an
 *    explanation; the foreign key ON DELETE RESTRICT is the backstop in case
 *    something bypasses the API entirely.
 *
 * Security
 *   * Every user supplied value is bound with a ? placeholder - no string is
 *     ever concatenated into SQL, so injection is not possible.
 *   * Input is validated before it reaches the database; malformed input gets
 *     a 400 with a per-field explanation.
 *   * Internal error text goes to the console, never to the browser.
 * ---------------------------------------------------------------------------
 */

const express = require('express');
const { query } = require('../event_db');
const {
  isPositiveInt,
  isValidDate,
  isValidTime,
  isNonNegativeNumber,
  isValidLatitude,
  isValidLongitude,
  FieldErrors,
} = require('./validate');

const router = express.Router();

// --- shared SQL ------------------------------------------------------------

/**
 * The columns every page needs. Organiser and category are joined in so the
 * front end never needs a second request just to show a name.
 *
 * The two sub-selects give the admin list its registration counts in the same
 * round trip. They are correlated sub-queries rather than a JOIN + GROUP BY
 * on purpose: a LEFT JOIN would force every column into the GROUP BY and would
 * break the moment an event has no registrations at all.
 */
const EVENT_SELECT = `
  SELECT e.event_id,
         e.name,
         e.summary,
         e.description,
         e.event_date,
         e.start_time,
         e.end_time,
         e.venue,
         e.suburb,
         e.city,
         e.state,
         e.latitude,
         e.longitude,
         e.ticket_price,
         e.goal_amount,
         e.raised_amount,
         e.status,
         e.created_at,
         c.category_id,
         c.name        AS category_name,
         c.icon        AS category_icon,
         c.image_url   AS category_image,
         o.organisation_id,
         o.name        AS organisation_name,
         o.logo_icon   AS organisation_icon,
         o.mission     AS organisation_mission,
         o.contact_email,
         o.contact_phone,
         o.website,
         (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.event_id) AS registration_count,
         (SELECT COALESCE(SUM(r.tickets), 0) FROM registrations r WHERE r.event_id = e.event_id) AS tickets_sold
    FROM events e
    JOIN categories c     ON c.category_id     = e.category_id
    JOIN organisations o  ON o.organisation_id = e.organisation_id
`;

/** Registrations for one event, newest purchase first (see ORDER BY below). */
function selectRegistrations(eventId) {
  return query(
    `SELECT registration_id, event_id, first_name, last_name, email, phone,
            tickets, registration_date, notes, created_at
       FROM registrations
      WHERE event_id = ?
      ORDER BY registration_date DESC, registration_id DESC`,
    [eventId]
  );
}

// --- shaping ---------------------------------------------------------------

/**
 * Date -> 'YYYY-MM-DD' using the LOCAL calendar date.
 * toISOString() must not be used here: it converts to UTC first, which shifts
 * every date back by one day for anyone east of Greenwich.
 */
function toDateString(value) {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return String(value).slice(0, 10);
}

function todayString() {
  return toDateString(new Date());
}

/** Shapes one row into the JSON object both websites consume. */
function shapeEvent(row) {
  if (!row) return null;

  const eventDate = toDateString(row.event_date);
  const goal = Number(row.goal_amount) || 0;
  const raised = Number(row.raised_amount) || 0;
  const progress = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

  return {
    event_id: row.event_id,
    name: row.name,
    summary: row.summary,
    description: row.description,
    event_date: eventDate,
    start_time: row.start_time,
    end_time: row.end_time,
    venue: row.venue,
    suburb: row.suburb,
    city: row.city,
    state: row.state,
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    location: [row.venue, row.suburb, row.city].filter(Boolean).join(', '),
    ticket_price: Number(row.ticket_price),
    goal_amount: goal,
    raised_amount: raised,
    progress_percentage: progress,
    status: row.status,
    is_past: eventDate < todayString(),
    registration_count: Number(row.registration_count) || 0,
    tickets_sold: Number(row.tickets_sold) || 0,
    category: {
      category_id: row.category_id,
      name: row.category_name,
      icon: row.category_icon,
      image_url: row.category_image,
    },
    organisation: {
      organisation_id: row.organisation_id,
      name: row.organisation_name,
      icon: row.organisation_icon,
      mission: row.organisation_mission,
      contact_email: row.contact_email,
      contact_phone: row.contact_phone,
      website: row.website,
    },
  };
}

/**
 * Shapes one registration row.
 * `name` is a convenience field so templates can stay simple; the surname is
 * shortened to an initial so the public page never publishes a full name.
 */
function shapeRegistration(row) {
  return {
    registration_id: row.registration_id,
    event_id: row.event_id,
    first_name: row.first_name,
    last_name: row.last_name,
    display_name: `${row.first_name} ${String(row.last_name).charAt(0)}.`,
    email: row.email,
    phone: row.phone,
    tickets: Number(row.tickets),
    registration_date: toDateString(row.registration_date),
    notes: row.notes,
    created_at: row.created_at,
  };
}

// --- validation helpers ----------------------------------------------------

function readCriteria(req) {
  const criteria = { date: null, location: null, category: null };

  if (req.query.date !== undefined && req.query.date !== '') {
    const date = String(req.query.date).trim();
    if (!isValidDate(date)) {
      return { badRequest: 'Date must be a real date in YYYY-MM-DD format.' };
    }
    criteria.date = date;
  }

  if (req.query.location !== undefined && req.query.location !== '') {
    const location = String(req.query.location).trim();
    if (location.length === 0 || location.length > 80) {
      return { badRequest: 'Location must be between 1 and 80 characters.' };
    }
    criteria.location = location;
  }

  if (req.query.category !== undefined && req.query.category !== '') {
    const category = String(req.query.category).trim();
    if (!isPositiveInt(category)) {
      return { badRequest: 'Category must be a valid category id.' };
    }
    criteria.category = Number(category);
  }

  return { criteria };
}

/**
 * Validates the body of POST /api/events and PUT /api/events/:id.
 *
 * @param {object}  body
 * @param {boolean} partial  true for PUT: a missing field means "leave it
 *                           alone" instead of "this is an error".
 * @returns {{ values: object, errors: Array } | { errors: Array }}
 */
function readEventPayload(body, partial) {
  const errors = new FieldErrors();
  const values = {};
  const put = (field, value) => {
    if (value !== undefined) values[field] = value;
  };

  // --- foreign keys --------------------------------------------------------
  for (const field of ['organisation_id', 'category_id']) {
    const raw = body[field];
    if (raw === undefined && partial) continue;
    if (!isPositiveInt(raw)) {
      errors.add(field, `${field} must be a positive whole number.`);
    } else {
      values[field] = Number(raw);
    }
  }

  // --- text ---------------------------------------------------------------
  // (field, key in body, max length, human label, required)
  const textFields = [
    ['name', 'name', 150, 'Event name'],
    ['summary', 'summary', 255, 'Summary'],
    ['description', 'description', 8000, 'Description'],
    ['venue', 'venue', 150, 'Venue'],
    ['suburb', 'suburb', 80, 'Suburb'],
    ['city', 'city', 80, 'City'],
    ['state', 'state', 20, 'State'],
  ];

  for (const [field, , maxLength, label] of textFields) {
    const raw = body[field];
    if (raw === undefined && partial) continue;

    const required = !partial && ['name', 'description', 'venue', 'city'].includes(field);
    const cleaned = required
      ? errors.required(field, raw, maxLength, label)
      : errors.optional(field, raw, maxLength, label);

    if (cleaned === null && raw !== undefined && !partial && !required) continue;
    put(field, cleaned);
  }

  // --- dates and times -----------------------------------------------------
  if (body.event_date !== undefined || !partial) {
    if (!isValidDate(body.event_date)) {
      errors.add('event_date', 'event_date must be a real date in YYYY-MM-DD format.');
    } else {
      values.event_date = body.event_date;
    }
  }

  if (body.start_time !== undefined || !partial) {
    if (!isValidTime(body.start_time)) {
      errors.add('start_time', 'start_time must be HH:MM (24 hour).');
    } else {
      values.start_time = body.start_time;
    }
  }

  if (body.end_time !== undefined) {
    if (body.end_time === '' || body.end_time === null) {
      values.end_time = null;
    } else if (!isValidTime(body.end_time)) {
      errors.add('end_time', 'end_time must be HH:MM (24 hour) or empty.');
    } else {
      values.end_time = body.end_time;
    }
  }

  // --- money ---------------------------------------------------------------
  for (const field of ['ticket_price', 'goal_amount', 'raised_amount']) {
    const raw = body[field];
    if (raw === undefined && partial) continue;
    if (raw === undefined) {
      values[field] = 0; // POST with the field omitted means "free / no target"
      continue;
    }
    if (!isNonNegativeNumber(raw)) {
      errors.add(field, `${field} must be a number of zero or more.`);
    } else {
      values[field] = Number(raw);
    }
  }

  // --- status --------------------------------------------------------------
  if (body.status !== undefined || !partial) {
    const status = body.status === undefined ? 'active' : body.status;
    if (!['active', 'suspended'].includes(status)) {
      errors.add('status', "status must be 'active' or 'suspended'.");
    } else {
      values.status = status;
    }
  }

  // --- coordinates (needed by the Open-Meteo weather API) ------------------
  for (const [field, check, bounds] of [
    ['latitude', isValidLatitude, 'between -90 and 90'],
    ['longitude', isValidLongitude, 'between -180 and 180'],
  ]) {
    const raw = body[field];
    if (raw === undefined && partial) continue;
    if (raw === undefined || raw === '' || raw === null) {
      values[field] = null;
      continue;
    }
    if (!check(raw)) {
      errors.add(field, `${field} must be a number ${bounds}.`);
    } else {
      values[field] = Number(raw);
    }
  }

  if (errors.length > 0) return { errors: errors.list };
  return { values, errors: [] };
}

/**
 * Confirms the organisation and category actually exist, so a bad id produces
 * a helpful 400 instead of an opaque foreign-key error from MySQL.
 */
async function checkForeignKeys(values, errors) {
  if (values.organisation_id !== undefined) {
    const rows = await query('SELECT organisation_id FROM organisations WHERE organisation_id = ?', [
      values.organisation_id,
    ]);
    if (rows.length === 0) {
      errors.push({ field: 'organisation_id', message: 'That organisation does not exist.' });
    }
  }
  if (values.category_id !== undefined) {
    const rows = await query('SELECT category_id FROM categories WHERE category_id = ?', [
      values.category_id,
    ]);
    if (rows.length === 0) {
      errors.push({ field: 'category_id', message: 'That category does not exist.' });
    }
  }
  return errors;
}

// --- GET /api/events -------------------------------------------------------

/**
 * Home page    -> GET /api/events
 * Search page  -> GET /api/events?date=&location=&category=
 * Admin list   -> GET /api/events?status=all&period=all
 *
 *   status = active (default) | suspended | all
 *   period = upcoming (default) | past | all
 */
router.get('/', async (req, res) => {
  const { criteria, badRequest } = readCriteria(req);
  if (badRequest) {
    return res.status(400).json({ error: true, message: badRequest });
  }

  const status = String(req.query.status || 'active');
  const period = String(req.query.period || 'upcoming');

  if (!['active', 'suspended', 'all'].includes(status)) {
    return res.status(400).json({ error: true, message: "status must be 'active', 'suspended' or 'all'." });
  }
  if (!['upcoming', 'past', 'all'].includes(period)) {
    return res.status(400).json({ error: true, message: "period must be 'upcoming', 'past' or 'all'." });
  }

  const where = [];
  const params = [];

  if (status !== 'all') {
    where.push('e.status = ?');
    params.push(status);
  }

  // A search for a specific day means "on this day", so it replaces the
  // upcoming/past rule rather than widening it - otherwise asking for one day
  // would return every later event as well.
  if (criteria.date) {
    where.push('e.event_date = ?');
    params.push(criteria.date);
  } else if (period === 'upcoming') {
    where.push('e.event_date >= CURDATE()');
  } else if (period === 'past') {
    where.push('e.event_date < CURDATE()');
  }

  if (criteria.location) {
    where.push('(e.city LIKE ? OR e.suburb LIKE ? OR e.venue LIKE ?)');
    const like = `%${criteria.location}%`;
    params.push(like, like, like);
  }

  if (criteria.category) {
    where.push('e.category_id = ?');
    params.push(criteria.category);
  }

  const orderSql =
    period === 'past'
      ? 'ORDER BY e.event_date DESC, e.start_time DESC'   // most recent first
      : 'ORDER BY e.event_date ASC, e.start_time ASC';    // soonest first

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  try {
    const rows = await query(`${EVENT_SELECT} ${whereSql} ${orderSql}`, params);
    res.status(200).json({ count: rows.length, events: rows.map(shapeEvent) });
  } catch (err) {
    console.error('GET /api/events failed:', err.message);
    res.status(500).json({ error: true, message: 'Could not load events.' });
  }
});

// --- GET /api/events/past --------------------------------------------------

/** Kept from Assessment 2 so the old home page still works: finished events. */
router.get('/past', async (req, res) => {
  try {
    const rows = await query(
      `${EVENT_SELECT}
        WHERE e.status = 'active' AND e.event_date < CURDATE()
        ORDER BY e.event_date DESC`,
      []
    );
    res.status(200).json({ count: rows.length, events: rows.map(shapeEvent) });
  } catch (err) {
    console.error('GET /api/events/past failed:', err.message);
    res.status(500).json({ error: true, message: 'Could not load past events.' });
  }
});

// --- GET /api/events/:id ---------------------------------------------------

/**
 * One event plus every registration recorded against it, sorted by the date
 * the tickets were bought with the newest first - exactly what the brief asks
 * the event page to show.
 *
 * ?status=all lets the admin screens open a suspended event too; the public
 * site never sends it, so a suspended event stays hidden there (404).
 */
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  if (!isPositiveInt(id)) {
    return res.status(400).json({ error: true, message: 'Event id must be a positive number.' });
  }

  const allowAnyStatus = String(req.query.status || '') === 'all';
  const params = [Number(id)];
  const statusSql = allowAnyStatus ? '' : `AND e.status = 'active'`;

  try {
    const rows = await query(`${EVENT_SELECT} WHERE e.event_id = ? ${statusSql}`, params);
    if (rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Event not found.' });
    }

    const registrationRows = await selectRegistrations(Number(id));

    res.status(200).json({
      ...shapeEvent(rows[0]),
      registrations: registrationRows.map(shapeRegistration),
    });
  } catch (err) {
    console.error(`GET /api/events/${id} failed:`, err.message);
    res.status(500).json({ error: true, message: 'Could not load this event.' });
  }
});

// --- POST /api/events ------------------------------------------------------

/**
 * Creates one event (admin "New event" form).
 * Answers 201 with the created resource and a Location header, which is what
 * REST expects from a successful create.
 */
router.post('/', async (req, res) => {
  const body = req.body || {};
  const { values, errors } = readEventPayload(body, false);
  if (errors.length > 0) {
    return res.status(400).json({
      error: true,
      message: 'The event could not be saved. Please correct the highlighted fields.',
      fields: errors,
    });
  }

  const fkErrors = await checkForeignKeys(values, []).catch(() => []);
  if (fkErrors.length > 0) {
    return res.status(400).json({
      error: true,
      message: 'The event could not be saved. Please correct the highlighted fields.',
      fields: fkErrors,
    });
  }

  const sql = `
    INSERT INTO events
      (organisation_id, category_id, name, summary, description, event_date,
       start_time, end_time, venue, suburb, city, state, latitude, longitude,
       ticket_price, goal_amount, raised_amount, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    values.organisation_id,
    values.category_id,
    values.name,
    values.summary ?? null,
    values.description,
    values.event_date,
    values.start_time,
    values.end_time ?? null,
    values.venue,
    values.suburb ?? null,
    values.city,
    values.state ?? 'QLD',
    values.latitude ?? null,
    values.longitude ?? null,
    values.ticket_price ?? 0,
    values.goal_amount ?? 0,
    values.raised_amount ?? 0,
    values.status ?? 'active',
  ];

  try {
    const result = await query(sql, params);
    const createdId = result.insertId;

    const rows = await query(`${EVENT_SELECT} WHERE e.event_id = ?`, [createdId]);
    res.status(201)
      .location(`/api/events/${createdId}`)
      .json(shapeEvent(rows[0]));
  } catch (err) {
    console.error('POST /api/events failed:', err.message);
    res.status(500).json({ error: true, message: 'Could not create the event.' });
  }
});

// --- PUT /api/events/:id ---------------------------------------------------

/**
 * Updates an existing event. Partial updates are allowed: only the fields
 * present in the body are written, which keeps the admin "edit" form from
 * having to resend values the user never touched.
 */
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  if (!isPositiveInt(id)) {
    return res.status(400).json({ error: true, message: 'Event id must be a positive number.' });
  }

  const body = req.body || {};
  const { values, errors } = readEventPayload(body, true);
  if (errors.length > 0) {
    return res.status(400).json({
      error: true,
      message: 'The event could not be updated. Please correct the highlighted fields.',
      fields: errors,
    });
  }

  const fields = Object.keys(values);
  if (fields.length === 0) {
    return res.status(400).json({ error: true, message: 'Nothing to update - no fields were supplied.' });
  }

  const fkErrors = await checkForeignKeys(values, []).catch(() => []);
  if (fkErrors.length > 0) {
    return res.status(400).json({
      error: true,
      message: 'The event could not be updated. Please correct the highlighted fields.',
      fields: fkErrors,
    });
  }

  // Build "SET col = ?, col = ?" from the supplied keys only. The column names
  // come from a fixed whitelist below, never from the request, so a crafted
  // key cannot inject SQL.
  const allowed = [
    'organisation_id', 'category_id', 'name', 'summary', 'description',
    'event_date', 'start_time', 'end_time', 'venue', 'suburb', 'city', 'state',
    'latitude', 'longitude', 'ticket_price', 'goal_amount', 'raised_amount', 'status',
  ];
  const setColumns = fields.filter((f) => allowed.includes(f));
  const setSql = setColumns.map((f) => `${f} = ?`).join(', ');
  const params = [...setColumns.map((f) => values[f]), Number(id)];

  try {
    const result = await query(`UPDATE events SET ${setSql} WHERE event_id = ?`, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'Event not found.' });
    }

    const rows = await query(`${EVENT_SELECT} WHERE e.event_id = ?`, [Number(id)]);
    res.status(200).json(shapeEvent(rows[0]));
  } catch (err) {
    console.error(`PUT /api/events/${id} failed:`, err.message);
    res.status(500).json({ error: true, message: 'Could not update the event.' });
  }
});

// --- DELETE /api/events/:id ------------------------------------------------

/**
 * Deletes an event, but only when nobody has registered for it.
 *
 *   204 -> deleted
 *   404 -> no such event
 *   409 -> people have already registered; the response says how many, so the
 *          admin screen can explain the block instead of failing silently.
 */
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  if (!isPositiveInt(id)) {
    return res.status(400).json({ error: true, message: 'Event id must be a positive number.' });
  }

  try {
    const rows = await query(`${EVENT_SELECT} WHERE e.event_id = ?`, [Number(id)]);
    if (rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Event not found.' });
    }

    const event = shapeEvent(rows[0]);
    if (event.registration_count > 0) {
      return res.status(409).json({
        error: true,
        message: `“${event.name}” cannot be deleted because ${event.registration_count} registration(s) are attached to it. Remove the registrations first, or suspend the event instead.`,
        registration_count: event.registration_count,
        tickets_sold: event.tickets_sold,
      });
    }

    await query('DELETE FROM events WHERE event_id = ?', [Number(id)]);
    res.status(200).json({ deleted: true, event_id: Number(id), name: event.name });
  } catch (err) {
    console.error(`DELETE /api/events/${id} failed:`, err.message);
    res.status(500).json({ error: true, message: 'Could not delete the event.' });
  }
});

module.exports = router;

/**
 * routes/organisations.js
 * ---------------------------------------------------------------------------
 * GET /api/organisations -> the charities that run the events.
 *
 * This endpoint exists for the admin-side "new event" form: staff pick the
 * organiser from a dropdown instead of typing a number they have to look up
 * first. It is read-only - nothing in either website creates a charity.
 * ---------------------------------------------------------------------------
 */

const express = require('express');
const { query } = require('../event_db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // LEFT JOIN, not INNER JOIN: a charity that has not run an event yet must
    // still appear in the dropdown (with a count of 0). COUNT(e.event_id)
    // rather than COUNT(*) is what makes that work - COUNT(*) would return 1
    // for the single NULL row the outer join produces.
    const rows = await query(
      `SELECT o.organisation_id,
              o.name,
              o.mission,
              o.description,
              o.contact_email,
              o.contact_phone,
              o.website,
              o.logo_icon,
              COUNT(e.event_id) AS event_count
         FROM organisations o
         LEFT JOIN events e ON e.organisation_id = o.organisation_id
        GROUP BY o.organisation_id, o.name, o.mission, o.description,
                 o.contact_email, o.contact_phone, o.website, o.logo_icon
        ORDER BY o.name ASC`,
      []
    );

    res.status(200).json({
      count: rows.length,
      organisations: rows.map((row) => ({
        organisation_id: row.organisation_id,
        name: row.name,
        mission: row.mission,
        description: row.description,
        contact_email: row.contact_email,
        contact_phone: row.contact_phone,
        website: row.website,
        logo_icon: row.logo_icon,
        event_count: Number(row.event_count),
      })),
    });
  } catch (err) {
    console.error('GET /api/organisations failed:', err.message);
    res.status(500).json({ error: true, message: 'Could not load organisations.' });
  }
});

module.exports = router;

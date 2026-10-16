/**
 * routes/categories.js
 * ---------------------------------------------------------------------------
 * GET /api/categories -> every event category, for the search filter and for
 * the dropdowns on the admin "new event" / "edit event" forms.
 *
 * Read-only: the brief explicitly says endpoints that manipulate categories
 * are optional, and nothing in either website needs to create one, so adding
 * write endpoints here would be surface area without a purpose.
 * ---------------------------------------------------------------------------
 */

const express = require('express');
const { query } = require('../event_db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // LEFT JOIN + COUNT so the search page can show "3 events" next to each
    // category without a second request. Events that are suspended or already
    // finished are excluded from the count, which is exactly what the public
    // site can show.
    const rows = await query(
      `SELECT c.category_id,
              c.name,
              c.description,
              c.icon,
              c.image_url,
              COUNT(e.event_id) AS event_count
         FROM categories c
         LEFT JOIN events e
                ON e.category_id = c.category_id
               AND e.status = 'active'
               AND e.event_date >= CURDATE()
        GROUP BY c.category_id, c.name, c.description, c.icon, c.image_url
        ORDER BY c.name ASC`,
      []
    );

    res.status(200).json({
      count: rows.length,
      categories: rows.map((row) => ({
        category_id: row.category_id,
        name: row.name,
        description: row.description,
        icon: row.icon,
        image_url: row.image_url,
        event_count: Number(row.event_count),
      })),
    });
  } catch (err) {
    console.error('GET /api/categories failed:', err.message);
    res.status(500).json({ error: true, message: 'Could not load categories.' });
  }
});

module.exports = router;

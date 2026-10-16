/**
 * server.js
 * ---------------------------------------------------------------------------
 * Entry point of the Giving Coast API (PROG2002 - Assessment 3).
 *
 * What it does, in order:
 *   1. load .env
 *   2. log each request (method, path, status, duration) - cheap observability
 *   3. allow the two Angular sites to call it from their own origins
 *   4. parse JSON bodies
 *   5. mount every route module under /api
 *   6. serve the built client-side files when a build exists (handy locally)
 *   7. answer unknown /api paths with JSON 404, and turn any thrown error
 *      into JSON 500 instead of Express's default HTML page
 *
 * Unit rules respected: Express is used only to build the server-side API.
 * No templating engine (EJS/Pug/Handlebars) is installed or configured - the
 * client-side and admin-side are separate Angular applications that talk to
 * these endpoints over HTTP.
 * ---------------------------------------------------------------------------
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const { query, closePool } = require('./event_db');
const eventsRouter = require('./routes/events');
const registrationsRouter = require('./routes/registrations');
const categoriesRouter = require('./routes/categories');
const organisationsRouter = require('./routes/organisations');
const weatherRouter = require('./routes/weather');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// --- 3. CORS ---------------------------------------------------------------
// One origin while developing (*), the real cPanel URLs once deployed. Anything
// that is not an /api path is unaffected.
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

// --- 2. request log --------------------------------------------------------
// Small enough to read at a glance, and it makes the demo video much easier to
// narrate because you can see which endpoint each page action hits.
app.use((req, res, next) => {
  const started = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - started;
    console.log(`${req.method.padEnd(6)} ${req.originalUrl.padEnd(48)} ${res.statusCode} (${ms} ms)`);
  });
  next();
});

// --- 4. bodies -------------------------------------------------------------
// 100 kb is far more than any form on these sites needs; the limit stops a
// junk payload from being parsed at all.
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false }));

// --- 5. API routes ---------------------------------------------------------
app.use('/api/events', eventsRouter);
app.use('/api/registrations', registrationsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/organisations', organisationsRouter);
app.use('/api/weather', weatherRouter);

/**
 * GET /api/health
 * Proves three things at once: the process is up, MySQL is reachable, and the
 * tables the sites depend on exist. This is the first thing to check after a
 * cPanel deployment.
 */
app.get('/api/health', async (req, res) => {
  try {
    const rows = await query('SELECT 1 AS ok, NOW() AS serverTime');
    const counts = await query(
      `SELECT (SELECT COUNT(*) FROM events)        AS events,
              (SELECT COUNT(*) FROM registrations) AS registrations,
              (SELECT COUNT(*) FROM categories)    AS categories`
    );
    res.json({
      api: 'running',
      database: 'connected',
      dbName: process.env.DB_NAME || 'charityevents_db',
      serverTime: rows[0].serverTime,
      counts: counts[0],
    });
  } catch (err) {
    console.error('Health check failed:', err.message);
    res.status(500).json({ api: 'running', database: 'error', message: err.message });
  }
});

/** Handy index of everything the API exposes - also useful in the video. */
app.get('/api', (req, res) => {
  res.json({
    name: 'Giving Coast API',
    version: '3.0.0',
    endpoints: [
      'GET    /api/health',
      'GET    /api/events                       (query: date, location, category, status, period)',
      'GET    /api/events/past',
      'GET    /api/events/:id                   (query: status=all -> admin can open suspended)',
      'POST   /api/events                       (admin: create)',
      'PUT    /api/events/:id                   (admin: update)',
      'DELETE /api/events/:id                   (admin: delete - 409 if registrations exist)',
      'GET    /api/registrations?event_id=',
      'POST   /api/registrations                (public: register for an event)',
      'GET    /api/categories',
      'GET    /api/organisations               (organiser dropdown for the admin forms)',
      'GET    /api/weather/:eventId             (Open-Meteo forecast for the event day)',
    ],
  });
});

// --- 6. optional static hosting -------------------------------------------
// On cPanel the two Angular sites are served by Apache from public_html, so
// this is only a convenience for running everything from one port locally.
const staticDir = process.env.STATIC_DIR || path.join(__dirname, '..', 'clientside', 'dist', 'client', 'browser');
if (fs.existsSync(staticDir)) {
  app.use(express.static(staticDir));
  console.log(`Serving built client-side from ${staticDir}`);
}

// --- 7. 404 / error handling ----------------------------------------------
app.use('/api', (req, res) => {
  res.status(404).json({ error: true, message: `Unknown endpoint: ${req.originalUrl}` });
});

// eslint-disable-next-line no-unused-vars - Express identifies error handlers by arity
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: true, message: 'Unexpected server error.' });
});

const server = app.listen(PORT, () => {
  console.log('----------------------------------------------------------');
  console.log(' Giving Coast API - PROG2002 Assessment 3');
  console.log(` API      http://localhost:${PORT}/api`);
  console.log(` Database ${process.env.DB_NAME || 'charityevents_db'}`);
  console.log('----------------------------------------------------------');
});

/**
 * Graceful shutdown: stop taking requests, close MySQL connections, then exit.
 * Without this, Ctrl+C leaves pooled connections half-open and the next start
 * can fail with "too many connections" after a few restarts.
 */
['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, async () => {
    console.log(`\n${signal} received - shutting down.`);
    server.close();
    await closePool().catch(() => {});
    process.exit(0);
  });
});

/**
 * event_db.js
 * ---------------------------------------------------------------------------
 * Database layer for the Giving Coast website (PROG2002 - Assessment 3).
 *
 * Responsibility: own the MySQL connection pool and expose two helpers:
 *   query()          - run one parameterised statement
 *   withTransaction()- run several statements as one all-or-nothing unit
 *
 * Route modules never touch the pool directly, so there is exactly one place
 * where connections are created and released. That is what makes the API safe
 * under load and easy to reason about.
 *
 * CHANGES FOR A3
 *   withTransaction() is new. Creating an event and recording a registration
 *   are both single statements, but returning the freshly created row needs a
 *   follow-up SELECT, and the delete rule ("only if no registrations exist")
 *   reads before it writes. A transaction makes those read-then-write
 *   sequences safe if two staff members act at the same moment.
 * ---------------------------------------------------------------------------
 */

require('dotenv').config();

const mysql = require('mysql2/promise');

/**
 * A pool keeps a set of connections open and reuses them, which is much
 * cheaper than opening a new connection for every HTTP request.
 *
 * decimalNumbers: true -> DECIMAL columns (ticket_price, goal_amount,
 * latitude, longitude) come back as JavaScript numbers instead of strings.
 *
 * dateStrings: true  -> DATE columns arrive as 'YYYY-MM-DD' exactly as stored.
 * Without it the driver turns them into local-midnight Date objects, which
 * then shift by a day the moment a timezone is involved. Strings avoid that
 * whole class of bug.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'charityevents_db',
  // utf8mb4, not utf8. The category and organisation icons are emoji, which
  // need four bytes per character; the driver's default (utf8/utf8mb3) stores
  // only three and silently turns them into '?'. Local MySQL is often
  // configured with utf8mb4 as the server default so the bug stays hidden -
  // on a shared host it does not.
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
  dateStrings: true,
});

/**
 * Run a parameterised query.
 *
 * Every value that comes from the outside world MUST be passed through
 * `params` - never concatenated into the SQL string. mysql2 escapes the
 * placeholders, which is what protects the API against SQL injection.
 *
 * @param {string} sql     SQL statement, placeholders written as ?
 * @param {Array}  params  values bound to those placeholders, in order
 * @returns {Promise<Array>} the rows the query returned
 */
async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

/**
 * Run `work` inside a transaction.
 *
 * work() receives a query function bound to the transaction's own connection.
 * If work() resolves, the transaction is COMMITted; if it throws, everything
 * is ROLLed back and the error is re-thrown for the route to turn into an
 * HTTP response.
 *
 * @template T
 * @param {(q: Function) => Promise<T>} work
 * @returns {Promise<T>}
 */
async function withTransaction(work) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(async (sql, params = []) => {
      const [rows] = await connection.query(sql, params);
      return rows;
    });
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback().catch(() => {});
    throw err;
  } finally {
    connection.release();
  }
}

/** Shut the pool down cleanly (used on Ctrl+C and by the tests). */
async function closePool() {
  await pool.end();
}

module.exports = { pool, query, withTransaction, closePool };

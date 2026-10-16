/**
 * routes/validate.js
 * ---------------------------------------------------------------------------
 * Small, shared input-validation helpers.
 *
 * Why this file exists: the API accepts data from the public registration form
 * and from the admin screens, and both must be checked with the SAME rules.
 * Keeping the rules in one place means a field cannot be strict on one page
 * and sloppy on another.
 *
 * Principle used throughout: validation is about SHAPE, not about business
 * truth. "Is this a plausible email?" is answered here; "does this event
 * still have places left?" is answered by the database. Every helper returns
 * a boolean or a cleaned value, never an HTTP response - the route decides
 * which status code fits.
 * ---------------------------------------------------------------------------
 */

/** A positive whole number (ids, ticket counts). */
function isPositiveInt(value) {
  return /^\d+$/.test(String(value)) && Number(value) > 0;
}

/** YYYY-MM-DD and a date that really exists (rejects 2026-02-31). */
function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
}

/** HH:MM or HH:MM:SS. */
function isValidTime(value) {
  return /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(String(value));
}

/**
 * Deliberately simple email check: something@something.tld.
 * Trying to fully validate RFC 5322 with a regular expression produces
 * unreadable code and still rejects valid addresses; the database CHECK
 * constraint is the second line of defence.
 */
function isEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/** Australian-ish phone: digits, spaces, brackets, plus - 8 to 15 digits. */
function isPhone(value) {
  const digits = String(value).replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

/** A non-negative number (prices, ticket counts). */
function isNonNegativeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0;
}

/** Latitude must be -90..90, longitude -180..180. */
function isValidLatitude(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= -90 && n <= 90;
}

function isValidLongitude(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= -180 && n <= 180;
}

/**
 * Trim a string and enforce a maximum length.
 * Returns null when the value is missing, empty, or too long.
 */
function cleanText(value, maxLength) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > maxLength) return null;
  return trimmed;
}

/** Today's date as 'YYYY-MM-DD' in the server's local calendar. */
function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * Collects field errors instead of throwing on the first one, so the browser
 * can show every problem at once rather than one per submission.
 *
 * Usage in a route:
 *   const errors = requireField(errors, 'name', body.name, 150);
 *   if (errors.length) return res.status(400).json({ error: true, message: ..., fields: errors });
 */
class FieldErrors {
  constructor() {
    this.list = [];
  }

  add(field, message) {
    this.list.push({ field, message });
    return this;
  }

  /** Required free-text field. */
  required(field, value, maxLength, label) {
    const cleaned = cleanText(value, maxLength);
    if (cleaned === null) {
      this.add(field, `${label || field} is required and must be 1-${maxLength} characters.`);
      return null;
    }
    return cleaned;
  }

  /** Optional free-text field (null when simply not supplied). */
  optional(field, value, maxLength, label) {
    if (value === undefined || value === null || String(value).trim() === '') return null;
    const cleaned = cleanText(value, maxLength);
    if (cleaned === null) {
      this.add(field, `${label || field} must be at most ${maxLength} characters.`);
      return null;
    }
    return cleaned;
  }

  get length() {
    return this.list.length;
  }
}

module.exports = {
  isPositiveInt,
  isValidDate,
  isValidTime,
  isEmail,
  isPhone,
  isNonNegativeNumber,
  isValidLatitude,
  isValidLongitude,
  cleanText,
  todayString,
  FieldErrors,
};

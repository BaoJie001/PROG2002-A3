/**
 * utils/format.ts
 * ---------------------------------------------------------------------------
 * Display helpers shared by every page.
 *
 * Why these exist: the API sends raw database values ('2026-10-24',
 * '17:00:00', 35). Turning those into "Sat 24 Oct 2026", "5:00 pm" and
 * "$35.00" is presentation, and doing it in one place keeps every page
 * consistent - the same date never appears in two different formats.
 *
 * Date handling note: the date string is split by hand rather than passed to
 * `new Date('2026-10-24')`. The latter parses as UTC midnight, which renders
 * as the previous day for anyone west of Greenwich. Splitting keeps the date
 * exactly as the database stored it, in the visitor's own calendar.
 * ---------------------------------------------------------------------------
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** '2026-10-24' -> 'Sat 24 Oct 2026'. */
export function formatDate(iso: string): string {
  if (!iso) return '';
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return `${DAYS[date.getDay()]} ${day} ${MONTHS[month - 1]} ${year}`;
}

/** '17:00:00' or '17:00' -> '5:00 pm'. */
export function formatTime(value: string | null): string {
  if (!value) return '';
  const [hourText, minute] = value.split(':');
  const hour = Number(hourText);
  const suffix = hour < 12 ? 'am' : 'pm';
  const twelveHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${twelveHour}:${minute} ${suffix}`;
}

/** 35 -> '$35.00'; 0 -> 'Free'. */
export function formatMoney(amount: number): string {
  if (amount === 0) return 'Free';
  return `$${amount.toFixed(2)}`;
}

/** 35.5 -> '35%'. */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/** Today's date as 'YYYY-MM-DD' in the visitor's own timezone. */
export function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * models.ts
 * ---------------------------------------------------------------------------
 * The shapes of the JSON the API returns, written down as TypeScript
 * interfaces.
 *
 * Why bother: TypeScript checks these at compile time. If the API renames a
 * field, or the template types `event.eventDate` instead of `event.event_date`,
 * the build fails with a clear message instead of the page silently rendering
 * "undefined". That is the whole point of using TypeScript in this unit.
 *
 * The names match the API exactly (snake_case, as they come out of MySQL) so
 * no mapping layer is needed anywhere in the app.
 * ---------------------------------------------------------------------------
 */

/** A category is the type of event: fun run, gala dinner, auction, ... */
export interface Category {
  category_id: number;
  name: string;
  description: string;
  icon: string;
  image_url: string;
  /** How many upcoming events use this category (0 when none do). */
  event_count: number;
}

/**
 * The charity running the event.
 *
 * Two spellings of the icon field, on purpose:
 *   icon      - how GET /api/events names it (aliased from logo_icon there);
 *   logo_icon - how GET /api/organisations names it, which is what the admin
 *               dropdowns use.
 */
export interface Organisation {
  organisation_id: number;
  name: string;
  icon?: string;
  logo_icon?: string;
  mission: string;
  description?: string | null;
  contact_email: string;
  contact_phone: string;
  website: string;
  event_count?: number;
}

/** One charity event, exactly as GET /api/events returns it. */
export interface CharityEvent {
  event_id: number;
  name: string;
  summary: string | null;
  description: string;
  event_date: string;          // 'YYYY-MM-DD'
  start_time: string;          // 'HH:MM:SS'
  end_time: string | null;
  venue: string;
  suburb: string | null;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  /** Convenience string: "Venue, Suburb, City". */
  location: string;
  ticket_price: number;
  goal_amount: number;
  raised_amount: number;
  progress_percentage: number;
  status: 'active' | 'suspended';
  /** True when event_date is before today. */
  is_past: boolean;
  registration_count: number;
  tickets_sold: number;
  category: Category;
  organisation: Organisation;
}

/** The event detail endpoint adds the people who have booked. */
export interface EventDetail extends CharityEvent {
  /** Newest purchase first - the API sorts by registration_date DESC. */
  registrations: Registration[];
}

/** One person's booking for one event. */
export interface Registration {
  registration_id: number;
  event_id: number;
  first_name: string;
  last_name: string;
  /** "Ava T." - surname shortened so the public page never shows a full name. */
  display_name: string;
  email: string;
  phone: string;
  tickets: number;
  registration_date: string;   // 'YYYY-MM-DD'
  notes: string | null;
  created_at: string;
}

/** What the registration form posts to POST /api/registrations. */
export interface RegistrationRequest {
  event_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  tickets: number;
  registration_date: string;
  notes?: string | null;
}

/** What the admin forms post to POST/PUT /api/events. */
export interface EventRequest {
  organisation_id: number;
  category_id: number;
  name: string;
  summary?: string | null;
  description: string;
  event_date: string;
  start_time: string;
  end_time?: string | null;
  venue: string;
  suburb?: string | null;
  city: string;
  state?: string;
  latitude?: number | null;
  longitude?: number | null;
  ticket_price?: number;
  goal_amount?: number;
  raised_amount?: number;
  status?: 'active' | 'suspended';
}

/** Forecast for the day of an event, from Open-Meteo via our own API. */
export interface WeatherForecast {
  event_id: number;
  event_name: string;
  event_date: string;
  location: string;
  /** false when there are no coordinates or the date is out of range. */
  available: boolean;
  reason?: string;
  cached?: boolean;
  weather?: {
    code: number;
    description: string;
    icon: string;
    temperature_max: number;
    temperature_min: number;
    units: Record<string, string>;
  };
  source?: string;
}

/** The error body every failing endpoint returns: { error: true, message } */
export interface ApiError {
  error: true;
  message: string;
  /** Present on validation failures: which form field caused it. */
  fields?: Array<{ field: string; message: string }>;
}

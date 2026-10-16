/**
 * services/events-api.service.ts
 * ---------------------------------------------------------------------------
 * The single place in the client-side app that talks HTTP.
 *
 * Two deliberate choices:
 *
 * 1. Every method returns a Promise, not an Observable.
 *    Angular's HttpClient is Observable based, and `firstValueFrom()` turns a
 *    one-shot request into a Promise - which is what the unit's JavaScript
 *    material (fetch + Promise) describes, and what makes these calls readable
 *    with async/await in the components. Observables are still the right tool
 *    for streams; a single GET is not a stream.
 *
 * 2. Errors are flattened here.
 *    The API answers failures with { error: true, message }. The service pulls
 *    that message out and rejects with a plain Error carrying it, so no
 *    component has to know about HTTP status codes. One place to change if the
 *    API's error shape ever changes.
 * ---------------------------------------------------------------------------
 */

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, firstValueFrom, Observable, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  ApiError,
  Category,
  CharityEvent,
  EventDetail,
  EventRequest,
  Registration,
  RegistrationRequest,
} from '../models/models';

/** What the search form collects. Empty values are simply not sent. */
export interface SearchCriteria {
  date: string;
  location: string;
  category: string;
}

@Injectable({ providedIn: 'root' })
export class EventsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  // --- internals -----------------------------------------------------------

  /**
   * Turns an HTTP failure into a rejected Promise carrying the API's own
   * message. A status of 0 means the request never reached the server at all
   * (API not running, wrong port, CORS refused) - worth saying plainly,
   * because "0" means nothing to a user.
   */
  private handle(error: HttpErrorResponse): Observable<never> {
    const body = (error.error ?? null) as ApiError | null;

    let message = body?.message;
    if (!message) {
      message =
        error.status === 0
          ? 'Could not reach the API. Is the Node server running on port 3000?'
          : `The server returned an unexpected error (${error.status}).`;
    }

    console.error('API request failed:', error.status, message);
    return throwError(() => new Error(message));
  }

  private get<T>(path: string, params?: HttpParams): Promise<T> {
    return firstValueFrom(
      this.http
        .get<T>(`${this.baseUrl}${path}`, { params })
        .pipe(catchError((err) => this.handle(err)))
    );
  }

  // --- reading -------------------------------------------------------------

  /** Home page: events that are still coming up. */
  getUpcomingEvents(): Promise<CharityEvent[]> {
    return this.get<{ events: CharityEvent[] }>('/events').then((r) => r.events);
  }

  /** Home page: events that have already finished. */
  getPastEvents(): Promise<CharityEvent[]> {
    return this.get<{ events: CharityEvent[] }>('/events/past').then((r) => r.events);
  }

  /**
   * Search page. Any combination of the three criteria is allowed; blank ones
   * are left out of the query string entirely so the API applies its defaults.
   */
  searchEvents(criteria: SearchCriteria): Promise<CharityEvent[]> {
    let params = new HttpParams();
    if (criteria.date) params = params.set('date', criteria.date);
    if (criteria.location) params = params.set('location', criteria.location.trim());
    if (criteria.category) params = params.set('category', criteria.category);

    return this.get<{ events: CharityEvent[] }>('/events', params).then((r) => r.events);
  }

  /**
   * Event detail page: the event plus its registrations, newest purchase
   * first. status=all lets this page open an event that has been suspended -
   * it is the same endpoint the public site uses, with a wider filter.
   */
  getEvent(eventId: number): Promise<EventDetail> {
    return this.get<EventDetail>(`/events/${eventId}`);
  }

  /** Categories for the search dropdown. */
  getCategories(): Promise<Category[]> {
    return this.get<{ categories: Category[] }>('/categories').then((r) => r.categories);
  }

  // --- writing -------------------------------------------------------------

  /**
   * Records a new registration. Resolves with the confirmation message the API
   * sends back, so the page can show exactly what the server decided.
   */
  register(request: RegistrationRequest): Promise<{ message: string; registration: Registration }> {
    return firstValueFrom(
      this.http
        .post<{ message: string; registration: Registration }>(
          `${this.baseUrl}/registrations`,
          request
        )
        .pipe(catchError((err) => this.handle(err)))
    );
  }

  /** Admin: create an event. Not used by the public site, kept for symmetry. */
  createEvent(request: EventRequest): Promise<CharityEvent> {
    return firstValueFrom(
      this.http
        .post<CharityEvent>(`${this.baseUrl}/events`, request)
        .pipe(catchError((err) => this.handle(err)))
    );
  }
}

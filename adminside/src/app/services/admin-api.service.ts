/**
 * services/admin-api.service.ts
 * ---------------------------------------------------------------------------
 * Every call the admin site makes, in one injectable service.
 *
 * The five operations are the full C.R.U.D. cycle:
 *   listEvents()  -> GET    /api/events?status=all&period=all   (R)
 *   getEvent()    -> GET    /api/events/:id?status=all          (R)
 *   createEvent() -> POST   /api/events                         (C)
 *   updateEvent() -> PUT    /api/events/:id                     (U)
 *   deleteEvent() -> DELETE /api/events/:id                     (D)
 *
 * Two details worth pointing out:
 *
 * 1. ?status=all&period=all. The public site only ever asks for active,
 *    upcoming events. Staff need to see every row - suspended ones to fix
 *    them, finished ones for the record - so the same endpoint is used with a
 *    wider filter instead of a second, admin-only endpoint.
 *
 * 2. DELETE can fail on purpose. When an event has registrations the API
 *    answers 409 with an explanation; that message is surfaced to the staff
 *    member verbatim, because "you cannot delete this" without a reason is
 *    worse than useless.
 *
 * As on the public site, every method returns a Promise: HttpClient is
 * Observable based, and firstValueFrom() turns a one-shot request into the
 * Promise the components await.
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
  Organisation,
  Registration,
} from '../models/models';

/** Shape of a successful DELETE - see the DELETE route in the API. */
export interface DeleteResult {
  deleted: boolean;
  event_id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  /** Pulls the API's own error message out of a failed response. */
  private handle(error: HttpErrorResponse): Observable<never> {
    const body = (error.error ?? null) as ApiError | null;

    let message = body?.message;
    if (!message) {
      message =
        error.status === 0
          ? 'Could not reach the API. Is the Node server running on port 3000?'
          : `The server returned an unexpected error (${error.status}).`;
    }

    console.error('Admin API request failed:', error.status, message);
    return throwError(() => new Error(message));
  }

  // --- read ----------------------------------------------------------------

  /** Every event, whatever its status and whatever its date. */
  listEvents(): Promise<CharityEvent[]> {
    const params = new HttpParams().set('status', 'all').set('period', 'all');
    return firstValueFrom(
      this.http
        .get<{ events: CharityEvent[] }>(`${this.baseUrl}/events`, { params })
        .pipe(catchError((err) => this.handle(err)))
    ).then((r) => r.events);
  }

  /** One event, including suspended ones. */
  getEvent(eventId: number): Promise<EventDetail> {
    const params = new HttpParams().set('status', 'all');
    return firstValueFrom(
      this.http
        .get<EventDetail>(`${this.baseUrl}/events/${eventId}`, { params })
        .pipe(catchError((err) => this.handle(err)))
    );
  }

  /** Registrations booked against one event - shown on the edit screen. */
  getRegistrations(eventId: number): Promise<Registration[]> {
    const params = new HttpParams().set('event_id', String(eventId));
    return firstValueFrom(
      this.http
        .get<{ registrations: Registration[] }>(`${this.baseUrl}/registrations`, { params })
        .pipe(catchError((err) => this.handle(err)))
    ).then((r) => r.registrations);
  }

  /** Lookups for the dropdowns on the new/edit forms. */
  getCategories(): Promise<Category[]> {
    return firstValueFrom(
      this.http
        .get<{ categories: Category[] }>(`${this.baseUrl}/categories`)
        .pipe(catchError((err) => this.handle(err)))
    ).then((r) => r.categories);
  }

  getOrganisations(): Promise<Organisation[]> {
    return firstValueFrom(
      this.http
        .get<{ organisations: Organisation[] }>(`${this.baseUrl}/organisations`)
        .pipe(catchError((err) => this.handle(err)))
    ).then((r) => r.organisations);
  }

  // --- write ---------------------------------------------------------------

  createEvent(payload: EventRequest): Promise<CharityEvent> {
    return firstValueFrom(
      this.http
        .post<CharityEvent>(`${this.baseUrl}/events`, payload)
        .pipe(catchError((err) => this.handle(err)))
    );
  }

  updateEvent(eventId: number, payload: Partial<EventRequest>): Promise<CharityEvent> {
    return firstValueFrom(
      this.http
        .put<CharityEvent>(`${this.baseUrl}/events/${eventId}`, payload)
        .pipe(catchError((err) => this.handle(err)))
    );
  }

  deleteEvent(eventId: number): Promise<DeleteResult> {
    return firstValueFrom(
      this.http
        .delete<DeleteResult>(`${this.baseUrl}/events/${eventId}`)
        .pipe(catchError((err) => this.handle(err)))
    );
  }
}

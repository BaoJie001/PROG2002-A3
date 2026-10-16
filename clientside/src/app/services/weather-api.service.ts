/**
 * services/weather-api.service.ts
 * ---------------------------------------------------------------------------
 * Asks our own API for the forecast of one event's day and place.
 *
 * The browser never contacts Open-Meteo directly: the Express API does that,
 * caching the answer for ten minutes. The component therefore only ever deals
 * with one small JSON object, and when the forecast is unavailable
 * (available: false) the page simply hides the panel - an optional feature is
 * not allowed to break a required one.
 * ---------------------------------------------------------------------------
 */

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, firstValueFrom, of } from 'rxjs';

import { environment } from '../../environments/environment';
import { WeatherForecast } from '../models/models';

@Injectable({ providedIn: 'root' })
export class WeatherApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  /**
   * Resolves with the forecast, or with { available: false } if the request
   * fails. Returning a value instead of rejecting is intentional - the event
   * page has already loaded its real content by this point, so a weather error
   * must not turn into a page-level error message.
   */
  getForecast(eventId: number): Promise<WeatherForecast> {
    return firstValueFrom(
      this.http.get<WeatherForecast>(`${this.baseUrl}/weather/${eventId}`).pipe(
        catchError(() => {
          console.warn(`Weather forecast unavailable for event ${eventId}`);
          return of<WeatherForecast>({
            event_id: eventId,
            event_name: '',
            event_date: '',
            location: '',
            available: false,
            reason: 'request-failed',
          });
        })
      )
    );
  }
}

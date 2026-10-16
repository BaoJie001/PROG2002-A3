import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { EventDetail, WeatherForecast } from '../../models/models';
import { EventsApiService } from '../../services/events-api.service';
import { WeatherApiService } from '../../services/weather-api.service';
import { formatDate, formatMoney, formatTime } from '../../utils/format';

/**
 * Event detail page
 * ---------------------------------------------------------------------------
 * Assessment 3 adds two things to this page:
 *
 * 1. The list of registrations. It comes from the same endpoint as the event
 *    itself (GET /api/events/:id), already sorted newest-purchase-first by the
 *    SQL ORDER BY. The page does no sorting of its own - one source of truth.
 *
 * 2. The weather panel. A separate request to /api/weather/:id. It is fired in
 *    parallel with the event request, and it is deliberately unable to fail the
 *    page: the weather service returns available:false and the panel is simply
 *    not rendered. An optional feature must not be able to break a required
 *    one.
 *
 * The event id arrives in the route (/event/12), never in a global variable,
 * so the page survives a refresh, a bookmark and a shared link.
 */
@Component({
  selector: 'app-event-detail',
  imports: [RouterLink],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css',
})
export class EventDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventsApi = inject(EventsApiService);
  private readonly weatherApi = inject(WeatherApiService);

  readonly event = signal<EventDetail | null>(null);
  readonly forecast = signal<WeatherForecast | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly formatDate = formatDate;
  readonly formatTime = formatTime;
  readonly formatMoney = formatMoney;

  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('id');
    const id = Number(raw);

    // Typing /event/abc into the address bar must not reach the API.
    if (!raw || !Number.isInteger(id) || id <= 0) {
      this.error.set('That is not a valid event id.');
      this.loading.set(false);
      return;
    }

    this.load(id);
  }

  async load(id: number): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const [event, forecast] = await Promise.all([
        this.eventsApi.getEvent(id),
        this.weatherApi.getForecast(id),
      ]);
      this.event.set(event);
      this.forecast.set(forecast);
    } catch (err) {
      this.error.set((err as Error).message);
    } finally {
      this.loading.set(false);
    }
  }

  /** "2 tickets" / "1 ticket". */
  ticketLabel(count: number): string {
    return count === 1 ? '1 ticket' : `${count} tickets`;
  }
}

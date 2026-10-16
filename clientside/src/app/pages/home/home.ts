import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { EventCard } from '../../components/event-card/event-card';
import { CharityEvent } from '../../models/models';
import { EventsApiService } from '../../services/events-api.service';

/**
 * Home page
 * ---------------------------------------------------------------------------
 * Shows what is coming up and, underneath, what has already happened.
 *
 * The two lists come from two endpoints, fetched with Promise.all(). That is
 * worth a comment because it is the whole point of Promises: both requests are
 * in flight at the same time, and the page renders once - instead of waiting
 * for the first to finish before starting the second, or rendering twice.
 *
 * State is held in signals. When a signal changes, Angular re-renders only the
 * parts of the template that read it - no manual change detection, no
 * zone.js surprises.
 */
@Component({
  selector: 'app-home',
  imports: [EventCard, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly api = inject(EventsApiService);

  readonly upcoming = signal<CharityEvent[]>([]);
  readonly past = signal<CharityEvent[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  /** Called by ngOnInit and by the "Try again" button after a failure. */
  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const [upcoming, past] = await Promise.all([
        this.api.getUpcomingEvents(),
        this.api.getPastEvents(),
      ]);
      this.upcoming.set(upcoming);
      this.past.set(past);
    } catch (err) {
      this.error.set((err as Error).message);
    } finally {
      this.loading.set(false);
    }
  }
}

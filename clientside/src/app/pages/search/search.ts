import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { EventCard } from '../../components/event-card/event-card';
import { Category, CharityEvent } from '../../models/models';
import { EventsApiService, SearchCriteria } from '../../services/events-api.service';
import { todayIso } from '../../utils/format';

/**
 * Search page
 * ---------------------------------------------------------------------------
 * Three filters - date, location, category - sent to the API as query
 * parameters. Any combination works, including none at all.
 *
 * Validation happens before the request is sent, for two different reasons:
 *   * a date in the past can never match anything worth showing, so the page
 *     says so and sends nothing (saving a pointless round trip);
 *   * everything else (location text, category) is validated by the API, and
 *     its message is shown verbatim if it rejects the request.
 *
 * Filtering is done by the API, not by downloading every event and hiding rows
 * in the browser. On a real database with thousands of events that difference
 * is the whole ball game.
 */
@Component({
  selector: 'app-search',
  imports: [FormsModule, EventCard],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class Search implements OnInit {
  private readonly api = inject(EventsApiService);

  /** Bound to the form with [(ngModel)]. */
  criteria: SearchCriteria = { date: '', location: '', category: '' };

  readonly categories = signal<Category[]>([]);

  /** null means "no search has run yet" - different from "no results". */
  readonly results = signal<CharityEvent[] | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly validationMessage = signal<string | null>(null);

  /** Used as the min attribute on the date input. */
  readonly today = todayIso();

  ngOnInit(): void {
    this.loadCategories();
  }

  async loadCategories(): Promise<void> {
    try {
      this.categories.set(await this.api.getCategories());
    } catch (err) {
      // Not fatal: the search still works, just without the dropdown.
      console.warn('Categories could not be loaded:', (err as Error).message);
    }
  }

  async submit(): Promise<void> {
    this.validationMessage.set(null);
    this.error.set(null);

    // --- client-side validation -------------------------------------------
    if (this.criteria.date && this.criteria.date < this.today) {
      this.validationMessage.set('That date has already passed. Choose today or a later date.');
      return;
    }

    this.loading.set(true);
    try {
      this.results.set(await this.api.searchEvents(this.criteria));
    } catch (err) {
      this.error.set((err as Error).message);
    } finally {
      this.loading.set(false);
    }
  }

  /** Clears the form and forgets the previous results. */
  clear(): void {
    this.criteria = { date: '', location: '', category: '' };
    this.results.set(null);
    this.validationMessage.set(null);
    this.error.set(null);
  }
}

import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CharityEvent } from '../../models/models';
import { formatDate, formatMoney, formatTime } from '../../utils/format';

/**
 * EventCard
 * ---------------------------------------------------------------------------
 * One event as a card. Used by the home page and the search results so both
 * pages show an event identically - one component, no copy-pasted markup.
 *
 * `input.required<CharityEvent>()` is Angular's signal-based input: the
 * compiler refuses to build the app if a caller forgets to pass an event,
 * which removes a whole category of "cannot read property of undefined" bug.
 */
@Component({
  selector: 'app-event-card',
  imports: [RouterLink],
  templateUrl: './event-card.html',
  styleUrl: './event-card.css',
})
export class EventCard {
  /** The event to render. */
  event = input.required<CharityEvent>();

  // Formatting helpers are exposed to the template as plain methods.
  readonly formatDate = formatDate;
  readonly formatTime = formatTime;
  readonly formatMoney = formatMoney;

  /**
   * True when the event has finished. The card then shows how much was raised
   * rather than a Register button - you cannot book a seat at an event that
   * happened last month.
   */
  readonly isPast = computed(() => this.event().is_past);

  /** "The Spit, Main Beach, Gold Coast" -> "Main Beach". */
  readonly shortLocation = computed(() => this.event().suburb || this.event().city);
}

import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { EventForm } from '../../components/event-form/event-form';
import { Category, EventDetail, EventRequest, Organisation, Registration } from '../../models/models';
import { AdminApiService } from '../../services/admin-api.service';
import { formatDate, formatMoney } from '../../utils/format';

/**
 * Edit event screen.
 * ---------------------------------------------------------------------------
 * Three things happen here, which is why this screen is the most useful one on
 * the admin side:
 *
 * 1. the event is loaded with ?status=all, so even a suspended event can be
 *    opened and fixed;
 * 2. the shared EventForm is pre-filled from it - same rules as "new event";
 * 3. the registrations booked against that event are listed underneath, so
 *    staff can see exactly who is affected before changing a date or venue,
 *    and can see why a delete would be refused.
 */
@Component({
  selector: 'app-event-edit',
  imports: [EventForm, RouterLink],
  templateUrl: './event-edit.html',
  styleUrl: './event-edit.css',
})
export class EventEdit implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly route = inject(ActivatedRoute);

  // Signals, not plain fields: writing to a signal re-renders exactly the parts
  // of the template that read it, so there is no manual change detection to
  // forget. `readonly` keeps anyone from replacing a signal by accident - the
  // value is changed with .set(), the signal itself never is.
  readonly event = signal<EventDetail | null>(null);
  readonly registrations = signal<Registration[]>([]);

  /**
   * Total tickets, as opposed to the number of bookings.
   *
   * The list screen shows both ("3 bookings · 7 tickets") because they answer
   * different questions: how many people to expect, and how many seats to lay
   * out. The edit screen only showed the booking count, which is the number
   * that matters least when you are about to move an event to a smaller room.
   */
  readonly totalTickets = computed(() =>
    this.registrations().reduce((sum, r) => sum + r.tickets, 0)
  );
  readonly categories = signal<Category[]>([]);
  readonly organisations = signal<Organisation[]>([]);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notice = signal<string | null>(null);
  readonly submitting = signal(false);

  readonly formatDate = formatDate;
  readonly formatMoney = formatMoney;

  private eventId = 0;

  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('id');
    const id = Number(raw);

    if (!raw || !Number.isInteger(id) || id <= 0) {
      this.error.set('That is not a valid event id.');
      this.loading.set(false);
      return;
    }

    this.eventId = id;
    this.load(id);
  }

  async load(id: number): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      // Four independent reads, one round trip each but all in flight at once.
      const [event, registrations, categories, organisations] = await Promise.all([
        this.api.getEvent(id),
        this.api.getRegistrations(id),
        this.api.getCategories(),
        this.api.getOrganisations(),
      ]);

      this.event.set(event);
      this.registrations.set(registrations);
      this.categories.set(categories);
      this.organisations.set(organisations);
    } catch (err) {
      this.error.set((err as Error).message);
    } finally {
      this.loading.set(false);
    }
  }

  async save(payload: EventRequest): Promise<void> {
    this.submitting.set(true);
    this.error.set(null);
    this.notice.set(null);

    try {
      const updated = await this.api.updateEvent(this.eventId, payload);
      this.notice.set(`“${updated.name}” was saved.`);

      // PUT returns the event without its registrations, so the list already on
      // screen is merged back in. Without this the table below would empty
      // itself the moment you saved a change - which looks like data loss.
      this.event.set({ ...updated, registrations: this.registrations() });
    } catch (err) {
      this.error.set((err as Error).message);
    } finally {
      this.submitting.set(false);
    }
  }

  /** Keeps the table grammatical: "1 ticket" but "3 tickets". */
  ticketLabel(count: number): string {
    return count === 1 ? '1 ticket' : `${count} tickets`;
  }
}

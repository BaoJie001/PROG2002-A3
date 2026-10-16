import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { CharityEvent } from '../../models/models';
import { AdminApiService } from '../../services/admin-api.service';
import { formatDate, formatMoney } from '../../utils/format';

/**
 * Event list - the admin dashboard.
 * ---------------------------------------------------------------------------
 * Lists EVERY event, including the ones the public site hides:
 *   * suspended events, so staff can fix or review them;
 *   * finished events, so the record is complete.
 * That is what ?status=all&period=all on GET /api/events is for.
 *
 * Delete is the interesting part. The button asks for confirmation first, and
 * when the API refuses (an event that has registrations) the API's own
 * explanation is shown in full - "blocked, and here is why" beats a silent
 * failure every time.
 */
/** The four choices in the filter bar above the table. */
type StatusFilter = 'all' | 'active' | 'past' | 'suspended';

@Component({
  selector: 'app-event-list',
  imports: [RouterLink],
  templateUrl: './event-list.html',
  styleUrl: './event-list.css',
})
export class EventList implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly route = inject(ActivatedRoute);

  readonly events = signal<CharityEvent[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notice = signal<string | null>(null);
  /** Which row's delete button is currently in flight. */
  readonly deletingId = signal<number | null>(null);

  /**
   * Status filter shown above the table.
   *
   * Filtering happens here rather than through another API call: the list
   * already holds every event, so narrowing it in the browser is instant and
   * keeps the counts above the buttons correct. The API keeps its own filters
   * (status, period) because the public site needs them server-side.
   */
  readonly filter = signal<StatusFilter>('all');

  readonly visibleEvents = computed(() => {
    const wanted = this.filter();
    const all = this.events();
    if (wanted === 'all') return all;
    return all.filter((e) => this.statusKey(e) === wanted);
  });

  readonly counts = computed(() => {
    const tally: Record<StatusFilter, number> = {
      all: this.events().length,
      active: 0,
      past: 0,
      suspended: 0,
    };
    for (const e of this.events()) {
      tally[this.statusKey(e)] += 1;
    }
    return tally;
  });

  readonly filters: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'past', label: 'Past' },
    { key: 'suspended', label: 'Suspended' },
  ];

  readonly formatDate = formatDate;
  readonly formatMoney = formatMoney;

  ngOnInit(): void {
    // Arriving here from the "new event" screen carries ?created=<id>.
    const createdId = this.route.snapshot.queryParamMap.get('created');
    if (createdId) {
      this.notice.set(`Event #${createdId} was created.`);
    }

    this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      this.events.set(await this.api.listEvents());
    } catch (err) {
      this.error.set((err as Error).message);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * The machine-readable status, used by the filter.
   *
   * Suspended wins over past: an event that was cancelled and has since passed
   * is still interesting to staff for the reason it was cancelled, so it stays
   * under Suspended rather than drifting into Past.
   */
  statusKey(event: CharityEvent): StatusFilter {
    if (event.status === 'suspended') return 'suspended';
    if (event.is_past) return 'past';
    return 'active';
  }

  /** 'Past' / 'Suspended' / 'Active' - what the badge in the table shows. */
  statusLabel(event: CharityEvent): string {
    if (event.status === 'suspended') return 'Suspended';
    if (event.is_past) return 'Past';
    return 'Active';
  }

  statusClass(event: CharityEvent): string {
    if (event.status === 'suspended') return 'badge badge--suspended';
    if (event.is_past) return 'badge badge--past';
    return 'badge badge--active';
  }

  async remove(event: CharityEvent): Promise<void> {
    // A destructive action always gets a second chance to be cancelled.
    const confirmed = window.confirm(
      `Delete “${event.name}”?\n\nThis cannot be undone.`
    );
    if (!confirmed) return;

    this.deletingId.set(event.event_id);
    this.error.set(null);
    this.notice.set(null);

    try {
      const result = await this.api.deleteEvent(event.event_id);
      this.notice.set(`“${result.name}” was deleted.`);
      await this.load();
    } catch (err) {
      // 409 from the API: people have already registered for this event.
      this.error.set((err as Error).message);
    } finally {
      this.deletingId.set(null);
    }
  }
}

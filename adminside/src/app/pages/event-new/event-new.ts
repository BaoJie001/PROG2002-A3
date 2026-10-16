import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { EventForm } from '../../components/event-form/event-form';
import { Category, EventRequest, Organisation } from '../../models/models';
import { AdminApiService } from '../../services/admin-api.service';

/**
 * New event screen.
 * ---------------------------------------------------------------------------
 * Loads the two dropdowns (organisations and categories), renders the shared
 * EventForm, and POSTs whatever it emits.
 *
 * The page does the HTTP, the form does the validation - so the edit screen
 * reuses the exact same rules without copying a line of them.
 */
@Component({
  selector: 'app-event-new',
  imports: [EventForm],
  templateUrl: './event-new.html',
  styleUrl: './event-new.css',
})
export class EventNew implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly router = inject(Router);

  readonly categories = signal<Category[]>([]);
  readonly organisations = signal<Organisation[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly submitting = signal(false);

  ngOnInit(): void {
    this.loadLookups();
  }

  async loadLookups(): Promise<void> {
    this.loading.set(true);
    try {
      // Both lookups are independent, so they are requested together.
      const [categories, organisations] = await Promise.all([
        this.api.getCategories(),
        this.api.getOrganisations(),
      ]);
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

    try {
      const created = await this.api.createEvent(payload);

      // Back to the list rather than staying on the form: the list greets the
      // new id and offers the edit link, which both confirms the save and
      // stops the same event being submitted twice by a double click.
      await this.router.navigate(['/events'], { queryParams: { created: created.event_id } });
    } catch (err) {
      this.error.set((err as Error).message);
    } finally {
      this.submitting.set(false);
    }
  }
}

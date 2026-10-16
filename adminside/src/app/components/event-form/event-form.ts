import { Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Category, CharityEvent, EventRequest, Organisation } from '../../models/models';

/**
 * EventForm
 * ---------------------------------------------------------------------------
 * One form, two jobs: creating an event and editing one. The "new event" and
 * "edit event" pages render this same component; the page owns the HTTP call,
 * the component owns the fields and the validation. That split is why the two
 * screens cannot drift apart - there is only one copy of the rules.
 *
 * It is a reactive form, so:
 *   * every rule (required, max length, minimums) is declared once next to the
 *     field it belongs to;
 *   * the template only asks "touched and invalid?" to decide whether to show
 *     a message;
 *   * the emitted payload is already the shape the API expects.
 */
@Component({
  selector: 'app-event-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './event-form.html',
  styleUrl: './event-form.css',
})
export class EventForm {
  private readonly fb = inject(FormBuilder);

  /** null = create mode. When set, the form is filled from it. */
  event = input<CharityEvent | null>(null);
  categories = input<Category[]>([]);
  organisations = input<Organisation[]>([]);
  submitting = input(false);
  submitLabel = input('Save event');

  /** Emits the validated payload. The parent page does the HTTP call. */
  save = output<EventRequest>();

  readonly form = this.fb.group({
    organisation_id: [0, [Validators.required, Validators.min(1)]],
    category_id: [0, [Validators.required, Validators.min(1)]],
    name: ['', [Validators.required, Validators.maxLength(150)]],
    summary: [''],
    description: ['', [Validators.required]],
    event_date: ['', [Validators.required]],
    start_time: ['', [Validators.required]],
    end_time: [''],
    venue: ['', [Validators.required, Validators.maxLength(150)]],
    suburb: [''],
    city: ['Gold Coast', [Validators.required]],
    state: ['QLD'],
    // Latitude/longitude feed the Open-Meteo forecast; optional, and the form
    // says so, because not every venue has coordinates to hand.
    latitude: [null as number | null],
    longitude: [null as number | null],
    ticket_price: [0, [Validators.required, Validators.min(0)]],
    goal_amount: [0, [Validators.required, Validators.min(0)]],
    raised_amount: [0, [Validators.required, Validators.min(0)]],
    status: ['active' as 'active' | 'suspended', [Validators.required]],
  });

  constructor() {
    // When the parent loads an event (edit mode), fill the form with it.
    // effect() re-runs whenever the input signal changes, which is exactly the
    // moment the data arrives from the API.
    effect(() => {
      const event = this.event();
      if (!event) return;

      this.form.patchValue({
        organisation_id: event.organisation.organisation_id,
        category_id: event.category.category_id,
        name: event.name,
        summary: event.summary ?? '',
        description: event.description,
        event_date: event.event_date,
        start_time: event.start_time.slice(0, 5),
        end_time: event.end_time ? event.end_time.slice(0, 5) : '',
        venue: event.venue,
        suburb: event.suburb ?? '',
        city: event.city,
        state: event.state,
        latitude: event.latitude,
        longitude: event.longitude,
        ticket_price: event.ticket_price,
        goal_amount: event.goal_amount,
        raised_amount: event.raised_amount,
        status: event.status,
      });
    });
  }

  /** Called by the template's (ngSubmit). */
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit(this.toPayload());
  }

  /** Turns raw form values into the JSON the API expects. */
  private toPayload(): EventRequest {
    const v = this.form.getRawValue();

    return {
      organisation_id: Number(v.organisation_id),
      category_id: Number(v.category_id),
      name: (v.name ?? '').trim(),
      summary: (v.summary ?? '').trim() || null,
      description: (v.description ?? '').trim(),
      event_date: v.event_date ?? '',
      start_time: v.start_time ?? '',
      end_time: (v.end_time ?? '').trim() || null,
      venue: (v.venue ?? '').trim(),
      suburb: (v.suburb ?? '').trim() || null,
      city: (v.city ?? '').trim(),
      state: (v.state ?? 'QLD').trim() || 'QLD',
      latitude: v.latitude === null || v.latitude === undefined ? null : Number(v.latitude),
      longitude: v.longitude === null || v.longitude === undefined ? null : Number(v.longitude),
      ticket_price: Number(v.ticket_price ?? 0),
      goal_amount: Number(v.goal_amount ?? 0),
      raised_amount: Number(v.raised_amount ?? 0),
      status: v.status ?? 'active',
    };
  }
}

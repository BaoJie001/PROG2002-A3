import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { CharityEvent, Registration } from '../../models/models';
import { EventsApiService } from '../../services/events-api.service';
import { formatDate, formatMoney, formatTime, todayIso } from '../../utils/format';

/**
 * Register page  (the new page Assessment 3 asks for)
 * ---------------------------------------------------------------------------
 * Flow:
 *   1. read ?eventId= from the URL and load that event, so the visitor can see
 *      exactly what they are booking;
 *   2. collect the details in a reactive form with validators;
 *   3. POST the form to /api/registrations;
 *   4. show the server's confirmation and offer the next step.
 *
 * Why a reactive form here rather than ngModel: the validation rules live in
 * one typed object, the template only has to ask "is this field invalid and
 * touched?", and the same rules can be unit-tested without a browser.
 *
 * The API validates again on its side - client-side validation is for speed
 * and good manners, never for security. Whatever the server says (duplicate
 * email, event finished) is shown to the user as-is.
 */
@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(EventsApiService);
  private readonly fb = inject(FormBuilder);

  readonly event = signal<CharityEvent | null>(null);
  readonly loadingEvent = signal(true);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly confirmation = signal<string | null>(null);
  readonly registration = signal<Registration | null>(null);

  readonly today = todayIso();

  /**
   * Latest date the booking may be dated.
   *
   * Two rules meet here and the stricter one wins:
   *   * you cannot buy a ticket in the future, so today is the ceiling;
   *   * you cannot buy a ticket AFTER the event was held, so the event date is
   *     a ceiling too. For an event that already happened, the event date is
   *     the lower of the two.
   *
   * The template binds this to the date input's max attribute, and submit()
   * checks it again, because a browser attribute is a hint, not a guarantee.
   */
  readonly bookingDateMax = signal(this.today);

  readonly formatDate = formatDate;
  readonly formatTime = formatTime;
  readonly formatMoney = formatMoney;

  /** The registration form and its rules. */
  readonly form = this.fb.nonNullable.group({
    first_name: ['', [Validators.required, Validators.maxLength(80)]],
    last_name: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    // digits, spaces, brackets, + and - : 8 to 15 digits once stripped
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+()\s-]{8,20}$/)]],
    tickets: [1, [Validators.required, Validators.min(1), Validators.max(50)]],
    registration_date: [this.today, [Validators.required]],
    notes: [''],
  });

  ngOnInit(): void {
    const raw = this.route.snapshot.queryParamMap.get('eventId');
    const id = Number(raw);

    if (!raw || !Number.isInteger(id) || id <= 0) {
      this.error.set('No event was selected. Pick an event first, then register.');
      this.loadingEvent.set(false);
      return;
    }

    this.loadEvent(id);
  }

  async loadEvent(id: number): Promise<void> {
    this.loadingEvent.set(true);
    try {
      const event = await this.api.getEvent(id);
      this.event.set(event);

      // Once the event date is known, tighten the booking-date ceiling: for a
      // past event that is earlier than today, so the field cannot be dated
      // after the day the event actually ran.
      if (event.event_date && event.event_date < this.today) {
        this.bookingDateMax.set(event.event_date);
      }

      // A finished event cannot be booked at all.
      if (event.is_past) {
        this.error.set('This event has finished, so tickets are no longer on sale.');
      }
    } catch (err) {
      this.error.set((err as Error).message);
    } finally {
      this.loadingEvent.set(false);
    }
  }

  /** Convenience accessor used by the template's error messages. */
  get ticketsControl() {
    return this.form.controls.tickets;
  }

  async submit(): Promise<void> {
    this.error.set(null);
    this.confirmation.set(null);

    const event = this.event();
    if (!event) {
      this.error.set('The event could not be loaded, so the form cannot be sent.');
      return;
    }

    // Touch every control so validation messages appear without the user
    // having to click into each field first.
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Please correct the highlighted fields before submitting.');
      return;
    }

    // Browser-side date limits can be bypassed, so check the rule here too:
    // the booking cannot be dated later than the ceiling worked out above.
    const bookedOn = this.form.getRawValue().registration_date;
    if (bookedOn && bookedOn > this.bookingDateMax()) {
      this.error.set(
        `The registration date cannot be later than ${formatDate(this.bookingDateMax())}.`
      );
      return;
    }

    this.submitting.set(true);
    try {
      const value = this.form.getRawValue();
      const result = await this.api.register({
        event_id: event.event_id,
        first_name: value.first_name.trim(),
        last_name: value.last_name.trim(),
        email: value.email.trim().toLowerCase(),
        phone: value.phone.trim(),
        tickets: Number(value.tickets),
        registration_date: value.registration_date,
        notes: value.notes.trim() || null,
      });

      this.confirmation.set(result.message);
      this.registration.set(result.registration);
      this.form.disable();
    } catch (err) {
      this.error.set((err as Error).message);
    } finally {
      this.submitting.set(false);
    }
  }

  /** Total the visitor will pay, recalculated as they change the quantity. */
  total(): number {
    const event = this.event();
    if (!event) return 0;
    return event.ticket_price * Number(this.ticketsControl.value || 0);
  }
}

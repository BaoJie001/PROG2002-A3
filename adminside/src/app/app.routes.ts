/**
 * app.routes.ts (admin side)
 * ---------------------------------------------------------------------------
 * Three screens: the dashboard that lists every event, the "new event" form,
 * and the "edit event" form which also shows who has already booked.
 *
 * The menu lives in the App shell, so it is present on all of them - which is
 * exactly what the brief asks for.
 */

import { Routes } from '@angular/router';

import { EventList } from './pages/event-list/event-list';
import { EventNew } from './pages/event-new/event-new';
import { EventEdit } from './pages/event-edit/event-edit';

export const routes: Routes = [
  { path: '', component: EventList, title: 'Events - Giving Coast admin' },
  { path: 'events', component: EventList, title: 'Events - Giving Coast admin' },
  { path: 'events/new', component: EventNew, title: 'New event - Giving Coast admin' },
  { path: 'events/:id/edit', component: EventEdit, title: 'Edit event - Giving Coast admin' },
  { path: '**', redirectTo: '' },
];

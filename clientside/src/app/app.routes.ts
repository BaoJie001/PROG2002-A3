/**
 * app.routes.ts
 * ---------------------------------------------------------------------------
 * The public site has four pages. Each route carries a title so the browser
 * tab and the back button both make sense.
 *
 * 'event/:id' and 'register?eventId=' are how the pages pass the event around:
 * the URL, not a global variable. That means a link can be shared, bookmarked
 * and refreshed and it still shows the right event - which a value stashed in
 * a JavaScript variable cannot do.
 * ---------------------------------------------------------------------------
 */

import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Search } from './pages/search/search';
import { EventDetailPage } from './pages/event-detail/event-detail';
import { Register } from './pages/register/register';

export const routes: Routes = [
  { path: '', component: Home, title: 'Giving Coast - charity events on the Gold Coast' },
  { path: 'search', component: Search, title: 'Search events - Giving Coast' },
  { path: 'event/:id', component: EventDetailPage, title: 'Event details - Giving Coast' },
  { path: 'register', component: Register, title: 'Register for an event - Giving Coast' },
  { path: '**', redirectTo: '' },
];

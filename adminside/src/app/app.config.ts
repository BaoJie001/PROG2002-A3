import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';

/**
 * Wiring for the admin-side application.
 *
 * There is deliberately no authentication here: the brief describes an admin
 * site for manipulating event data, not a login system, and inventing one
 * would add surface area the assessment does not ask for. On a real deployment
 * the whole /admin folder would sit behind the web server's own protection.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Show Angular errors in the console instead of swallowing them - the
    // admin site is where mistakes are most likely, so they must be visible.
    provideBrowserGlobalErrorListeners(),

    // The router, plus "start at the top of the new page" behaviour. Without
    // the scrolling option, moving from a long event list into an edit form
    // leaves you halfway down the page and the form looks empty.
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),

    // HttpClient built on fetch rather than the older XMLHttpRequest backend.
    // The admin services await it with firstValueFrom, so every call reads as
    // a Promise even though Angular is Observable-based underneath.
    provideHttpClient(withFetch()),
  ],
};

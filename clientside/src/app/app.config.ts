import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    // Routes, and scroll back to the top whenever the route changes - without
    // this you land halfway down the next page after clicking a card.
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })
    ),

    // withFetch() makes HttpClient use the browser's fetch API instead of
    // XMLHttpRequest: fewer polyfills shipped to the browser, and the requests
    // are visible in the Network tab exactly as a plain fetch() would be.
    provideHttpClient(withFetch()),
  ],
};

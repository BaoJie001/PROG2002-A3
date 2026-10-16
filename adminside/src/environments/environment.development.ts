/**
 * environment.development.ts - used by `ng serve` (port 4201).
 *
 * /api is proxied to the Express API on port 3000 (src/proxy.conf.json), and
 * publicUrl points at the public site's dev server on port 4200.
 */
export const environment = {
  production: false,
  apiBaseUrl: '/api',
  publicUrl: 'http://localhost:4200/',
  siteName: 'Giving Coast — Staff',
};

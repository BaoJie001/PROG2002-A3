/**
 * environment.development.ts - settings used by `ng serve`.
 *
 * The URL is still '/api'; the Angular dev server proxies /api through to the
 * Express API on port 3000 (see src/proxy.conf.json). Keeping the two
 * environments identical apart from flags means a bug cannot exist in one and
 * not the other.
 */
export const environment = {
  production: false,
  apiBaseUrl: '/api',
  /** The admin dev server runs on its own port while developing. */
  adminUrl: 'http://localhost:4201/',
  siteName: 'Giving Coast',
};

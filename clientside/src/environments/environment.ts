/**
 * environment.ts - production settings.
 *
 * apiBaseUrl is RELATIVE ('/api') on purpose. On SCU cPanel the built site is
 * served from https://<username>.scu.edu.au and the Node.js application is
 * mounted at https://<username>.scu.edu.au/api, so a relative URL always
 * points at the right place without a rebuild. Hard-coding localhost here is
 * the single most common reason a deployed site "works on my machine" and
 * shows an empty page on the server.
 */
export const environment = {
  production: true,
  apiBaseUrl: '/api',
  /**
   * Where the admin-side site lives once deployed: a sub-folder of the same
   * domain (public_html/admin). Relative, for the same reason apiBaseUrl is.
   */
  adminUrl: 'admin/',
  /** Name shown in the browser tab and the navigation bar. */
  siteName: 'Giving Coast',
};

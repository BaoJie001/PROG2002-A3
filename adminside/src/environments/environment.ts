/**
 * environment.ts - production settings for the admin site.
 *
 * apiBaseUrl is '/api' (absolute path): on SCU cPanel the admin site is served
 * from https://<user>.scu.edu.au/admin/ while the Node application is mounted
 * at https://<user>.scu.edu.au/api, so an absolute path is required here - a
 * relative 'api' would resolve to /admin/api.
 *
 * publicUrl points back at the public site for the "View site" link.
 */
export const environment = {
  production: true,
  apiBaseUrl: '/api',
  publicUrl: '../',
  siteName: 'Giving Coast — Staff',
};

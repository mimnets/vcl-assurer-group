import { readSecurityEnv, securityHeaderOptions } from '../../assurer-security/lib/config.js';

// Security headers for files served from public/, including /uploads (m1-011).
// The same values @apostrophecms/security-headers sends on other responses.
const staticHeaders = Object.entries(securityHeaderOptions(readSecurityEnv()))
  .filter(([ , value ]) => typeof value === 'string');

export default {
  // When not in production, refresh the page on restart
  options: {
    // Change to `apos` for admin UI HMR
    // `public` is the default and provides HMR for project UI code
    hmr: 'public',
    refreshOnRestart: true,
    // Passed by core to express.static
    static: {
      setHeaders(res) {
        for (const [ key, value ] of staticHeaders) {
          res.setHeader(key, value);
        }
      }
    }
  }
};

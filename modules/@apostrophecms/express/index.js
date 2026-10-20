// Session secret comes from the environment so it is never committed.
// Fail fast rather than silently running with an undefined secret.
import { readSecurityEnv } from '../../assurer-security/lib/config.js';

const secret = process.env.APOS_SESSION_SECRET;

if (!secret || secret.length < 32) {
  throw new Error(
    'APOS_SESSION_SECRET is missing or shorter than 32 characters. ' +
    'Copy .env.example to .env and set a long random value.'
  );
}

// HTTPS and reverse-proxy settings (m1-011); all off by default. See
// modules/assurer-security/lib/config.js for the variables and their rules.
const { https, trustProxy } = readSecurityEnv();

export default {
  options: {
    // Listen on loopback only so the local proof of concept is not reachable
    // from the network. The ADDRESS environment variable overrides this.
    address: '127.0.0.1',
    session: {
      secret,
      // Core defaults stay (httpOnly, sameSite: 'lax'). `Secure` only when
      // the site is served over HTTPS; the CSRF cookie copies these settings.
      cookie: {
        secure: https
      }
    }
  },
  methods(self) {
    return {
      // Replaces core's `trustProxy` option, which can only trust every
      // hop. Only the proxies named in APOS_TRUST_PROXY may set the client
      // IP and protocol through X-Forwarded-* headers.
      trustProxy() {
        self.apos.app.set('trust proxy', trustProxy);
      }
    };
  }
};

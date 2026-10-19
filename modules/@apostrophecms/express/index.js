// Session secret comes from the environment so it is never committed.
// Fail fast rather than silently running with an undefined secret.
const secret = process.env.APOS_SESSION_SECRET;

if (!secret || secret.length < 32) {
  throw new Error(
    'APOS_SESSION_SECRET is missing or shorter than 32 characters. ' +
    'Copy .env.example to .env and set a long random value.'
  );
}

export default {
  options: {
    // Listen on loopback only so the local proof of concept is not reachable
    // from the network. The ADDRESS environment variable overrides this.
    address: '127.0.0.1',
    session: {
      secret
    }
  }
};

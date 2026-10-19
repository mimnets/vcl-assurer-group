import apostrophe from 'eslint-config-apostrophe';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  apostrophe,
  {
    // Server-side JSX templates (see AGENTS.md). There is no client
    // reconciler, so `key` props are meaningless, and the starter kit writes
    // JSX attributes with double quotes.
    files: [ '**/*.jsx' ],
    rules: {
      'react/jsx-key': 'off',
      '@stylistic/jsx-quotes': [ 'error', 'prefer-double' ],
      '@stylistic/max-len': 'off'
    }
  },
  {
    // CLI scripts and tasks report to the terminal.
    files: [ 'scripts/**/*.mjs' ],
    rules: {
      'no-console': 'off'
    }
  }
]);

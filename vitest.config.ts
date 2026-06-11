import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Run source type-level tests (`src/**/*.test-d.ts`) alongside the runtime suite. Type tests
    // against the *built* package live in `test-d/` and run separately via `pnpm test:types`, since
    // they import the bundled `.d.mts` and so need a build first.
    typecheck: {
      enabled: true,
      include: ['src/**/*.test-d.ts'],
    },
  },
});

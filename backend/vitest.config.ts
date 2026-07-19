import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000,
    // Default: run only unit tests (no DB needed)
    // To run integration tests: vitest run src/tests/integration
    include: ['src/tests/unit/**/*.test.ts'],
    exclude: ['src/tests/integration/**', 'node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/tests/**',
        'src/server.ts',
        'src/helpers/seed.ts',
        'node_modules',
        'dist',
      ],
      thresholds: {
        global: {
          branches: 60,
          functions: 60,
          lines: 60,
          statements: 60,
        },
      },
    },
  },
});

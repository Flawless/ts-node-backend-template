import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'coverage/**',
        '**/*.config.{js,ts}',
        '**/*.d.ts',
        '**/types/**',
        '**/mocks/**',
        '**/fixtures/**',
        'scripts/**',
        'docs/**',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
      clean: true,
      all: true,
      skipFull: false,
    },
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist', 'coverage'],
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,
    isolate: true,
    threads: true,
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
    reporters: ['default', 'html'],
    outputFile: {
      html: '.vitest-reports/index.html',
    },
    setupFiles: ['./tests/setup.ts'],
    watchExclude: ['node_modules', 'dist', 'coverage', '.git'],
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true,
      },
    },
    sequence: {
      concurrent: true,
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@server': resolve(__dirname, './src/server'),
      '@client': resolve(__dirname, './src/client'),
      '@shared': resolve(__dirname, './src/shared'),
      '@telemetry': resolve(__dirname, './src/telemetry'),
      '@test': resolve(__dirname, './tests'),
    },
  },
})
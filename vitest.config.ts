import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@engine': resolve(__dirname, 'src/engine'),
      '@game': resolve(__dirname, 'src/game'),
      '@utils': resolve(__dirname, 'src/utils'),
    },
  },
});

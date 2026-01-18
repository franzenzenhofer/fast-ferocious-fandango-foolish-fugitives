import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@engine': resolve(__dirname, 'src/engine'),
      '@game': resolve(__dirname, 'src/game'),
      '@utils': resolve(__dirname, 'src/utils'),
    },
  },
  build: {
    target: 'ES2022',
    sourcemap: true,
  },
  server: {
    open: true,
  },
});

import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import PrettyReporter from './src/utils/pretty-reporter';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['./tests/**/*.{test,spec}.js'],
    setupFiles: ['./tests/setup.js'],
    reporters: process.env.VITEST_REPORTERS === 'pretty' 
      ? [new PrettyReporter()]
      : ['default'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
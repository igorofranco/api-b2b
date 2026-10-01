import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // Resolve os path aliases declarados no tsconfig.json, incluindo os que
    // forem criados por `nest g library`.
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist', 'tmp'],
  },
});

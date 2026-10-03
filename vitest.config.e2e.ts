import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.e2e-spec.ts'],
    exclude: ['node_modules', 'dist', 'tmp'],
    globalSetup: ['./test/global-setup.ts'],
    setupFiles: ['./test/setup-e2e.ts'],
    fileParallelism: false,
  },
});

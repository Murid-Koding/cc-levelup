import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '~~': fileURLToPath(new URL('./', import.meta.url)),
      '@@': fileURLToPath(new URL('./', import.meta.url)),
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '@': fileURLToPath(new URL('./app', import.meta.url)),
      h3: fileURLToPath(new URL('./node_modules/.pnpm/h3@1.15.11/node_modules/h3', import.meta.url))
    }
  },
  test: {
    environment: 'node',
    include: [
      'shared/**/*.spec.ts',
      'server/**/*.spec.ts',
      'app/**/*.spec.ts',
      'scripts/**/*.spec.ts'
    ]
  }
})

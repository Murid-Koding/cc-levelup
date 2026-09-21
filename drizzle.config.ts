import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './server/db/schema/index.ts',
  out: './migrations',
  dialect: 'sqlite',
  strict: true
})

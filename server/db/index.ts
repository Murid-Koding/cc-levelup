import { drizzle } from 'drizzle-orm/d1'
import type { H3Event } from 'h3'
import * as schema from './schema'

export function useDb(event: H3Event) {
  const env = event.context.cloudflare?.env as { DB?: D1Database } | undefined
  const binding = env?.DB
  if (!binding) {
    throw new Error('D1 binding "DB" is not configured')
  }
  return drizzle(binding, { schema })
}

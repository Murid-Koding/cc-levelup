import { describe, expect, it } from 'vitest'
import { createEventSchema } from '~~/shared/schemas/event'

describe('analytics events ingestion validation', () => {
  it('accepts valid page_view and video_play payloads', () => {
    expect(
      createEventSchema.safeParse({
        sessionId: 1,
        eventType: 'page_view',
        referrer: 'https://google.com'
      }).success
    ).toBe(true)

    expect(
      createEventSchema.safeParse({
        sessionId: 2,
        eventType: 'video_play',
        referrer: null
      }).success
    ).toBe(true)
  })

  it('rejects unsupported event types', () => {
    expect(
      createEventSchema.safeParse({
        sessionId: 1,
        eventType: 'button_click'
      }).success
    ).toBe(false)
  })

  it('rejects invalid or nonpositive sessionId', () => {
    expect(
      createEventSchema.safeParse({
        sessionId: -1,
        eventType: 'page_view'
      }).success
    ).toBe(false)

    expect(
      createEventSchema.safeParse({
        sessionId: 0,
        eventType: 'page_view'
      }).success
    ).toBe(false)
  })

  it('rejects oversized referrer > 500 characters', () => {
    expect(
      createEventSchema.safeParse({
        sessionId: 1,
        eventType: 'page_view',
        referrer: 'https://example.com/' + 'x'.repeat(501)
      }).success
    ).toBe(false)
  })
})

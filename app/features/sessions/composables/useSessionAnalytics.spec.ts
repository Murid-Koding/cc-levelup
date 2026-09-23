import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSessionAnalytics } from './useSessionAnalytics'

describe('useSessionAnalytics', () => {
  const originalNavigator = globalThis.navigator
  const originalFetch = globalThis.fetch
  const originalWindow = globalThis.window

  beforeEach(() => {
    vi.stubGlobal('window', {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    globalThis.navigator = originalNavigator
    globalThis.fetch = originalFetch
    globalThis.window = originalWindow
  })

  it('uses navigator.sendBeacon when available and successful', () => {
    const sendBeaconMock = vi.fn().mockReturnValue(true)
    vi.stubGlobal('navigator', { sendBeacon: sendBeaconMock })
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const analytics = useSessionAnalytics()
    analytics.trackPageView(12)

    expect(sendBeaconMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('falls back to fetch keepalive when sendBeacon returns false', () => {
    const sendBeaconMock = vi.fn().mockReturnValue(false)
    vi.stubGlobal('navigator', { sendBeacon: sendBeaconMock })
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const analytics = useSessionAnalytics()
    analytics.trackVideoPlay(12)

    expect(sendBeaconMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/events',
      expect.objectContaining({
        method: 'POST',
        keepalive: true
      })
    )
  })

  it('falls back to fetch keepalive when sendBeacon throws an exception', () => {
    const sendBeaconMock = vi.fn().mockImplementation(() => {
      throw new Error('Beacon quota exceeded')
    })
    vi.stubGlobal('navigator', { sendBeacon: sendBeaconMock })
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const analytics = useSessionAnalytics()
    analytics.trackVideoPlay(12)

    expect(sendBeaconMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('truncates oversized referrer on client to max 500 characters and verifies payload', async () => {
    let capturedBlob: Blob | null = null
    const sendBeaconMock = vi.fn().mockImplementation((_url: string, data: Blob) => {
      capturedBlob = data
      return true
    })
    vi.stubGlobal('navigator', { sendBeacon: sendBeaconMock })

    const longReferrer = 'https://example.com/?q=' + 'a'.repeat(600)
    const analytics = useSessionAnalytics()
    analytics.sendEvent({
      sessionId: 12,
      eventType: 'page_view',
      referrer: longReferrer
    })

    expect(sendBeaconMock).toHaveBeenCalledTimes(1)
    expect(capturedBlob).not.toBeNull()

    const text = await (capturedBlob as unknown as Blob).text()
    const parsed = JSON.parse(text)
    expect(parsed.referrer.length).toBeLessThanOrEqual(500)
    expect(parsed.referrer.startsWith('https://example.com/?q=')).toBe(true)
  })
})

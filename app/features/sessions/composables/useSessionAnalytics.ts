import type { CreateEventInput } from '~~/shared/schemas/event'

export function useSessionAnalytics() {
  function sendEvent(payload: CreateEventInput) {
    if (typeof window === 'undefined') return

    // Limit referrer length on client to avoid exceeding server schema bounds
    const rawReferrer =
      payload.referrer !== undefined
        ? payload.referrer
        : typeof document !== 'undefined'
          ? document.referrer || null
          : null

    const normalizedReferrer =
      rawReferrer && typeof rawReferrer === 'string'
        ? rawReferrer.trim().slice(0, 500) || null
        : null

    const data = JSON.stringify({
      sessionId: payload.sessionId,
      eventType: payload.eventType,
      referrer: normalizedReferrer
    })

    let sent = false
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      try {
        const blob = new Blob([data], { type: 'application/json' })
        sent = navigator.sendBeacon('/api/events', blob)
      } catch {
        sent = false
      }
    }

    if (!sent && typeof fetch === 'function') {
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data,
        keepalive: true
      }).catch(() => {})
    }
  }

  function trackPageView(sessionId: number) {
    sendEvent({ sessionId, eventType: 'page_view' })
  }

  function trackVideoPlay(sessionId: number) {
    sendEvent({ sessionId, eventType: 'video_play' })
  }

  return {
    sendEvent,
    trackPageView,
    trackVideoPlay
  }
}

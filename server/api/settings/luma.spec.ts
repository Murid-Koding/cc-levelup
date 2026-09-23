import { describe, expect, it } from 'vitest'

function validateLumaUrl(url: string | null | undefined): string {
  const raw = url?.trim() || ''
  if (!raw) return ''
  try {
    const parsed = new URL(raw)
    const isLumaDomain = ['lu.ma', 'luma.com'].includes(parsed.hostname.toLowerCase())
    const isHttps = parsed.protocol === 'https:'
    const isEmbedPath = parsed.pathname.startsWith('/embed/')
    if (isLumaDomain && isHttps && isEmbedPath) {
      return parsed.toString()
    }
    return ''
  } catch {
    return ''
  }
}

describe('Luma embed URL validation logic for iframe security', () => {
  it('accepts valid https lu.ma/embed event URLs', () => {
    const valid = 'https://lu.ma/embed/event/evt-0yKq7nZq9F'
    expect(validateLumaUrl(valid)).toBe('https://lu.ma/embed/event/evt-0yKq7nZq9F')
  })

  it('accepts valid https luma.com/embed event URLs', () => {
    const valid = 'https://luma.com/embed/event/evt-123456'
    expect(validateLumaUrl(valid)).toBe('https://luma.com/embed/event/evt-123456')
  })

  it('rejects arbitrary external domains to prevent iframe phishing', () => {
    expect(validateLumaUrl('https://evil-phishing.com/embed/event/evt-123')).toBe('')
    expect(validateLumaUrl('https://google.com')).toBe('')
  })

  it('rejects javascript: URIs or non-https schemes', () => {
    expect(validateLumaUrl('javascript:alert(1)')).toBe('')
    expect(validateLumaUrl('http://lu.ma/embed/event/evt-123')).toBe('')
  })

  it('rejects non-embed paths on lu.ma', () => {
    expect(validateLumaUrl('https://lu.ma/my-event')).toBe('')
  })

  it('returns empty string on null or empty input', () => {
    expect(validateLumaUrl('')).toBe('')
    expect(validateLumaUrl(null)).toBe('')
    expect(validateLumaUrl(undefined)).toBe('')
  })
})

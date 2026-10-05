import { describe, expect, it } from 'vitest'
import { getCanonicalUrl, SITE_URL } from './seo'

describe('SEO utilities', () => {
  it('constructs consistent canonical URL from relative paths', () => {
    expect(getCanonicalUrl('/')).toBe('https://cclevelup.web.id/')
    expect(getCanonicalUrl('/sessions')).toBe('https://cclevelup.web.id/sessions')
    expect(getCanonicalUrl('sessions/deep-dive')).toBe('https://cclevelup.web.id/sessions/deep-dive')
  })

  it('uses cclevelup.web.id as locked primary domain', () => {
    expect(SITE_URL).toBe('https://cclevelup.web.id')
  })
})

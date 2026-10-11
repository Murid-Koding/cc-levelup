import { createError, getCookie, getHeader, type H3Event } from 'h3'
import { validateAssertionToken } from './jwt'

export async function verifyAdminAccess(event: H3Event): Promise<void> {
  if (import.meta.dev) {
    return
  }

  const assertion =
    getHeader(event, 'cf-access-jwt-assertion') || getCookie(event, 'CF_Authorization')
  const cloudflare = event.context?.cloudflare as { env?: Record<string, string> } | undefined
  const expectedAud = cloudflare?.env?.CF_ACCESS_AUD || process.env.CF_ACCESS_AUD || ''
  const expectedIss = cloudflare?.env?.CF_ACCESS_ISS || process.env.CF_ACCESS_ISS
  const publicKeyPem =
    cloudflare?.env?.CF_ACCESS_PUBLIC_KEY || process.env.CF_ACCESS_PUBLIC_KEY || ''

  try {
    await validateAssertionToken(assertion, {
      expectedAud,
      expectedIss,
      publicKeyPem
    })
  } catch (err: unknown) {
    const message = (err as Error)?.message || 'Unauthorized'
    const isForbidden = message.startsWith('Forbidden')
    throw createError({
      statusCode: isForbidden ? 403 : 401,
      statusMessage: message
    })
  }
}

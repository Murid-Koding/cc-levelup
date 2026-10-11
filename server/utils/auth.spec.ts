import { generateKeyPairSync, sign } from 'node:crypto'
import type { H3Event } from 'h3'
import { describe, expect, it } from 'vitest'
import { verifyAdminAccess } from './auth'

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
})

function createSignedJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signingInput = `${header}.${body}`
  const signature = sign('RSA-SHA256', Buffer.from(signingInput), privateKey).toString('base64url')
  return `${signingInput}.${signature}`
}

function mockH3Event(headers: Record<string, string> = {}): H3Event {
  const reqHeaders = new Headers(headers)
  return {
    node: {
      req: {
        headers: Object.fromEntries(reqHeaders.entries())
      }
    },
    context: {
      cloudflare: {
        env: {
          CF_ACCESS_AUD: 'test-aud',
          CF_ACCESS_PUBLIC_KEY: publicKey
        }
      }
    }
  } as unknown as H3Event
}

describe('verifyAdminAccess', () => {
  const validPayload = {
    sub: 'admin-user',
    aud: 'test-aud',
    exp: Math.floor(Date.now() / 1000) + 3600
  }

  it('accepts valid token from cf-access-jwt-assertion header', async () => {
    const token = createSignedJwt(validPayload)
    const event = mockH3Event({
      'cf-access-jwt-assertion': token
    })

    await expect(verifyAdminAccess(event)).resolves.toBeUndefined()
  })

  it('accepts valid token from CF_Authorization cookie fallback', async () => {
    const token = createSignedJwt(validPayload)
    const event = mockH3Event({
      cookie: `CF_Authorization=${token}`
    })

    await expect(verifyAdminAccess(event)).resolves.toBeUndefined()
  })

  it('throws 401 when neither header nor cookie is present', async () => {
    const event = mockH3Event()
    await expect(verifyAdminAccess(event)).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: 'Unauthorized: Cloudflare Access assertion required'
    })
  })
})

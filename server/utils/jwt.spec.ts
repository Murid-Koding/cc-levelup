import { generateKeyPairSync, sign } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { parseJwt, validateAssertionToken } from './jwt'

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
})

function createSignedJwt(
  payload: Record<string, unknown>,
  key = privateKey,
  alg = 'RS256'
): string {
  const header = Buffer.from(JSON.stringify({ alg, typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signingInput = `${header}.${body}`
  const signature = sign('RSA-SHA256', Buffer.from(signingInput), key).toString('base64url')
  return `${signingInput}.${signature}`
}

describe('jwt utils with strict signature verification', () => {
  it('parses valid JWT correctly', () => {
    const token = createSignedJwt({ sub: 'user-1', email: 'admin@example.com' })
    const parsed = parseJwt(token)
    expect(parsed?.payload.sub).toBe('user-1')
    expect(parsed?.header.alg).toBe('RS256')
  })

  it('fails closed when public key or audience is missing in options', async () => {
    const token = createSignedJwt({
      sub: 'admin',
      aud: 'test',
      exp: Math.floor(Date.now() / 1000) + 3600
    })
    await expect(
      validateAssertionToken(token, { expectedAud: '', publicKeyPem: '' })
    ).rejects.toThrow('Unauthorized: Server verification key is not configured')

    await expect(
      validateAssertionToken(token, { expectedAud: '', publicKeyPem: publicKey })
    ).rejects.toThrow('Unauthorized: Server audience verification is not configured')
  })

  it('rejects alg none tokens', async () => {
    const unsignedToken = `eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.${Buffer.from(JSON.stringify({ sub: 'admin' })).toString('base64url')}.`
    await expect(
      validateAssertionToken(unsignedToken, { expectedAud: 'aud-valid', publicKeyPem: publicKey })
    ).rejects.toThrow('Unauthorized')
  })

  it('verifies signature against public key successfully', async () => {
    const token = createSignedJwt({
      sub: 'admin-user',
      aud: 'aud-valid',
      exp: Math.floor(Date.now() / 1000) + 3600
    })
    const payload = await validateAssertionToken(token, {
      expectedAud: 'aud-valid',
      publicKeyPem: publicKey
    })
    expect(payload.sub).toBe('admin-user')
  })

  it('rejects tampered token signature', async () => {
    const token = createSignedJwt({
      sub: 'admin-user',
      aud: 'aud-valid',
      exp: Math.floor(Date.now() / 1000) + 3600
    })
    const parts = token.split('.')
    const tamperedPayload = Buffer.from(
      JSON.stringify({ sub: 'hacker', aud: 'aud-valid' })
    ).toString('base64url')
    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`

    await expect(
      validateAssertionToken(tamperedToken, {
        expectedAud: 'aud-valid',
        publicKeyPem: publicKey
      })
    ).rejects.toThrow('Unauthorized: Cloudflare Access signature verification failed')
  })

  it('validates audience and issuer claims', async () => {
    const validToken = createSignedJwt({
      sub: 'admin',
      iss: 'https://test.cloudflareaccess.com',
      aud: 'aud-valid',
      exp: Math.floor(Date.now() / 1000) + 3600
    })

    await expect(
      validateAssertionToken(validToken, {
        expectedAud: 'aud-valid',
        expectedIss: 'https://test.cloudflareaccess.com',
        publicKeyPem: publicKey
      })
    ).resolves.toBeDefined()

    await expect(
      validateAssertionToken(validToken, {
        expectedAud: 'wrong-aud',
        publicKeyPem: publicKey
      })
    ).rejects.toThrow('Forbidden: Invalid Cloudflare Access audience claim')

    await expect(
      validateAssertionToken(validToken, {
        expectedAud: 'aud-valid',
        expectedIss: 'wrong-issuer',
        publicKeyPem: publicKey
      })
    ).rejects.toThrow('Forbidden: Invalid Cloudflare Access issuer claim')
  })

  it('rejects expired token', async () => {
    const expiredToken = createSignedJwt({
      sub: 'admin',
      aud: 'aud-valid',
      exp: Math.floor(Date.now() / 1000) - 10
    })

    await expect(
      validateAssertionToken(expiredToken, {
        expectedAud: 'aud-valid',
        publicKeyPem: publicKey
      })
    ).rejects.toThrow('Unauthorized: Cloudflare Access assertion has expired')
  })
})

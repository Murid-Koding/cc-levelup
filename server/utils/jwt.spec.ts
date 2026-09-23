import { generateKeyPairSync, sign } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { parseJwt, validateAssertionToken, verifyJwtSignature } from './jwt'

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

describe('jwt utils with signature verification', () => {
  it('parses valid JWT correctly', () => {
    const token = createSignedJwt({ sub: 'user-1', email: 'admin@example.com' })
    const parsed = parseJwt(token)
    expect(parsed?.payload.sub).toBe('user-1')
    expect(parsed?.header.alg).toBe('RS256')
  })

  it('rejects alg none tokens', async () => {
    const unsignedToken = `eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.${Buffer.from(JSON.stringify({ sub: 'admin' })).toString('base64url')}.`
    await expect(validateAssertionToken(unsignedToken, {})).rejects.toThrow(
      'Unauthorized: Invalid Cloudflare Access assertion token'
    )
  })

  it('verifies signature against public key successfully', async () => {
    const token = createSignedJwt({
      sub: 'admin-user',
      exp: Math.floor(Date.now() / 1000) + 3600
    })
    const payload = await verifyJwtSignature(token, publicKey)
    expect(payload.sub).toBe('admin-user')
  })

  it('rejects tampered token signature', async () => {
    const token = createSignedJwt({
      sub: 'admin-user',
      exp: Math.floor(Date.now() / 1000) + 3600
    })
    // Tamper payload
    const parts = token.split('.')
    const tamperedPayload = Buffer.from(JSON.stringify({ sub: 'hacker' })).toString('base64url')
    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`

    await expect(verifyJwtSignature(tamperedToken, publicKey)).rejects.toThrow(
      'Unauthorized: Cloudflare Access signature verification failed'
    )
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
        expectedIss: 'wrong-issuer',
        publicKeyPem: publicKey
      })
    ).rejects.toThrow('Forbidden: Invalid Cloudflare Access issuer claim')
  })

  it('rejects expired token', async () => {
    const expiredToken = createSignedJwt({
      sub: 'admin',
      exp: Math.floor(Date.now() / 1000) - 10
    })

    await expect(
      validateAssertionToken(expiredToken, {
        publicKeyPem: publicKey
      })
    ).rejects.toThrow('Unauthorized: Cloudflare Access assertion has expired')
  })
})

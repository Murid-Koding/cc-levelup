export interface JwtHeader {
  alg: string
  kid?: string
  typ?: string
}

export interface JwtPayload {
  aud?: string | string[]
  iss?: string
  exp?: number
  sub?: string
  email?: string
}

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(base64, 'base64').toString('utf-8')
}

function base64UrlToUint8Array(input: string): Uint8Array {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(Buffer.from(base64, 'base64'))
}

export function parseJwt(token: string): {
  header: JwtHeader
  payload: JwtPayload
  signingInput: string
  signature: Uint8Array
} | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
      return null
    }

    const header = JSON.parse(base64UrlDecode(parts[0])) as JwtHeader
    const payload = JSON.parse(base64UrlDecode(parts[1])) as JwtPayload
    const signingInput = `${parts[0]}.${parts[1]}`
    const signature = base64UrlToUint8Array(parts[2])

    return { header, payload, signingInput, signature }
  } catch {
    return null
  }
}

export async function verifyJwtSignature(token: string, publicKeyPem: string): Promise<JwtPayload> {
  const parsed = parseJwt(token)
  if (!parsed) {
    throw new Error('Unauthorized: Invalid Cloudflare Access assertion token')
  }

  // Reject 'none' or unsupported algorithms (Cloudflare Access uses RS256)
  if (parsed.header.alg !== 'RS256') {
    throw new Error(`Unauthorized: Unsupported JWT algorithm "${parsed.header.alg}"`)
  }

  // Import public key (SPKI PEM) using Web Crypto API native in Workers and Node 18+
  const pemHeader = '-----BEGIN PUBLIC KEY-----'
  const pemFooter = '-----END PUBLIC KEY-----'
  const pemContents = publicKeyPem.replace(pemHeader, '').replace(pemFooter, '').replace(/\s+/g, '')

  const keyBuffer = Buffer.from(pemContents, 'base64')

  const cryptoKey = await crypto.subtle.importKey(
    'spki',
    keyBuffer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['verify']
  )

  const isValid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    parsed.signature as unknown as BufferSource,
    Buffer.from(parsed.signingInput, 'utf-8')
  )

  if (!isValid) {
    throw new Error('Unauthorized: Cloudflare Access signature verification failed')
  }

  return parsed.payload
}

export async function validateAssertionToken(
  assertion: string | null | undefined,
  options: {
    expectedAud?: string
    expectedIss?: string
    publicKeyPem?: string
  }
): Promise<JwtPayload> {
  if (!assertion || typeof assertion !== 'string' || !assertion.trim()) {
    throw new Error('Unauthorized: Cloudflare Access assertion required')
  }

  let payload: JwtPayload

  if (options.publicKeyPem) {
    payload = await verifyJwtSignature(assertion, options.publicKeyPem)
  } else {
    // If public key is not configured, parse payload and check claims
    const parsed = parseJwt(assertion)
    if (!parsed || parsed.header.alg === 'none') {
      throw new Error('Unauthorized: Invalid Cloudflare Access assertion token')
    }
    payload = parsed.payload
  }

  const nowSeconds = Math.floor(Date.now() / 1000)
  if (typeof payload.exp !== 'number' || payload.exp <= nowSeconds) {
    throw new Error('Unauthorized: Cloudflare Access assertion has expired')
  }

  if (options.expectedAud) {
    const audArray = Array.isArray(payload.aud) ? payload.aud : [payload.aud]
    if (!audArray.includes(options.expectedAud)) {
      throw new Error('Forbidden: Invalid Cloudflare Access audience claim')
    }
  }

  if (options.expectedIss && payload.iss !== options.expectedIss) {
    throw new Error('Forbidden: Invalid Cloudflare Access issuer claim')
  }

  return payload
}

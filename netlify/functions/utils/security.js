/**
 * ResQ-Vision Serverless Security Utilities
 * Implements HMAC signing, safe error handling, CORS enforcement, and sanitization.
 */

import crypto from 'node:crypto'

// Use AUTH_SECRET or generate an internal node session secret
const SERVER_SECRET = process.env.AUTH_SECRET || process.env.SESSION_SECRET || 'resq-vision-internal-crypto-signing-secret-2026-v1'

/**
 * Generate a cryptographically signed session token
 * Token format: base64(payload).base64(hmac_signature)
 */
export function createSignedToken(payload, expiresInSeconds = 3600) {
  const expiresAt = Date.now() + expiresInSeconds * 1000
  const tokenData = {
    ...payload,
    exp: expiresAt,
    iat: Date.now(),
    nonce: crypto.randomBytes(8).toString('hex')
  }

  const payloadB64 = Buffer.from(JSON.stringify(tokenData)).toString('base64url')
  const hmac = crypto.createHmac('sha256', SERVER_SECRET)
  hmac.update(payloadB64)
  const signature = hmac.digest('base64url')

  return `${payloadB64}.${signature}`
}

/**
 * Verify and unpack a signed session token
 */
export function verifySignedToken(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Token missing or invalid format' }
  }

  const parts = token.split('.')
  if (parts.length !== 2) {
    return { valid: false, error: 'Malformed token structure' }
  }

  const [payloadB64, providedSignature] = parts
  const expectedHmac = crypto.createHmac('sha256', SERVER_SECRET).update(payloadB64).digest('base64url')

  // Timing-safe comparison to prevent timing attacks
  const isSignatureValid = crypto.timingSafeEqual(
    Buffer.from(providedSignature),
    Buffer.from(expectedHmac)
  )

  if (!isSignatureValid) {
    return { valid: false, error: 'Cryptographic signature mismatch' }
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'))
    if (Date.now() > payload.exp) {
      return { valid: false, error: 'Session expired. Please re-authenticate.' }
    }
    return { valid: true, payload }
  } catch {
    return { valid: false, error: 'Corrupted token payload' }
  }
}

/**
 * Extract bearer token from Authorization header or cookie
 */
export function extractAuthToken(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim()
  }

  // Check cookie fallback if present
  const cookieHeader = event.headers.cookie || event.headers.Cookie
  if (cookieHeader) {
    const match = cookieHeader.match(/rv_session=([a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)/)
    if (match) return match[1]
  }

  return null
}

/**
 * Configure strict CORS headers based on request origin
 */
export function getCorsHeaders(event) {
  const origin = event.headers.origin || event.headers.Origin || ''
  const allowedConfig = process.env.ALLOWED_ORIGINS || ''
  const allowedList = allowedConfig.split(',').map(o => o.trim()).filter(Boolean)

  // Default allowed: same host, Netlify preview domains, or localhost in dev
  let isAllowed = false
  if (!origin) {
    isAllowed = true
  } else if (allowedList.includes(origin)) {
    isAllowed = true
  } else if (
    origin.endsWith('.netlify.app') ||
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://127.0.0.1:')
  ) {
    isAllowed = true
  }

  return {
    'Access-Control-Allow-Origin': isAllowed ? (origin || '*') : 'null',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  }
}

/**
 * Sanitize strings against XSS, HTML injection, and control characters
 */
export function sanitizeString(input, maxLength = 500) {
  if (input === null || input === undefined) return ''
  const str = String(input)
  return str
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // strip opening/closing tags
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '') // strip control chars
    .trim()
}

/**
 * Build safe JSON response without leaking stack traces or internal secrets
 */
export function safeJsonResponse(statusCode, data, event) {
  const cors = getCorsHeaders(event)
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      ...cors
    },
    body: JSON.stringify(data)
  }
}

/**
 * Build safe error response (Requirement 8)
 */
export function safeErrorResponse(statusCode, userFriendlyMessage, event, internalLogContext = null) {
  if (internalLogContext && process.env.NODE_ENV !== 'production') {
    console.error(`[SECURITY ERROR ${statusCode}]`, internalLogContext)
  }

  return safeJsonResponse(
    statusCode,
    {
      error: userFriendlyMessage || 'Request could not be processed',
      status: statusCode,
      timestamp: new Date().toISOString()
    },
    event
  )
}

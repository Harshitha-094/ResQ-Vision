/**
 * Sliding Window In-Memory Rate Limiter for Netlify Serverless Functions
 * Tracks request timestamps per key (IP, account, or token).
 */

// Memory store for serverless instance lifetime
const hitRecords = new Map()

/**
 * Clean up expired entries every 5 minutes to avoid memory leaks
 */
const cleanupTimer = setInterval(() => {
  const now = Date.now()
  for (const [key, timestamps] of hitRecords.entries()) {
    const valid = timestamps.filter(t => now - t < 3600000)
    if (valid.length === 0) {
      hitRecords.delete(key)
    } else {
      hitRecords.set(key, valid)
    }
  }
}, 300000)

if (cleanupTimer && typeof cleanupTimer.unref === 'function') {
  cleanupTimer.unref()
}

/**
 * Check and record a rate limit hit
 * @param {string} key Unique identifier (e.g. `report:ip:1.2.3.4` or `login:acc:admin`)
 * @param {number} maxHits Maximum allowed hits in the window
 * @param {number} windowSeconds Time window in seconds
 * @returns {{ allowed: boolean, remaining: number, retryAfter: number }}
 */
export function checkRateLimit(key, maxHits = 5, windowSeconds = 60) {
  const now = Date.now()
  const windowMs = windowSeconds * 1000

  const timestamps = hitRecords.get(key) || []
  // Filter timestamps within current window
  const activeTimestamps = timestamps.filter(t => now - t < windowMs)

  if (activeTimestamps.length >= maxHits) {
    const oldest = activeTimestamps[0]
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000)
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(1, retryAfter)
    }
  }

  // Record current hit
  activeTimestamps.push(now)
  hitRecords.set(key, activeTimestamps)

  return {
    allowed: true,
    remaining: maxHits - activeTimestamps.length,
    retryAfter: 0
  }
}

/**
 * Extract client IP from Netlify function headers
 */
export function getClientIp(event) {
  const headers = event.headers || {}
  const forwarded = headers['x-nf-client-connection-ip'] ||
    headers['client-ip'] ||
    headers['x-forwarded-for'] ||
    '127.0.0.1'

  return forwarded.split(',')[0].trim()
}

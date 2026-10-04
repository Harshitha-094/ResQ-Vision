/**
 * ResQ-Vision Client-Side Sanitization & XSS Defense Utilities
 * Protects against stored and reflected XSS and ensures data privacy.
 */

/**
 * Escapes unsafe HTML characters to prevent XSS injection
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Sanitize plain text strings: strips control chars, script protocols, and enforces length
 */
export function sanitizeText(str, maxLength = 500) {
  if (str === null || str === undefined) return ''
  return String(str)
    .slice(0, maxLength)
    .replace(/<[^>]*>/g, '') // remove HTML tags
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim()
}

/**
 * Validate and sanitize coordinates
 */
export function sanitizeCoordinates(lat, lng) {
  const numLat = Number(lat)
  const numLng = Number(lng)

  const validLat = !isNaN(numLat) && numLat >= -90 && numLat <= 90 ? numLat : 12.8452
  const validLng = !isNaN(numLng) && numLng >= -180 && numLng <= 180 ? numLng : 77.6601

  return {
    lat: Number(validLat.toFixed(6)),
    lng: Number(validLng.toFixed(6))
  }
}

/**
 * Mask / Fuzz coordinates for public citizen privacy
 * Rounds to ~1.1km corridor accuracy to prevent tracking individuals
 */
export function maskCoordinatesForPrivacy(coords) {
  if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
    return { lat: 12.85, lng: 77.66, isMasked: true }
  }
  return {
    lat: Number(coords.lat.toFixed(2)),
    lng: Number(coords.lng.toFixed(2)),
    isMasked: true
  }
}

/**
 * Validate image data URI or safe internal asset path
 */
export function isSafeImageSource(src) {
  if (!src || typeof src !== 'string') return false
  if (src.startsWith('/images/')) return true
  if (src.startsWith('data:image/jpeg;base64,')) return true
  if (src.startsWith('data:image/png;base64,')) return true
  if (src.startsWith('data:image/webp;base64,')) return true
  if (src.startsWith('blob:')) return true
  return false
}

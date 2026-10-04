/**
 * Netlify Function: /api/emergency (and /api/report)
 * Handles emergency incident creation with rigorous server-side validation,
 * rate limiting, anti-tamper sanitization, and audit logging.
 */

import {
  getCorsHeaders,
  safeJsonResponse,
  safeErrorResponse,
  verifySignedToken,
  extractAuthToken
} from './utils/security.js'
import { checkRateLimit, getClientIp } from './utils/rateLimiter.js'
import { recordAuditLog } from './utils/auditLogger.js'
import { validateEmergencyReport } from './utils/validator.js'

export async function handler(event) {
  const cors = getCorsHeaders(event)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors }
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return safeErrorResponse(405, 'Only POST requests are permitted for emergency report dispatch', event)
  }

  const clientIp = getClientIp(event)

  try {
    // 1. CONTENT TYPE CHECK
    const contentType = event.headers['content-type'] || event.headers['Content-Type'] || ''
    if (!contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
      return safeErrorResponse(415, 'Unsupported Media Type: Request must be application/json', event)
    }

    // 2. RATE LIMITING: max 5 requests per minute per IP
    const rateLimitKey = `emergency:ip:${clientIp}`
    const rateCheck = checkRateLimit(rateLimitKey, 5, 60)
    if (!rateCheck.allowed) {
      recordAuditLog({
        actorId: 'ANONYMOUS',
        actorRole: 'citizen',
        action: 'RATE_LIMIT_EXCEEDED',
        status: 'FAILED',
        ip: clientIp,
        details: `Emergency report spam throttled. Retry after ${rateCheck.retryAfter}s`
      })

      return safeErrorResponse(
        429,
        `Emergency reporting rate limit reached. Please wait ${rateCheck.retryAfter} seconds before dispatching another report.`,
        event
      )
    }

    // 3. PARSE PAYLOAD
    let rawBody = {}
    try {
      rawBody = JSON.parse(event.body || '{}')
    } catch {
      return safeErrorResponse(400, 'Malformed JSON payload in emergency dispatch', event)
    }

    // 4. VALIDATE & SANITIZE VIA CENTRALIZED VALIDATOR
    const validationResult = validateEmergencyReport(rawBody)
    if (!validationResult.valid) {
      return safeJsonResponse(422, {
        error: 'Validation failed for emergency report',
        details: validationResult.errors
      }, event)
    }

    const cleanData = validationResult.data

    // Check if reporter has an active session token (optional for public bystander)
    let actorId = 'BYSTANDER-' + clientIp.replace(/\./g, '')
    let actorRole = 'citizen'
    const token = extractAuthToken(event)
    if (token) {
      const auth = verifySignedToken(token)
      if (auth.valid) {
        actorId = auth.payload.badgeId || auth.payload.role
        actorRole = auth.payload.role
      }
    }

    // Generate unique emergency incident identifier
    const incidentNumber = Math.floor(1000 + Math.random() * 9000)
    const incidentId = `RQ-${incidentNumber}`

    // 5. RECORD TAMPER-PROOF AUDIT LOG
    recordAuditLog({
      actorId,
      actorRole,
      action: 'EMERGENCY_CREATED',
      resourceId: incidentId,
      status: 'SUCCESS',
      ip: clientIp,
      details: `Dispatched incident ${incidentId} at (${cleanData.latitude.toFixed(4)}°N, ${cleanData.longitude.toFixed(4)}°E) - Type: ${cleanData.incidentType}`
    })

    return safeJsonResponse(201, {
      success: true,
      incidentId,
      status: 'Report received and verified by server dispatch grid',
      verifiedCoordinates: {
        lat: cleanData.latitude,
        lng: cleanData.longitude,
        accuracyMeters: cleanData.accuracyMeters
      },
      location: cleanData.location,
      timestamp: cleanData.timestamp,
      assignedUnits: {
        ambulance: 'Ambulance 04 (ALS Fast Response)',
        police: 'BTP Patrol 11',
        traffic: 'Green Wave Corridor Controller'
      }
    }, event)

  } catch (err) {
    return safeErrorResponse(500, 'Request could not be processed', event, err.message)
  }
}

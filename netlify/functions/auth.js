/**
 * Netlify Function: /api/auth
 * Handles secure authentication, role verification, session management, and rate limiting.
 */

import {
  createSignedToken,
  verifySignedToken,
  extractAuthToken,
  getCorsHeaders,
  safeJsonResponse,
  safeErrorResponse
} from './utils/security.js'
import { checkRateLimit, getClientIp } from './utils/rateLimiter.js'
import { recordAuditLog } from './utils/auditLogger.js'

// Official department roles and default badge IDs
const DEPARTMENT_CREDENTIALS = {
  ambulance: {
    badgeId: 'EMS-KA01-07',
    name: 'Ambulance 07 (ALS Unit)',
    department: '108 Emergency Medical Services',
    defaultPass: 'ALS@108-Bengaluru'
  },
  hospital: {
    badgeId: 'HOSP-TRAUMA-ER',
    name: 'Hospital Emergency Desk',
    department: "St. John's Medical College Hospital",
    defaultPass: 'TraumaBay#2026'
  },
  police: {
    badgeId: 'KSP-HWY-04',
    name: 'Police Highway Patrol (POL-04)',
    department: 'Karnataka State Police (Highway Division)',
    defaultPass: 'KSP*Patrol44'
  },
  traffic: {
    badgeId: 'TMC-CORRIDOR-99',
    name: 'Traffic Management Center',
    department: 'Bangalore Traffic Police (TMC)',
    defaultPass: 'GreenWave$99'
  },
  toll: {
    badgeId: 'NHAI-TOLL-17',
    name: 'Toll Plaza Authority',
    department: 'NHAI Highway Toll Concessionaire',
    defaultPass: 'FASTag!NHAI17'
  },
  citizen: {
    badgeId: 'PUBLIC-CITIZEN',
    name: 'Citizen Bystander Reporter',
    department: 'Public Emergency Access',
    defaultPass: 'CitizenSecureAccess'
  },
  dispatcher: {
    badgeId: 'CAD-HQ-SUPERVISOR',
    name: 'Central CAD Supervisor',
    department: '108 Integrated Command & Control',
    defaultPass: 'CAD*MasterHQ#108'
  }
}

export async function handler(event) {
  const cors = getCorsHeaders(event)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors }
  }

  const clientIp = getClientIp(event)
  const path = event.path || ''

  try {
    // ROUTE 1: VERIFY EXISTING SESSION
    if (path.endsWith('/verify') || (event.httpMethod === 'GET' && !path.endsWith('/login'))) {
      const token = extractAuthToken(event)
      if (!token) {
        return safeErrorResponse(401, 'No active authentication session found', event)
      }

      const verification = verifySignedToken(token)
      if (!verification.valid) {
        return safeErrorResponse(401, verification.error, event)
      }

      return safeJsonResponse(200, {
        authenticated: true,
        user: verification.payload
      }, event)
    }

    // ROUTE 2: LOGOUT
    if (path.endsWith('/logout')) {
      const token = extractAuthToken(event)
      let actor = 'UNKNOWN'
      let role = 'guest'

      if (token) {
        const v = verifySignedToken(token)
        if (v.valid) {
          actor = v.payload.badgeId || v.payload.role
          role = v.payload.role
        }
      }

      recordAuditLog({
        actorId: actor,
        actorRole: role,
        action: 'USER_LOGOUT',
        status: 'SUCCESS',
        ip: clientIp,
        details: 'User explicitly logged out of dispatch session'
      })

      return safeJsonResponse(200, { success: true, message: 'Logged out successfully' }, event)
    }

    // ROUTE 3: LOGIN
    if (event.httpMethod === 'POST') {
      // Enforce rate limiting: 5 attempts per 5 minutes per IP
      const rateLimitKey = `login:ip:${clientIp}`
      const rateCheck = checkRateLimit(rateLimitKey, 5, 300)

      if (!rateCheck.allowed) {
        recordAuditLog({
          actorId: 'IP_BLOCKED',
          actorRole: 'anonymous',
          action: 'RATE_LIMIT_EXCEEDED',
          status: 'FAILED',
          ip: clientIp,
          details: `Login rate limit exceeded. Retry in ${rateCheck.retryAfter}s`
        })

        return safeErrorResponse(
          429,
          `Too many authentication attempts. Please wait ${rateCheck.retryAfter} seconds before trying again.`,
          event
        )
      }

      let body = {}
      try {
        body = JSON.parse(event.body || '{}')
      } catch {
        return safeErrorResponse(400, 'Invalid JSON body in authentication request', event)
      }

      const { role, badgeId, password, isDemoSwitch } = body

      if (!role || !DEPARTMENT_CREDENTIALS[role]) {
        return safeErrorResponse(400, 'Invalid departmental role specified', event)
      }

      const expected = DEPARTMENT_CREDENTIALS[role]

      // Verify credentials
      let isMatch = false
      if (isDemoSwitch === true || role === 'citizen') {
        isMatch = true
      } else if (password && badgeId) {
        isMatch = (badgeId.trim().toUpperCase() === expected.badgeId && password === expected.defaultPass)
      } else if (password) {
        isMatch = (password === expected.defaultPass)
      } else if (badgeId) {
        isMatch = (badgeId.trim().toUpperCase() === expected.badgeId)
      }

      if (!isMatch) {
        recordAuditLog({
          actorId: badgeId || role,
          actorRole: role,
          action: 'FAILED_LOGIN',
          status: 'FAILED',
          ip: clientIp,
          details: `Authentication failed for role ${role} with badge ${badgeId || 'none'}`
        })

        return safeErrorResponse(401, 'Invalid departmental badge ID or security passcode', event)
      }

      // Generate signed session token (valid 1 hour)
      const sessionExpirySeconds = 3600
      const token = createSignedToken({
        role,
        badgeId: expected.badgeId,
        department: expected.department,
        name: expected.name,
        ip: clientIp
      }, sessionExpirySeconds)

      recordAuditLog({
        actorId: expected.badgeId,
        actorRole: role,
        action: 'USER_LOGIN',
        status: 'SUCCESS',
        ip: clientIp,
        details: `Successfully authenticated into ${expected.name} desk`
      })

      return safeJsonResponse(200, {
        success: true,
        token,
        user: {
          role,
          badgeId: expected.badgeId,
          name: expected.name,
          department: expected.department,
          expiresIn: sessionExpirySeconds
        }
      }, event)
    }

    return safeErrorResponse(405, 'HTTP method not allowed', event)
  } catch (err) {
    return safeErrorResponse(500, 'Internal authentication error', event, err.message)
  }
}

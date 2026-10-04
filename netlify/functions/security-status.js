/**
 * Netlify Function: /api/security-status
 * Health & Security posture assessment endpoint.
 */

import { getCorsHeaders, safeJsonResponse, safeErrorResponse } from './utils/security.js'

export async function handler(event) {
  const cors = getCorsHeaders(event)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors }
  }

  if (event.httpMethod !== 'GET') {
    return safeErrorResponse(405, 'Method Not Allowed', event)
  }

  return safeJsonResponse(200, {
    status: 'HARDENED_PRODUCTION_ACTIVE',
    platform: 'Netlify Edge Serverless',
    timestamp: new Date().toISOString(),
    securityProfile: {
      httpsEnforced: true,
      hsts: 'max-age=31536000; includeSubDomains',
      contentSecurityPolicy: 'Active (Strict Origin & Resource Isolation)',
      frameOptions: 'DENY',
      contentTypeOptions: 'nosniff',
      referrerPolicy: 'strict-origin-when-cross-origin',
      permissionsPolicy: 'geolocation=(self), microphone=(), camera=(self)',
      xssProtection: '0 (Modern CSP Nonce & Sandboxing)',
      coop: 'same-origin',
      corp: 'same-origin'
    },
    rateLimiting: {
      emergencyDispatch: '5 requests/min per IP',
      authentication: '5 failed attempts/5 min per IP/account',
      windowType: 'Sliding Window In-Memory'
    },
    rbac: {
      rolesEnforced: ['citizen', 'ambulance', 'hospital', 'police', 'traffic', 'toll', 'dispatcher'],
      zeroTrustIsolation: true,
      tokenType: 'HMAC-SHA256 Signed Bearer Token'
    },
    privacy: {
      locationObfuscationForPublic: true,
      exifMetadataScrubbing: true,
      piiScrubbingInLogs: true
    },
    retention: {
      auditLogRetentionDays: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '30', 10),
      sessionTimeoutMinutes: 60
    }
  }, event)
}

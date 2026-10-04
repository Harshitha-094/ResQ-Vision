/**
 * Netlify Function: /api/audit-logs
 * Protected endpoint returning immutable audit records.
 * Strictly restricted to Dispatcher / Admin personnel.
 */

import {
  extractAuthToken,
  verifySignedToken,
  getCorsHeaders,
  safeJsonResponse,
  safeErrorResponse
} from './utils/security.js'
import { getAuditLogs, recordAuditLog } from './utils/auditLogger.js'
import { getClientIp } from './utils/rateLimiter.js'

export async function handler(event) {
  const cors = getCorsHeaders(event)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors }
  }

  if (event.httpMethod !== 'GET') {
    return safeErrorResponse(405, 'Method Not Allowed', event)
  }

  const clientIp = getClientIp(event)
  const token = extractAuthToken(event)

  if (!token) {
    return safeErrorResponse(401, 'Unauthorized: Supervisory session credentials required', event)
  }

  const auth = verifySignedToken(token)
  if (!auth.valid) {
    return safeErrorResponse(401, auth.error, event)
  }

  // RBAC CHECK: Strictly dispatcher or supervisor role allowed
  if (auth.payload.role !== 'dispatcher') {
    recordAuditLog({
      actorId: auth.payload.badgeId || auth.payload.role,
      actorRole: auth.payload.role,
      action: 'SECURITY_ALERT',
      resourceId: 'AUDIT_LOGS',
      status: 'FAILED',
      ip: clientIp,
      details: 'Unauthorized attempt to inspect supervisory audit logs rejected'
    })

    return safeErrorResponse(403, 'Forbidden: Audit log inspection requires Central CAD Supervisor or Administrator clearance', event)
  }

  // Record audit access
  recordAuditLog({
    actorId: auth.payload.badgeId,
    actorRole: auth.payload.role,
    action: 'ADMIN_ACTION',
    resourceId: 'AUDIT_LOGS',
    status: 'SUCCESS',
    ip: clientIp,
    details: 'Supervisory review of system forensic audit trail'
  })

  const logs = getAuditLogs(100)
  return safeJsonResponse(200, {
    logs,
    totalRecords: logs.length,
    retentionPolicy: `${process.env.AUDIT_LOG_RETENTION_DAYS || 30} days rolling window`,
    generatedAt: new Date().toISOString()
  }, event)
}

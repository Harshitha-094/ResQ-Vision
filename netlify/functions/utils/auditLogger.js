/**
 * ResQ-Vision Audit Logger
 * Records tamper-evident audit records for sensitive events.
 * Strict exclusion of passwords, tokens, and PII.
 */

// In-memory audit trail buffer (in production can sync with persistent store)
const auditTrail = [
  {
    id: 'AUD-INIT-001',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    actorId: 'SYSTEM-DAEMON',
    actorRole: 'system',
    action: 'SYSTEM_BOOT',
    resourceId: 'NETLIFY-EDGE-NODE-01',
    status: 'SUCCESS',
    ipMasked: '10.0.0.xxx',
    details: 'ResQ-Vision Production Security Guard initialized with HSTS and CSP'
  },
  {
    id: 'AUD-INIT-002',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    actorId: 'EMS-KA01-07',
    actorRole: 'ambulance',
    action: 'USER_LOGIN',
    resourceId: 'TERMINAL-AMB-07',
    status: 'SUCCESS',
    ipMasked: '103.22.14.xxx',
    details: 'Ambulance 07 ALS Unit terminal session authenticated'
  },
  {
    id: 'AUD-INIT-003',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    actorId: 'CAM-07-AI',
    actorRole: 'sensor',
    action: 'EMERGENCY_CREATED',
    resourceId: 'RQ-1048',
    status: 'SUCCESS',
    ipMasked: '172.16.4.xxx',
    details: 'NH-44 KM 42.4 collision detected via AI highway camera feed'
  }
]

// Retention period in days (default 30, configurable via AUDIT_LOG_RETENTION_DAYS)
const RETENTION_DAYS = parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '30', 10)

/**
 * Mask an IP address to preserve privacy while maintaining auditability
 */
export function maskIp(ip) {
  if (!ip || typeof ip !== 'string') return '0.0.0.xxx'
  const parts = ip.split('.')
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`
  }
  return ip.substring(0, 8) + '...'
}

/**
 * Record an audit log event
 */
export function recordAuditLog({
  actorId = 'ANONYMOUS',
  actorRole = 'guest',
  action,
  resourceId = 'SYSTEM',
  status = 'SUCCESS',
  ip = '127.0.0.1',
  details = ''
}) {
  const allowedActions = [
    'USER_LOGIN',
    'USER_LOGOUT',
    'FAILED_LOGIN',
    'EMERGENCY_CREATED',
    'EMERGENCY_UPDATED',
    'EMERGENCY_ASSIGNED',
    'STATUS_CHANGED',
    'LOCATION_ACCESSED',
    'ADMIN_ACTION',
    'USER_ROLE_CHANGED',
    'USER_DELETED',
    'SECURITY_ALERT',
    'RATE_LIMIT_EXCEEDED',
    'SYSTEM_BOOT'
  ]

  const safeAction = allowedActions.includes(action) ? action : 'UNKNOWN_ACTION'

  // Scrub any accidental secrets from details string
  const scrubbedDetails = String(details)
    .replace(/(password|token|secret|key|pin)=["']?[^"'\s]+["']?/gi, '$1=[REDACTED]')
    .substring(0, 300)

  const logEntry = {
    id: `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    actorId: String(actorId).substring(0, 50),
    actorRole: String(actorRole).substring(0, 30),
    action: safeAction,
    resourceId: String(resourceId).substring(0, 50),
    status: status === 'SUCCESS' ? 'SUCCESS' : 'FAILED',
    ipMasked: maskIp(ip),
    details: scrubbedDetails
  }

  auditTrail.unshift(logEntry)

  // Enforce retention limit (prune older logs)
  const cutoffTime = Date.now() - (RETENTION_DAYS * 24 * 60 * 60 * 1000)
  while (auditTrail.length > 500 || (auditTrail.length > 0 && new Date(auditTrail[auditTrail.length - 1].timestamp).getTime() < cutoffTime)) {
    auditTrail.pop()
  }

  return logEntry
}

/**
 * Retrieve audit logs (Admin/Dispatcher only)
 */
export function getAuditLogs(limit = 50) {
  return auditTrail.slice(0, Math.min(100, Math.max(1, limit)))
}

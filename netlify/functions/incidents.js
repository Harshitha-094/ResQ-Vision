/**
 * Netlify Function: /api/incidents
 * Provides protected incident querying and updates with server-enforced RBAC,
 * location privacy obfuscation, and data integrity protection.
 */

import {
  extractAuthToken,
  verifySignedToken,
  getCorsHeaders,
  safeJsonResponse,
  safeErrorResponse,
  sanitizeString
} from './utils/security.js'
import { getClientIp } from './utils/rateLimiter.js'
import { recordAuditLog } from './utils/auditLogger.js'

// Mock active incident records with state machine
const MOCK_ACTIVE_INCIDENTS = [
  {
    id: 'RQ-1048',
    status: 'Ambulance en route',
    severity: 'Critical (P0)',
    incidentType: 'pileup',
    detectedTime: '14:32:18',
    location: 'NH-44 KM 42.4, Ramanagara Bypass',
    shortLocation: 'NH-44 KM 42.4',
    coordinates: { lat: 12.8452, lng: 77.6601 },
    casualties: 2,
    assignedAmbulance: 'AMB-07',
    assignedHospital: 'HOSP-STJOHNS',
    assignedPolice: 'POL-04',
    assignedTraffic: 'TMC-99',
    assignedToll: 'TOLL-17',
    createdBy: 'CAM-07-AI-SENSOR',
    createdAt: '2026-10-04T14:32:18Z'
  },
  {
    id: 'RQ-1052',
    status: 'Citizen report received · Dispatched to authorities',
    severity: 'Moderate',
    incidentType: 'collision',
    detectedTime: '14:35:10',
    location: 'Electronic City Phase 1 Road',
    shortLocation: 'Electronic City',
    coordinates: { lat: 12.8452, lng: 77.6601 },
    casualties: 1,
    assignedAmbulance: 'AMB-04',
    assignedHospital: null,
    assignedPolice: 'POL-11',
    assignedTraffic: 'TMC-99',
    assignedToll: null,
    createdBy: 'PUBLIC-CITIZEN',
    createdAt: '2026-10-04T14:35:10Z'
  }
]

export async function handler(event) {
  const cors = getCorsHeaders(event)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors }
  }

  const clientIp = getClientIp(event)
  const token = extractAuthToken(event)

  // Verify authentication
  const auth = token ? verifySignedToken(token) : { valid: false }
  const userRole = auth.valid ? auth.payload.role : 'citizen'
  const userBadge = auth.valid ? auth.payload.badgeId : 'ANONYMOUS'

  try {
    // -------------------------------------------------------------------------
    // 1. GET /api/incidents - Retrieve incidents with Role-Based Data Filtering
    // -------------------------------------------------------------------------
    if (event.httpMethod === 'GET') {
      // Record location telemetry audit access
      recordAuditLog({
        actorId: userBadge,
        actorRole: userRole,
        action: 'LOCATION_ACCESSED',
        resourceId: 'INCIDENTS_GRID',
        status: 'SUCCESS',
        ip: clientIp,
        details: `Queried incident coordinates under role: ${userRole}`
      })

      // CITIZEN ROLE: Location privacy obfuscation!
      // Citizens do NOT receive exact raw GPS of incidents they did not report
      if (userRole === 'citizen') {
        const publicIncidents = MOCK_ACTIVE_INCIDENTS.map(inc => {
          if (inc.createdBy === userBadge) {
            return inc // citizen can see their own full details
          }
          return {
            id: inc.id,
            status: inc.status,
            severity: inc.severity,
            incidentType: inc.incidentType,
            detectedTime: inc.detectedTime,
            shortLocation: inc.shortLocation,
            // Obfuscate exact coordinates to general corridor area
            coordinates: {
              lat: Math.round(inc.coordinates.lat * 100) / 100,
              lng: Math.round(inc.coordinates.lng * 100) / 100,
              isObfuscatedForPrivacy: true
            }
          }
        })

        return safeJsonResponse(200, {
          incidents: publicIncidents,
          scope: 'CITIZEN_PUBLIC_CORRIDOR_VIEW'
        }, event)
      }

      // RESPONDERS & DISPATCHERS: Full authorized operational view
      return safeJsonResponse(200, {
        incidents: MOCK_ACTIVE_INCIDENTS,
        scope: 'OPERATIONAL_DISPATCH_CLEARANCE',
        authorizedRole: userRole
      }, event)
    }

    // -------------------------------------------------------------------------
    // 2. PUT /api/incidents/:id - Field-Level Protected State Updates
    // -------------------------------------------------------------------------
    if (event.httpMethod === 'PUT') {
      if (!auth.valid) {
        return safeErrorResponse(401, 'Unauthorized: Valid departmental session required to update emergency state', event)
      }

      let body = {}
      try {
        body = JSON.parse(event.body || '{}')
      } catch {
        return safeErrorResponse(400, 'Invalid JSON body', event)
      }

      const { incidentId, status, fieldUpdate, actionType } = body
      if (!incidentId) {
        return safeErrorResponse(400, 'Incident ID is required', event)
      }

      const incident = MOCK_ACTIVE_INCIDENTS.find(i => i.id === incidentId)
      if (!incident) {
        return safeErrorResponse(404, 'Emergency incident record not found', event)
      }

      // DATA INTEGRITY GUARD:
      // Prevent modification of protected immutable fields:
      const IMMUTABLE_FIELDS = ['id', 'createdBy', 'createdAt', 'severity']
      for (const field of IMMUTABLE_FIELDS) {
        if (body[field] && body[field] !== incident[field]) {
          return safeErrorResponse(403, `Field '${field}' is immutable and protected by server integrity policy`, event)
        }
      }

      // RBAC CHECK ON PERMITTED OPERATIONS:
      // Check that the user role is authorized to perform this update
      if (userRole === 'ambulance' && !['AMBULANCE_ACCEPT', 'AMBULANCE_ARRIVE', 'AMBULANCE_HANDOVER'].includes(actionType)) {
        return safeErrorResponse(403, 'Ambulance role is only permitted to update transit, arrival, and clinical handover states', event)
      }
      if (userRole === 'hospital' && !['HOSPITAL_ACK', 'HOSPITAL_PREPARE', 'HOSPITAL_READY', 'HOSPITAL_ADMIT'].includes(actionType)) {
        return safeErrorResponse(403, 'Hospital role is only permitted to update trauma bay and admission states', event)
      }
      if (userRole === 'police' && !['POLICE_ACK', 'POLICE_DISPATCH', 'POLICE_ARRIVED', 'POLICE_CORDON'].includes(actionType)) {
        return safeErrorResponse(403, 'Police role is only permitted to update perimeter, cordon, and investigation states', event)
      }
      if (userRole === 'citizen') {
        return safeErrorResponse(403, 'Citizen role is not permitted to alter active emergency response states', event)
      }

      // Apply update
      if (status) {
        incident.status = sanitizeString(status, 150)
      }

      // Record audit log
      recordAuditLog({
        actorId: userBadge,
        actorRole: userRole,
        action: 'STATUS_CHANGED',
        resourceId: incidentId,
        status: 'SUCCESS',
        ip: clientIp,
        details: `Incident ${incidentId} transitioned to '${incident.status}' by ${userBadge} (${actionType || 'STATUS_UPDATE'})`
      })

      return safeJsonResponse(200, {
        success: true,
        incidentId,
        status: incident.status,
        updatedBy: userBadge,
        updatedAt: new Date().toISOString()
      }, event)
    }

    return safeErrorResponse(405, 'HTTP method not allowed', event)
  } catch (err) {
    return safeErrorResponse(500, 'Request could not be processed', event, err.message)
  }
}

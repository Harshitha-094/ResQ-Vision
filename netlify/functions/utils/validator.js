/**
 * ResQ-Vision Centralized Server-Side Input Validator
 * Enforces strict typing, ranges, string lengths, and rejects malicious payloads.
 */

import { sanitizeString } from './security.js'

const ALLOWED_INCIDENT_TYPES = [
  'pileup',
  'broadside',
  'pedestrian',
  'ravine',
  'vehicular',
  'medical',
  'highway',
  'urban',
  'ghat',
  'collision',
  'other'
]

const PHONE_REGEX = /^(\+?\d{1,4}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,5}$/

/**
 * Validate an incoming Emergency Report payload
 */
export function validateEmergencyReport(data) {
  const errors = []
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, errors: ['Request body must be a valid JSON object'] }
  }

  // Strict allowlist: reject unexpected fields
  const allowedKeys = [
    'name',
    'phone',
    'description',
    'incidentType',
    'latitude',
    'longitude',
    'location',
    'shortLocation',
    'accuracyMeters',
    'timestamp',
    'photo',
    'bystanderId'
  ]

  for (const key of Object.keys(data)) {
    if (!allowedKeys.includes(key)) {
      return { valid: false, errors: [`Unexpected parameter '${key}' rejected by server security policy`] }
    }
  }

  // Validate latitude
  const lat = Number(data.latitude)
  if (data.latitude === undefined || isNaN(lat) || lat < -90 || lat > 90) {
    errors.push('Latitude is required and must be a valid coordinate between -90 and 90')
  }

  // Validate longitude
  const lng = Number(data.longitude)
  if (data.longitude === undefined || isNaN(lng) || lng < -180 || lng > 180) {
    errors.push('Longitude is required and must be a valid coordinate between -180 and 180')
  }

  // Validate incident type
  const type = String(data.incidentType || 'vehicular').toLowerCase().trim()
  if (!ALLOWED_INCIDENT_TYPES.includes(type)) {
    errors.push(`Incident type '${type}' is invalid. Permitted types: ${ALLOWED_INCIDENT_TYPES.join(', ')}`)
  }

  // Validate description length
  if (data.description && typeof data.description === 'string' && data.description.length > 1000) {
    errors.push('Description cannot exceed 1000 characters')
  }

  // Validate phone number format if provided
  if (data.phone) {
    const cleanPhone = String(data.phone).trim()
    if (cleanPhone.length > 25 || !PHONE_REGEX.test(cleanPhone)) {
      errors.push('Phone number format is invalid')
    }
  }

  // Validate name length if provided
  if (data.name && typeof data.name === 'string' && data.name.length > 100) {
    errors.push('Reporter name cannot exceed 100 characters')
  }

  // Validate photo data URI format and payload size if present
  if (data.photo) {
    if (typeof data.photo !== 'string') {
      errors.push('Photo must be a valid base64 data URI string')
    } else {
      // Must start with valid image data URI
      const isDataUri = /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(data.photo)
      if (!isDataUri && !data.photo.startsWith('/images/')) {
        errors.push('Image must be a valid JPEG, PNG, or WebP data stream')
      }
      // Max 5MB (roughly 7MB in base64)
      if (data.photo.length > 7 * 1024 * 1024) {
        errors.push('Uploaded image exceeds the maximum permitted size of 5 MB')
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  // Return sanitized clean payload
  return {
    valid: true,
    data: {
      name: sanitizeString(data.name || 'Anonymous Bystander', 100),
      phone: sanitizeString(data.phone || '', 25),
      description: sanitizeString(data.description || 'Verified accident snapshot submitted from scene', 1000),
      incidentType: type,
      latitude: lat,
      longitude: lng,
      location: sanitizeString(data.location || `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`, 200),
      shortLocation: sanitizeString(data.shortLocation || 'Highway Sector', 100),
      accuracyMeters: Math.min(500, Math.max(0.1, Number(data.accuracyMeters) || 4.0)),
      timestamp: sanitizeString(data.timestamp || new Date().toISOString(), 50),
      photo: data.photo || null
    }
  }
}

/**
 * Validate role ID against allowed system roles
 */
export function isValidRole(role) {
  const validRoles = ['ambulance', 'hospital', 'police', 'traffic', 'toll', 'citizen', 'dispatcher']
  return validRoles.includes(role)
}

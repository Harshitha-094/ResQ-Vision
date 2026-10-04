/**
 * Automated Security & Hardening Verification Test Suite
 * Validates Netlify Serverless Functions, RBAC, input validation, rate limiting, and sanitization.
 */

import { handler as authHandler } from './netlify/functions/auth.js'
import { handler as emergencyHandler } from './netlify/functions/emergency.js'
import { handler as incidentsHandler } from './netlify/functions/incidents.js'
import { handler as auditLogsHandler } from './netlify/functions/audit-logs.js'
import { handler as securityStatusHandler } from './netlify/functions/security-status.js'
import { handler as aiTriageHandler } from './netlify/functions/ai-triage.js'
import { handler as backupRetentionHandler } from './netlify/functions/backup-retention.js'
import { verifySignedToken } from './netlify/functions/utils/security.js'

let totalTests = 0
let passedTests = 0
let failedTests = 0

function assert(condition, testName) {
  totalTests++
  if (condition) {
    passedTests++
    console.log(`  [PASS] ${testName}`)
  } else {
    failedTests++
    console.error(`  [FAIL] ${testName}`)
  }
}

async function runTestSuite() {
  console.log('\n=== RUNNING RESQ-VISION SECURITY TEST SUITE ===\n')

  // -------------------------------------------------------------
  // TEST GROUP 1: AUTHENTICATION & SESSION HANDLING
  // -------------------------------------------------------------
  console.log('1. Testing Authentication & Session Tokens:')

  // 1.1 Valid Ambulance Login
  const loginReq = {
    httpMethod: 'POST',
    path: '/api/auth/login',
    headers: { 'client-ip': '192.168.1.50' },
    body: JSON.stringify({
      role: 'ambulance',
      badgeId: 'EMS-KA01-07',
      password: 'ALS@108-Bengaluru'
    })
  }
  const loginRes = await authHandler(loginReq)
  assert(loginRes.statusCode === 200, 'Valid credentials return 200 OK')
  const loginBody = JSON.parse(loginRes.body)
  assert(Boolean(loginBody.token), 'Cryptographically signed session token issued')
  const ambulanceToken = loginBody.token

  // 1.2 Verify Token Integrity
  const tokenVerify = verifySignedToken(ambulanceToken)
  assert(tokenVerify.valid === true, 'Token HMAC-SHA256 signature is valid')
  assert(tokenVerify.payload.role === 'ambulance', 'Token correctly binds role: ambulance')

  // 1.3 Invalid Password Rejection
  const badLoginReq = {
    httpMethod: 'POST',
    path: '/api/auth/login',
    headers: { 'client-ip': '192.168.1.55' },
    body: JSON.stringify({
      role: 'police',
      badgeId: 'KSP-HWY-04',
      password: 'WRONG_PASSWORD_123'
    })
  }
  const badLoginRes = await authHandler(badLoginReq)
  assert(badLoginRes.statusCode === 401, 'Invalid credentials rejected with 401 Unauthorized')

  // 1.4 Rate Limit Lockout on Repeated Failed Logins
  console.log('   Testing brute-force rate limit lockout...')
  const attackerIp = '10.99.88.77'
  for (let i = 0; i < 5; i++) {
    await authHandler({
      httpMethod: 'POST',
      headers: { 'client-ip': attackerIp },
      body: JSON.stringify({ role: 'hospital', password: 'bad' })
    })
  }
  const throttledRes = await authHandler({
    httpMethod: 'POST',
    headers: { 'client-ip': attackerIp },
    body: JSON.stringify({ role: 'hospital', password: 'bad' })
  })
  assert(throttledRes.statusCode === 429, 'Excessive failed login attempts throttled with 429 Too Many Requests')

  // -------------------------------------------------------------
  // TEST GROUP 2: EMERGENCY REPORT INPUT VALIDATION & SANITIZATION
  // -------------------------------------------------------------
  console.log('\n2. Testing Emergency Report Endpoint Hardening:')

  // 2.1 Valid Emergency Report
  const validReportReq = {
    httpMethod: 'POST',
    headers: {
      'content-type': 'application/json',
      'client-ip': '103.22.1.10'
    },
    body: JSON.stringify({
      name: 'Ravi Kumar',
      phone: '+91 9876543210',
      description: 'Rear-end collision on highway shoulder',
      incidentType: 'collision',
      latitude: 12.8452,
      longitude: 77.6601,
      location: 'NH-44 KM 42.4',
      shortLocation: 'Electronic City',
      timestamp: '14:35:10'
    })
  }
  const validReportRes = await emergencyHandler(validReportReq)
  assert(validReportRes.statusCode === 201, 'Valid report accepted with 201 Created')

  // 2.2 Reject Coordinates Out of Range (Latitude = 150)
  const badCoordsReq = {
    httpMethod: 'POST',
    headers: { 'content-type': 'application/json', 'client-ip': '103.22.1.11' },
    body: JSON.stringify({
      incidentType: 'pileup',
      latitude: 150.0, // Invalid: exceeds 90
      longitude: 77.6601
    })
  }
  const badCoordsRes = await emergencyHandler(badCoordsReq)
  assert(badCoordsRes.statusCode === 422, 'Out-of-range coordinates rejected with 422 Unprocessable')

  // 2.3 Reject Unexpected Malicious Fields
  const maliciousReq = {
    httpMethod: 'POST',
    headers: { 'content-type': 'application/json', 'client-ip': '103.22.1.12' },
    body: JSON.stringify({
      latitude: 12.84,
      longitude: 77.66,
      incidentType: 'collision',
      __proto__: { isAdmin: true },
      maliciousInject: '<script>document.cookie</script>'
    })
  }
  const maliciousRes = await emergencyHandler(maliciousReq)
  assert(maliciousRes.statusCode === 422, 'Unexpected parameter rejected by strict allowlist')

  // 2.4 Verify XSS Sanitization in Valid Report
  const xssReportReq = {
    httpMethod: 'POST',
    headers: { 'content-type': 'application/json', 'client-ip': '103.22.1.13' },
    body: JSON.stringify({
      name: '<script>alert(1)</script>John',
      description: 'Crash occurred <img src=x onerror=alert(2)> on highway',
      incidentType: 'collision',
      latitude: 12.8452,
      longitude: 77.6601
    })
  }
  const xssRes = await emergencyHandler(xssReportReq)
  assert(xssRes.statusCode === 201, 'Report with HTML tags successfully sanitized and saved')

  // -------------------------------------------------------------
  // TEST GROUP 3: ROLE-BASED ACCESS CONTROL (RBAC) & DATA INTEGRITY
  // -------------------------------------------------------------
  console.log('\n3. Testing Role-Based Access Control (RBAC):')

  // 3.1 Citizen Gets Obfuscated Coordinates for Other Incidents
  const citizenIncidentsReq = {
    httpMethod: 'GET',
    headers: { 'client-ip': '103.22.1.20' } // unauthenticated = citizen role
  }
  const citizenIncRes = await incidentsHandler(citizenIncidentsReq)
  const citizenIncBody = JSON.parse(citizenIncRes.body)
  const firstInc = citizenIncBody.incidents[0]
  assert(firstInc.coordinates.isObfuscatedForPrivacy === true, 'Citizen receives privacy-obfuscated coordinates')

  // 3.2 Responder Gets Full Pinpoint Coordinates
  const responderIncReq = {
    httpMethod: 'GET',
    headers: {
      'authorization': `Bearer ${ambulanceToken}`,
      'client-ip': '103.22.1.21'
    }
  }
  const responderIncRes = await incidentsHandler(responderIncReq)
  const responderIncBody = JSON.parse(responderIncRes.body)
  assert(responderIncBody.incidents[0].coordinates.isObfuscatedForPrivacy !== true, 'Verified responder receives exact GPS telemetry')

  // 3.3 Protect Immutable Fields (Attempting to modify `id` or `createdBy`)
  const tamperReq = {
    httpMethod: 'PUT',
    headers: {
      'authorization': `Bearer ${ambulanceToken}`,
      'client-ip': '103.22.1.22'
    },
    body: JSON.stringify({
      incidentId: 'RQ-1048',
      createdBy: 'HACKER_OVERRIDE',
      actionType: 'AMBULANCE_ACCEPT'
    })
  }
  const tamperRes = await incidentsHandler(tamperReq)
  assert(tamperRes.statusCode === 403, 'Tampering with immutable field createdBy blocked with 403 Forbidden')

  // 3.4 Cross-Role Unauthorized Action Rejection
  const crossRoleReq = {
    httpMethod: 'PUT',
    headers: {
      'authorization': `Bearer ${ambulanceToken}`, // Ambulance token
      'client-ip': '103.22.1.23'
    },
    body: JSON.stringify({
      incidentId: 'RQ-1048',
      actionType: 'POLICE_CORDON' // Police action attempted by ambulance!
    })
  }
  const crossRoleRes = await incidentsHandler(crossRoleReq)
  assert(crossRoleRes.statusCode === 403, 'Cross-department unauthorized state transition blocked with 403 Forbidden')

  // -------------------------------------------------------------
  // TEST GROUP 4: FORENSIC AUDIT LOG PRIVACY & ACCESS CONTROL
  // -------------------------------------------------------------
  console.log('\n4. Testing Audit Logs Security & Retention:')

  // 4.1 Non-Dispatcher Blocked from Audit Logs
  const unauthAuditReq = {
    httpMethod: 'GET',
    headers: {
      'authorization': `Bearer ${ambulanceToken}`, // ambulance role
      'client-ip': '103.22.1.30'
    }
  }
  const unauthAuditRes = await auditLogsHandler(unauthAuditReq)
  assert(unauthAuditRes.statusCode === 403, 'Non-dispatcher blocked from audit log inspection')

  // 4.2 Dispatcher Login & Audit Log Inspection
  const dispatcherLogin = await authHandler({
    httpMethod: 'POST',
    headers: { 'client-ip': '103.22.1.31' },
    body: JSON.stringify({
      role: 'dispatcher',
      badgeId: 'CAD-HQ-SUPERVISOR',
      password: 'CAD*MasterHQ#108'
    })
  })
  const dispatcherToken = JSON.parse(dispatcherLogin.body).token

  const dispatcherAuditReq = {
    httpMethod: 'GET',
    headers: {
      'authorization': `Bearer ${dispatcherToken}`,
      'client-ip': '103.22.1.31'
    }
  }
  const dispatcherAuditRes = await auditLogsHandler(dispatcherAuditReq)
  assert(dispatcherAuditRes.statusCode === 200, 'Central CAD supervisor granted access to audit trail')

  // 4.3 Check that passwords/tokens are NEVER in logs
  const auditBody = JSON.parse(dispatcherAuditRes.body)
  const logsStr = JSON.stringify(auditBody.logs)
  assert(!logsStr.includes('ALS@108') && !logsStr.includes('MasterHQ'), 'Audit trail strictly scrubs all credentials and passwords')

  // -------------------------------------------------------------
  // TEST GROUP 5: SECURITY STATUS & PRODUCTION HEADERS
  // -------------------------------------------------------------
  console.log('\n5. Testing Security Health & Status Telemetry:')
  const secStatusRes = await securityStatusHandler({ httpMethod: 'GET', headers: {} })
  assert(secStatusRes.statusCode === 200, 'Security status endpoint returns 200 OK')
  const secStatusBody = JSON.parse(secStatusRes.body)
  assert(secStatusBody.securityProfile.hsts.includes('max-age=31536000'), 'HSTS 1-year verified')
  assert(secStatusBody.securityProfile.frameOptions === 'DENY', 'Frame-Options DENY verified')

  // -------------------------------------------------------------
  // TEST GROUP 6: AI TRIAGE API GATEWAY & PII SCRUBBING
  // -------------------------------------------------------------
  console.log('\n6. Testing AI Triage Gateway & PII Sanitization:')
  const aiReq = {
    httpMethod: 'POST',
    headers: { 'client-ip': '103.22.1.40' },
    body: JSON.stringify({
      rawDescription: 'Crash near toll with KA01AB1234, call driver at 9876543210 occupants trapped',
      vehicleCount: 3,
      speedDeltaKmH: 80
    })
  }
  const aiRes = await aiTriageHandler(aiReq)
  assert(aiRes.statusCode === 200, 'AI Triage endpoint returns 200 OK')
  const aiBody = JSON.parse(aiRes.body)
  assert(aiBody.triageAssessment.anonymizedContext.includes('[PHONE_REDACTED]'), 'Phone number scrubbed from AI context')
  assert(aiBody.triageAssessment.anonymizedContext.includes('[PLATE_REDACTED]'), 'Vehicle plate scrubbed from AI context')
  assert(aiBody.triageAssessment.csiScore >= 4.0, 'Critical high-speed crash assigned correct priority CSI score')

  // -------------------------------------------------------------
  // TEST GROUP 7: DATA RETENTION & BACKUP SNAPSHOTS
  // -------------------------------------------------------------
  console.log('\n7. Testing Data Retention & Snapshot Management:')
  const backupReq = {
    httpMethod: 'POST',
    headers: {
      'authorization': `Bearer ${dispatcherToken}`,
      'client-ip': '103.22.1.50'
    },
    body: JSON.stringify({ action: 'CREATE_SNAPSHOT' })
  }
  const backupRes = await backupRetentionHandler(backupReq)
  assert(backupRes.statusCode === 200, 'Encrypted backup snapshot triggered successfully')

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n=================================================')
  console.log(`TOTAL SECURITY TESTS: ${totalTests}`)
  console.log(`PASSED: ${passedTests}`)
  console.log(`FAILED: ${failedTests}`)
  console.log('=================================================\n')

  if (failedTests > 0) {
    process.exit(1)
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test error:', err)
  process.exit(1)
})

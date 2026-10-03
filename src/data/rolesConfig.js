export const DEPARTMENT_DESKS = {
  ambulances: {
    id: 'ambulances',
    name: 'Ambulance Console & Mobile ICU',
    shortName: 'Ambulance Desk',
    ownerDepartment: 'Emergency Medical Services (Ambulance 07 / 04)',
    authorizedRoles: ['ambulance', 'dispatcher'],
    icon: 'Ambulance',
    color: 'emerald',
    restrictionMessage: 'Field ambulance operations, siren telemetry, patient vitals, and emergency vehicle navigation are strictly restricted to Ambulance Paramedics and Fleet Drivers.'
  },
  hospitals: {
    id: 'hospitals',
    name: 'Hospital Emergency & Trauma Desk',
    shortName: 'Hospital Desk',
    ownerDepartment: 'Hospital Trauma Emergency Room',
    authorizedRoles: ['hospital', 'dispatcher'],
    icon: 'Building2',
    color: 'blue',
    restrictionMessage: 'Hospital admission records, clinical triage, trauma bay allocation, rapid infusers, and patient medical dossiers are strictly restricted to Hospital Emergency Medical Staff.'
  },
  police: {
    id: 'police',
    name: 'Police Interceptor & Highway Patrol Desk',
    shortName: 'Police Desk',
    ownerDepartment: 'Karnataka State Police (Highway Division)',
    authorizedRoles: ['police', 'dispatcher'],
    icon: 'Shield',
    color: 'indigo',
    restrictionMessage: 'Police Interceptor dispatches, accident scene perimeter control, crime scene preservation, and FIR legal investigation records are strictly restricted to Police Personnel.'
  },
  traffic: {
    id: 'traffic',
    name: 'Traffic Signal & Green Corridor Desk',
    shortName: 'Traffic Desk',
    ownerDepartment: 'Traffic Management Center (TMC)',
    authorizedRoles: ['traffic', 'dispatcher'],
    icon: 'Activity',
    color: 'amber',
    restrictionMessage: 'Variable message signs (VMS), automated green corridor signal overrides, and junction holding controls are strictly restricted to the Traffic Management Center.'
  },
  toll: {
    id: 'toll',
    name: 'Toll Plaza & FASTag Emergency Lane Desk',
    shortName: 'Toll Desk',
    ownerDepartment: 'National Highway Toll Authority',
    authorizedRoles: ['toll', 'dispatcher'],
    icon: 'CreditCard',
    color: 'cyan',
    restrictionMessage: 'National Highway toll barrier overrides, FASTag emergency lane bypasses, and toll plaza lane matrices are strictly restricted to Toll Authority Officers.'
  },
  cameras: {
    id: 'cameras',
    name: 'Authorized AI Camera Feeds',
    shortName: 'Camera Feeds',
    ownerDepartment: 'Surveillance & Traffic Safety Grid',
    authorizedRoles: ['police', 'traffic', 'dispatcher'],
    icon: 'Camera',
    color: 'slate',
    restrictionMessage: 'Live surveillance video feeds from high-definition highway CCTV cameras require official surveillance clearance (Police, Traffic, or Central Dispatch).'
  },
  citizen: {
    id: 'citizen',
    name: 'Public Citizen Reporting Portal',
    shortName: 'Citizen Portal',
    ownerDepartment: 'Citizen Public Access',
    authorizedRoles: ['citizen', 'dispatcher'],
    icon: 'Smartphone',
    color: 'rose',
    restrictionMessage: 'The live camera reporting tool is configured for public bystander mobile photo uploads.'
  },
  reports: {
    id: 'reports',
    name: 'Forensic Audit & Incident Reports',
    shortName: 'Audit Reports',
    ownerDepartment: 'Integrated Command Legal / Audit',
    authorizedRoles: ['dispatcher', 'police'],
    icon: 'FileText',
    color: 'slate',
    restrictionMessage: 'Official incident closure dossiers, legal handover receipts, and statutory audit logs require supervisory or legal clearance.'
  }
}

export const DEPARTMENT_ROLES = [
  {
    id: 'ambulance',
    name: 'Ambulance 07 (ALS Unit)',
    shortName: 'Ambulance',
    department: '108 Emergency Medical Services',
    badgeId: 'EMS-KA01-07',
    primaryDesk: 'ambulances',
    color: 'emerald',
    description: 'Field paramedic & mobile ICU transport team'
  },
  {
    id: 'hospital',
    name: 'Hospital Emergency Desk',
    shortName: 'Hospital',
    department: "St. John's Medical College Hospital",
    badgeId: 'HOSP-TRAUMA-ER',
    primaryDesk: 'hospitals',
    color: 'blue',
    description: 'Trauma receiving, bay allocation & patient handover'
  },
  {
    id: 'police',
    name: 'Police Highway Patrol (POL-04)',
    shortName: 'Police',
    department: 'Karnataka State Police (Highway Division)',
    badgeId: 'KSP-HWY-04',
    primaryDesk: 'police',
    color: 'indigo',
    description: 'Highway interceptor, scene perimeter & investigation'
  },
  {
    id: 'traffic',
    name: 'Traffic Management Center',
    shortName: 'Traffic',
    department: 'Bangalore Traffic Police (TMC)',
    badgeId: 'TMC-CORRIDOR-99',
    primaryDesk: 'traffic',
    color: 'amber',
    description: 'Green corridor signal preemption & VMS boards'
  },
  {
    id: 'toll',
    name: 'Toll Plaza Authority',
    shortName: 'Toll Authority',
    department: 'NHAI Highway Toll Concessionaire',
    badgeId: 'NHAI-TOLL-17',
    primaryDesk: 'toll',
    color: 'cyan',
    description: 'FASTag lane auto-lift & barrier override'
  },
  {
    id: 'citizen',
    name: 'Citizen Reporter',
    shortName: 'Citizen',
    department: 'Public Emergency Access',
    badgeId: 'PUBLIC-CITIZEN',
    primaryDesk: 'citizen',
    color: 'rose',
    description: 'Verified bystander live photo incident reporting'
  },
  {
    id: 'dispatcher',
    name: 'Central CAD Supervisor',
    shortName: 'Central CAD',
    department: '108 Integrated Command & Control',
    badgeId: 'CAD-HQ-SUPERVISOR',
    primaryDesk: 'overview',
    color: 'purple',
    description: 'Multi-agency dispatch coordinator & inter-agency bridge'
  }
]

export function checkViewAuthorization(viewId, roleId) {
  // Operational Manual is open to all personnel and citizens
  if (viewId === 'manual') return { allowed: true }

  // Central dispatcher has supervisory clearance
  if (roleId === 'dispatcher') return { allowed: true }

  // Citizen can ONLY access the citizen portal and manual
  if (roleId === 'citizen') {
    if (viewId === 'citizen' || viewId === 'manual') return { allowed: true }
    return {
      allowed: false,
      reason: 'Citizen Public credentials cannot access restricted government and emergency services dispatch consoles.'
    }
  }

  // Common shared situational views (accessible by emergency responders for shared coordination)
  const sharedViews = ['overview', 'incidents', 'incident_detail', 'map', 'manual']
  if (sharedViews.includes(viewId)) {
    return { allowed: true }
  }

  // Check specific desk authorization
  const desk = DEPARTMENT_DESKS[viewId]
  if (!desk) return { allowed: true }

  const isAuthorized = desk.authorizedRoles.includes(roleId)
  if (isAuthorized) return { allowed: true }

  // Generate specific violation reason
  const userRoleObj = DEPARTMENT_ROLES.find(r => r.id === roleId)
  const userRoleName = userRoleObj ? userRoleObj.shortName : roleId

  return {
    allowed: false,
    reason: `${userRoleName} credentials cannot access ${desk.shortName}.`,
    details: desk.restrictionMessage,
    requiredDepartment: desk.ownerDepartment
  }
}

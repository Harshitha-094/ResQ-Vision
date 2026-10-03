// ResQVision - Operational Mock Data & Authorized Infrastructure Assets
// Grounded in Indian National Highway (NHAI) / Karnataka Emergency Response 108 & 112 grids

export const AUTHORIZED_CAMERAS = [
  {
    id: 'CAM-07',
    nodeName: 'NH 44 — Camera 07 (KM 42.4)',
    category: 'Highways',
    location: 'NH 44, Bengaluru–Hosur Expressway KM 42.4',
    coordinates: { lat: 12.8452, lng: 77.6601 },
    status: 'LIVE',
    hasAccident: true,
    activeIncidentId: 'RQ-1048',
    aiConfidence: 92,
    estimatedSeverity: 'Severe',
    feedImage: '/images/cctv_highway_crash.jpg',
    resolution: '1080p · 25 fps',
    network: 'Optical Fiber Backbone',
    lastSync: 'Just now'
  },
  {
    id: 'CAM-14',
    nodeName: 'Tumkur Road — Camera 14',
    category: 'Traffic junctions',
    location: 'Tumkur Road (NH 48) / Yeshwanthpur Junction',
    coordinates: { lat: 13.0382, lng: 77.5189 },
    status: 'LIVE',
    hasAccident: true,
    activeIncidentId: 'RQ-1047',
    aiConfidence: 89,
    estimatedSeverity: 'Moderate',
    feedImage: '/images/cctv_junction_crash.jpg',
    resolution: '1080p · 30 fps',
    network: 'Smart City Fiber Loop',
    lastSync: 'Just now'
  },
  {
    id: 'CAM-04',
    nodeName: 'Silk Board Junction — Camera 04',
    category: 'Traffic junctions',
    location: 'Outer Ring Road / Hosur Road Underpass',
    coordinates: { lat: 12.9177, lng: 77.6238 },
    status: 'LIVE',
    hasAccident: false,
    activeIncidentId: null,
    aiConfidence: null,
    estimatedSeverity: null,
    feedImage: '/images/cctv_junction_crash.jpg',
    resolution: '1080p · 30 fps',
    network: 'B-TRAC Traffic Grid',
    lastSync: 'Just now'
  },
  {
    id: 'CAM-02-PLAZA',
    nodeName: 'Toll Plaza 17 — Entry Cam 02',
    category: 'Toll plazas',
    location: 'Attibele / Electronic City Toll Plaza 17, Lane #1-4',
    coordinates: { lat: 12.8310, lng: 77.6820 },
    status: 'LIVE',
    hasAccident: false,
    activeIncidentId: null,
    aiConfidence: null,
    estimatedSeverity: null,
    feedImage: '/images/cctv_highway_crash.jpg',
    resolution: '4K · 25 fps',
    network: 'NHAI FASTag Dedicated Grid',
    lastSync: 'Just now'
  },
  {
    id: 'CAM-09-PETROL',
    nodeName: 'Indian Oil Highway Pump — Cam 01',
    category: 'Petrol pumps',
    location: 'IOCL Highway Service Station KM 38, NH 44',
    coordinates: { lat: 12.8590, lng: 77.6450 },
    status: 'LIVE',
    hasAccident: false,
    activeIncidentId: null,
    aiConfidence: null,
    estimatedSeverity: null,
    feedImage: '/images/cctv_highway_crash.jpg',
    resolution: '1080p · 20 fps',
    network: 'Retail Petroleum Safety Stream',
    lastSync: '1 min ago'
  }
]

export const NEARBY_HOSPITALS = [
  {
    id: 'HOSP-NARAYANA',
    name: 'Narayana Health City / Mazumdar Shaw Medical Center',
    shortName: 'Narayana Health City',
    address: '258/A, Bommasandra Industrial Area, Anekal Taluk, NH 44, Bengaluru, Karnataka 560099',
    distanceKm: 2.8,
    etaMinutes: 6,
    emergencyStatus: 'Emergency available',
    traumaLevel: 'Comprehensive Level 1 Trauma & Cardiac Emergency',
    traumaBaysAvailable: 4,
    icuBedsOpen: 8,
    bloodBankStatus: 'Comprehensive Blood Bank & Component Lab',
    contact: '+91 80 7122 2222',
    coordinates: { lat: 12.8252, lng: 77.6895 }
  },
  {
    id: 'HOSP-SPARSH',
    name: 'SPARSH Hospital, Hosur Road',
    shortName: 'SPARSH Hospital',
    address: 'Narayanahrudayalaya Health City Campus, Bommasandra, Hosur Road, Bengaluru 560099',
    distanceKm: 3.1,
    etaMinutes: 7,
    emergencyStatus: 'Emergency available',
    traumaLevel: 'Specialized Orthopedic & Polytrauma Care',
    traumaBaysAvailable: 3,
    icuBedsOpen: 5,
    bloodBankStatus: 'Emergency O-Negative Stocked',
    contact: '+91 80 6122 2000',
    coordinates: { lat: 12.8235, lng: 77.6890 }
  },
  {
    id: 'HOSP-STJOHNS',
    name: "St. John's Medical College Hospital",
    shortName: "St. John's Hospital",
    address: 'Sarjapur Main Road, John Nagar, Koramangala, Bengaluru, Karnataka 560034',
    distanceKm: 9.8,
    etaMinutes: 14,
    emergencyStatus: 'Emergency available',
    traumaLevel: 'Level 1 Trauma Care & Tertiary Referral',
    traumaBaysAvailable: 2,
    icuBedsOpen: 4,
    bloodBankStatus: 'O-Neg Units Stocked & Cryoprecipitate',
    contact: '+91 80 2206 5000',
    coordinates: { lat: 12.9288, lng: 77.6186 }
  },
  {
    id: 'HOSP-APOLLO',
    name: 'Apollo Hospitals, Bannerghatta Road',
    shortName: 'Apollo Hospitals',
    address: '154/11, Opp. IIMB, Bannerghatta Main Rd, Krishnaraju Layout, Bengaluru 560076',
    distanceKm: 8.5,
    etaMinutes: 13,
    emergencyStatus: 'Emergency available',
    traumaLevel: 'Tertiary Trauma & Critical Care Center',
    traumaBaysAvailable: 3,
    icuBedsOpen: 6,
    bloodBankStatus: '24/7 Apheresis & Whole Blood',
    contact: '+91 80 2630 4050',
    coordinates: { lat: 12.8942, lng: 77.5991 }
  },
  {
    id: 'HOSP-MANIPAL',
    name: 'Manipal Hospital, Sarjapur Road',
    shortName: 'Manipal Hospital',
    address: 'Survey No. 71/1, Sarjapur Main Rd, Carmelaram, Doddakannelli, Bengaluru 560035',
    distanceKm: 8.8,
    etaMinutes: 14,
    emergencyStatus: 'Emergency available',
    traumaLevel: 'Advanced Emergency Care & Trauma Unit',
    traumaBaysAvailable: 2,
    icuBedsOpen: 4,
    bloodBankStatus: 'Cross-Match Laboratory Active',
    contact: '+91 80 4012 4012',
    coordinates: { lat: 12.9168, lng: 77.6745 }
  },
  {
    id: 'HOSP-NIMHANS',
    name: 'NIMHANS Neurotrauma Emergency Center',
    shortName: 'NIMHANS Neurotrauma',
    address: 'Hosur Road, near Dairy Circle, Lakkasandra, Bengaluru, Karnataka 560029',
    distanceKm: 12.6,
    etaMinutes: 18,
    emergencyStatus: 'Emergency available',
    traumaLevel: 'National Institute for Severe Neuro & Spine Trauma',
    traumaBaysAvailable: 3,
    icuBedsOpen: 5,
    bloodBankStatus: 'Full Component Blood Bank',
    contact: '+91 80 2699 5000',
    coordinates: { lat: 12.9392, lng: 77.5936 }
  },
  {
    id: 'HOSP-VICTORIA',
    name: 'Victoria Hospital Trauma Care Centre (BMCRI)',
    shortName: 'Victoria Hospital',
    address: 'Fort Road, Near City Market, Kalasipalya, Bengaluru, Karnataka 560002',
    distanceKm: 15.4,
    etaMinutes: 22,
    emergencyStatus: 'Emergency available',
    traumaLevel: 'State Polytrauma & Burns Care Center',
    traumaBaysAvailable: 2,
    icuBedsOpen: 3,
    bloodBankStatus: 'Cross-Match Lab Active',
    contact: '+91 80 2670 1150',
    coordinates: { lat: 12.9645, lng: 77.5745 }
  },
  {
    id: 'HOSP-BOWRING',
    name: 'Bowring & Lady Curzon Hospital',
    shortName: 'Bowring Hospital',
    address: 'Lady Curzon Road, Tasker Town, Shivaji Nagar, Bengaluru, Karnataka 560001',
    distanceKm: 17.1,
    etaMinutes: 26,
    emergencyStatus: 'Emergency available',
    traumaLevel: 'Government General Emergency Care',
    traumaBaysAvailable: 1,
    icuBedsOpen: 3,
    bloodBankStatus: 'Standard Blood Bank',
    contact: '+91 80 2559 1362',
    coordinates: { lat: 12.9822, lng: 77.6045 }
  }
]

export function calculateGpsDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

export const FLEET_AMBULANCES = [
  {
    id: 'AMB-07',
    callSign: 'Ambulance 07',
    registration: 'KA 01 AB 1234',
    type: 'ALS (Advanced Life Support)',
    driver: 'Ramesh K.',
    paramedic: 'S. Nair',
    baseStation: 'Electronic City Emergency Post',
    contact: '+91 98450 12007',
    coordinates: { lat: 12.8520, lng: 77.6520 }
  },
  {
    id: 'AMB-04',
    callSign: 'Ambulance 04',
    registration: 'KA 04 E 2211',
    type: 'BLS (Basic Life Support)',
    driver: 'P. Mahesh',
    paramedic: 'A. Joseph',
    baseStation: 'Bommanahalli Fire Station Bay',
    contact: '+91 98450 12004',
    coordinates: { lat: 12.9020, lng: 77.6280 }
  },
  {
    id: 'AMB-12',
    callSign: 'Ambulance 12',
    registration: 'KA 04 G 4567',
    type: 'ALS (Advanced Life Support)',
    driver: 'Vinod Kumar',
    paramedic: 'Dr. T. Reddy',
    baseStation: 'Yeshwanthpur Traffic Post Bay',
    contact: '+91 98450 12012',
    coordinates: { lat: 13.0280, lng: 77.5380 }
  },
  {
    id: 'AMB-02',
    callSign: 'Ambulance 02',
    registration: 'KA 05 C 8899',
    type: 'BLS (Basic Life Support)',
    driver: 'Farooq Ahmed',
    paramedic: 'C. Gowda',
    baseStation: 'Silk Board Junction Emergency Bay',
    contact: '+91 98450 12002',
    coordinates: { lat: 12.9150, lng: 77.6200 }
  }
]

export const POLICE_UNITS = [
  {
    id: 'POL-04',
    unitName: 'Highway Interceptor 04',
    registration: 'KA 42 G 112',
    jurisdiction: 'NH 44 Hosur Road Expressway',
    officerInCharge: 'Sub-Inspector M. Kumar',
    crewCount: 3,
    contact: '+91 94808 01004',
    coordinates: { lat: 12.8390, lng: 77.6710 }
  },
  {
    id: 'POL-08',
    unitName: 'Traffic Patrol 08',
    registration: 'KA 04 G 9908',
    jurisdiction: 'Tumkur Road West Corridor',
    officerInCharge: 'Inspector K. Patel',
    crewCount: 2,
    contact: '+91 94808 01008',
    coordinates: { lat: 13.0310, lng: 77.5250 }
  },
  {
    id: 'POL-11',
    unitName: 'BTP Central Patrol 11',
    registration: 'KA 01 G 5511',
    jurisdiction: 'Outer Ring Road South',
    officerInCharge: 'SI V. Rao',
    crewCount: 2,
    contact: '+91 94808 01011',
    coordinates: { lat: 12.9210, lng: 77.6310 }
  }
]

export const TOLL_PLAZAS = [
  {
    id: 'TOLL-17',
    name: 'Toll Plaza 17 (Attibele / Electronic City)',
    highway: 'NH 44 (Bengaluru–Hosur Section)',
    manager: 'NHAI Plaza Officer D. Joshi',
    emergencyLane: 'Lane #1 (Dedicated Emergency & FASTag Override)',
    emergencyLaneStatus: 'Standby / Open on Demand',
    coordinates: { lat: 12.8310, lng: 77.6820 }
  },
  {
    id: 'TOLL-NELAMANGALA',
    name: 'Nelamangala Toll Plaza',
    highway: 'NH 48 (Tumkur Road Expressway)',
    manager: 'Plaza Supervisor R. Gowda',
    emergencyLane: 'Lane #1',
    emergencyLaneStatus: 'Normal Flow',
    coordinates: { lat: 13.0920, lng: 77.3910 }
  }
]

export const INITIAL_INCIDENTS = [
  {
    id: 'RQ-1048',
    severity: 'Severe',
    source: 'AI CAMERA DETECTION',
    cameraNode: 'CAM-07 NH-44',
    location: 'NH 44, Bengaluru–Hosur Highway KM 42.4',
    shortLocation: 'NH 44, Bengaluru',
    detectedTime: '14:32:18',
    status: 'Ambulance en route',
    remainingSeconds: 134, // 02:14
    targetSeconds: 180, // 03:00 target
    confidence: 92,
    image: '/images/cctv_highway_crash.jpg',
    vehicles: '2 Vehicles (Silver Sedan, Blue Hatchback)',
    casualties: 2,
    coordinates: { lat: 12.8452, lng: 77.6601 },
    timeline: [
      { time: '14:32:18', text: 'Accident detected by AI camera CAM-07', source: 'Camera' },
      { time: '14:32:20', text: 'Emergency alert sent to dispatch grid', source: 'System' },
      { time: '14:32:31', text: 'Ambulance 07 accepted dispatch', source: 'Ambulance' },
      { time: '14:32:32', text: 'Police Highway Interceptor 04 notified', source: 'Police' },
      { time: '14:33:04', text: 'Ambulance 07 en route to scene', source: 'Ambulance' }
    ],
    response: {
      ambulance: {
        id: 'KA 01 AB 1234',
        unit: 'Ambulance 07',
        status: 'En route',
        targetArrival: '02:14',
        distanceKm: '2.8 km'
      },
      police: {
        unit: 'Highway Interceptor 04',
        status: 'Dispatched',
        officer: 'Sub-Inspector M. Kumar'
      },
      hospital: {
        name: 'Not selected yet',
        status: 'Pending patient pickup',
        eta: '--'
      },
      traffic: {
        status: 'Advisory Active',
        impact: 'High',
        road: 'NH 44 (Lane 2 blocked)'
      },
      toll: {
        plaza: 'Toll Plaza 17',
        distance: '2.1 km',
        emergencyLane: 'Lane #1 Cleared'
      }
    }
  },
  {
    id: 'RQ-1047',
    severity: 'Moderate',
    source: 'AI CAMERA DETECTION',
    cameraNode: 'CAM-14 TUMKUR-RD',
    location: 'Tumkur Road Junction (NH 48)',
    shortLocation: 'Tumkur Road',
    detectedTime: '14:18:02',
    status: 'Hospital selected',
    remainingSeconds: 278, // 04:38
    targetSeconds: 360,
    confidence: 89,
    image: '/images/cctv_junction_crash.jpg',
    vehicles: '2 Vehicles (Silver Hatchback, White MPV)',
    casualties: 1,
    coordinates: { lat: 13.0382, lng: 77.5189 },
    timeline: [
      { time: '14:18:02', text: 'Accident detected by camera CAM-14', source: 'Camera' },
      { time: '14:18:05', text: 'Emergency alert sent', source: 'System' },
      { time: '14:18:22', text: 'Ambulance 12 accepted', source: 'Ambulance' },
      { time: '14:18:25', text: 'Traffic Patrol 08 dispatched', source: 'Police' },
      { time: '14:22:10', text: 'Ambulance arrived on scene', source: 'Ambulance' },
      { time: '14:26:40', text: 'Patient picked up · Victoria Hospital selected', source: 'Ambulance' }
    ],
    response: {
      ambulance: {
        id: 'KA 04 G 4567',
        unit: 'Ambulance 12',
        status: 'Transporting',
        targetArrival: '04:38',
        distanceKm: '3.6 km'
      },
      police: {
        unit: 'Traffic Patrol 08',
        status: 'Arrived',
        officer: 'Inspector K. Patel'
      },
      hospital: {
        name: 'Victoria Hospital Trauma Center',
        status: 'Ready for arrival',
        eta: '04:38'
      },
      traffic: {
        status: 'Diversion active',
        impact: 'Moderate',
        road: 'Tumkur Road Northbound'
      },
      toll: {
        plaza: 'Nelamangala Toll',
        distance: '6.4 km',
        emergencyLane: 'Normal'
      }
    }
  },
  {
    id: 'RQ-1046',
    severity: 'Mild',
    source: 'TRAFFIC JUNCTION SENSOR',
    cameraNode: 'CAM-04 SILK-BOARD',
    location: 'Outer Ring Road, Silk Board Junction',
    shortLocation: 'Outer Ring Road',
    detectedTime: '14:11:45',
    status: 'Police notified',
    remainingSeconds: 680, // 11:20
    targetSeconds: 900,
    confidence: 84,
    image: '/images/cctv_junction_crash.jpg',
    vehicles: '2 Vehicles (Two-wheeler sideswipe)',
    casualties: 1,
    coordinates: { lat: 12.9177, lng: 77.6238 },
    timeline: [
      { time: '14:11:45', text: 'Low-speed sideswipe detected', source: 'Sensor' },
      { time: '14:12:00', text: 'Police notification generated', source: 'System' },
      { time: '14:12:30', text: 'BTP Patrol 11 acknowledged alert', source: 'Police' }
    ],
    response: {
      ambulance: {
        id: 'KA 05 C 8899',
        unit: 'Ambulance 02',
        status: 'Standby / Evaluating',
        targetArrival: '11:20',
        distanceKm: '1.2 km'
      },
      police: {
        unit: 'BTP Patrol 11',
        status: 'En route',
        officer: 'SI V. Rao'
      },
      hospital: {
        name: 'Not selected yet',
        status: 'Standby',
        eta: '--'
      },
      traffic: {
        status: 'Monitoring',
        impact: 'Low',
        road: 'Outer Ring Road'
      },
      toll: {
        plaza: 'None',
        distance: '--',
        emergencyLane: 'N/A'
      }
    }
  },
  {
    id: 'RQ-1052',
    severity: 'Pending Review',
    source: 'CITIZEN PHOTO REPORT',
    cameraNode: 'Live Mobile Camera App',
    location: 'Electronic City Phase 1 Road (Awaiting Live Citizen Camera Snap)',
    shortLocation: 'Electronic City',
    detectedTime: 'Pending Capture',
    status: 'Waiting for live camera photo capture',
    remainingSeconds: 900,
    targetSeconds: 900,
    confidence: null,
    image: null, // Strictly NULL until citizen snaps live photo - NO demo photo override!
    vehicles: 'Reported Collision (Awaiting live verification)',
    casualties: 1,
    coordinates: { lat: 12.8452, lng: 77.6601 },
    timeline: [
      { time: '14:35:10', text: 'Citizen opened live camera reporting viewfinder', source: 'Citizen' },
      { time: '14:35:12', text: 'Device GPS calibrated (±3.4m accuracy lock)', source: 'System' },
      { time: '14:35:15', text: 'Awaiting original camera snapshot from bystander', source: 'System' }
    ],
    citizenReport: {
      photoReceived: false,
      locationReceived: true,
      confirmed: false,
      capturedTime: null,
      reportedBy: 'Citizen Bystander (Live Device Camera)'
    },
    response: {
      ambulance: {
        unit: 'Unassigned',
        status: 'Pending confirmation',
        targetArrival: '--',
        distanceKm: '--'
      },
      police: {
        unit: 'Queued',
        status: 'Pending review',
        officer: '--'
      },
      hospital: {
        name: 'Unassigned',
        status: 'Standby',
        eta: '--'
      },
      traffic: {
        status: 'Standby',
        impact: 'Low',
        road: 'Electronic City Phase 1 Road'
      },
      toll: {
        plaza: 'Plaza 17',
        distance: '1.4 km',
        emergencyLane: 'Standby'
      }
    }
  }
]

export const RESOLVED_INCIDENT_REPORTS = [
  {
    id: 'RQ-1045',
    date: 'Today, 13:10:04 IST',
    location: 'NH 44, Electronic City Elevated Highway Ramp',
    severity: 'Severe',
    source: 'AI CAMERA DETECTION',
    assignedAmbulance: 'Ambulance 07 (KA 01 AB 1234)',
    hospitalDestination: "St. John's Hospital",
    policeUnit: 'Highway Interceptor 04',
    timeToDispatch: '32s',
    timeToArrival: '3m 18s',
    totalHandoverTime: '15m 44s',
    status: 'Completed',
    outcome: 'Patient successfully handed over to Trauma Bay 1. Vital signs stabilized.'
  },
  {
    id: 'RQ-1042',
    date: 'Today, 11:42:19 IST',
    location: 'Tumkur Road KM 18 Flyover',
    severity: 'Moderate',
    source: 'CITIZEN PHOTO REPORT',
    assignedAmbulance: 'Ambulance 12 (KA 04 G 4567)',
    hospitalDestination: 'Victoria Hospital Trauma Center',
    policeUnit: 'Traffic Patrol 08',
    timeToDispatch: '45s',
    timeToArrival: '5m 02s',
    totalHandoverTime: '18m 10s',
    status: 'Completed',
    outcome: 'Minor orthopedic fracture stabilized. Highway lane reopened within 22 minutes.'
  },
  {
    id: 'RQ-1039',
    date: 'Yesterday, 19:24:50 IST',
    location: 'Silk Board Underpass Lane #2',
    severity: 'Mild',
    source: 'AI CAMERA DETECTION',
    assignedAmbulance: 'Ambulance 02 (KA 05 C 8899)',
    hospitalDestination: 'NIMHANS Bay',
    policeUnit: 'BTP Patrol 11',
    timeToDispatch: '58s',
    timeToArrival: '4m 30s',
    totalHandoverTime: '12m 15s',
    status: 'Completed',
    outcome: 'Vehicle safely moved to shoulder. First aid administered on scene.'
  }
]

export const SIMULATION_STAGES = [
  {
    stage: 1,
    title: 'Accident detected',
    description: 'AI camera CAM-07 detects high-speed collision on NH 44 (Confidence 92%). Incident RQ-1048 created.'
  },
  {
    stage: 2,
    title: 'Ambulance alert',
    description: 'Emergency alert dispatched to nearest available unit (Ambulance 07, 2.8 km away). Target arrival: 03:00.'
  },
  {
    stage: 3,
    title: 'Ambulance accepts',
    description: 'Ambulance 07 acknowledges and accepts incident RQ-1048 dispatch.'
  },
  {
    stage: 4,
    title: 'Other ambulances blocked',
    description: 'Dispatch grid locks assignment. Ambulance 04 and other units display "Incident already assigned · No action required".'
  },
  {
    stage: 5,
    title: 'Police alert & dispatch',
    description: 'Mandatory police alert transmitted to Highway Interceptor 04. Police unit acknowledges and dispatches immediately.'
  },
  {
    stage: 6,
    title: 'Ambulance en route',
    description: 'Ambulance 07 starts GPS navigation toward NH 44 KM 42.4. Response timer actively counts down.'
  },
  {
    stage: 7,
    title: 'Ambulance arrives',
    description: 'Ambulance 07 reaches accident scene at NH 44 KM 42.4. Crew begins casualty stabilization.'
  },
  {
    stage: 8,
    title: 'Patient picked up',
    description: 'Paramedics complete preliminary triage and secure casualties inside ambulance.'
  },
  {
    stage: 9,
    title: 'Hospital selected',
    description: "Ambulance crew selects St. John's Medical College Hospital (Level-1 Trauma Care, 3.2 km away) based on bay availability."
  },
  {
    stage: 10,
    title: 'Hospital alerted',
    description: "St. John's Emergency Desk receives incoming alert with live ETA (6 min) and accident image."
  },
  {
    stage: 11,
    title: 'Hospital ready',
    description: "Emergency desk marks 'READY FOR ARRIVAL'. Trauma Bay 1 is reserved and surgical team is placed on standby."
  },
  {
    stage: 12,
    title: 'Incident completed',
    description: 'Ambulance delivers patient to hospital trauma bay. Handover confirmed. Incident closed and archived to response audit.'
  }
]

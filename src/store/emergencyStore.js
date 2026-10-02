import { create } from 'zustand'
import { ZONES, SCENARIOS } from '../data/mockScenarios'
import { playAlertBeep, playCountdownTick, playAcceptChime, playRadioSquelch } from '../utils/audio'

const INITIAL_CHECKLIST = [
  { id: 'spinal', label: 'Prep Spinal Board & Head Immobilizer Straps', checked: false, critical: true },
  { id: 'extrication', label: 'Vehicle Extrication Tools (Hydraulic Cutter & Spreader)', checked: false, critical: true },
  { id: 'burn', label: 'Burn Dressings Required & Sterile Trauma Gel Packs', checked: false, critical: true },
  { id: 'cervical', label: 'Cervical Collar & Kendrick Extrication Device (KED)', checked: false, critical: true },
  { id: 'o2', label: 'Portable High-Flow Oxygen & Bag-Valve-Mask Resuscitator', checked: false, critical: true },
  { id: 'hemostatic', label: 'Combat Application Tourniquet (CAT) & Hemostatic Gauze', checked: false, critical: true },
]

const INITIAL_HOSPITAL_STATUS = {
  bayReserved: false,
  bloodCrossMatched: false,
  surgicalTeamNotified: false,
}

function getFormattedTime() {
  const now = new Date()
  return now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0')
}

export const useEmergencyStore = create((set, get) => ({
  // Core State
  activeIncident: null,
  selectedZone: 'highway',
  ambulanceStatus: 'idle', // 'idle' | 'alerted' | 'accepted' | 'en_route' | 'arrived' | 'escalated'
  countdown: 15,
  ambulanceEtaSeconds: 240, // 4 mins
  distanceKm: 4.2,
  hospitalStatus: { ...INITIAL_HOSPITAL_STATUS },
  greenCorridorActive: false,
  corridorProgress: 18, // percentage 0 to 100
  paramedicChecklist: [...INITIAL_CHECKLIST],
  simulatedLogs: [
    {
      id: 'init-1',
      timestamp: '00:00:01.000',
      channel: 'MQTT',
      title: 'Edge AI Telemetry Mesh Initialized',
      message: '[SIMULATED MQTT PACKET]: { csi: 1.0, delta_v: "0 km/h", acoustic_spike: false, zone: "nh275_km42", status: "ALL SENSOR POLES OPERATIONAL" }',
      rawPayload: { status: 'ONLINE', nodes: 3, latency_ms: 12, sync: 'NTP_IST' },
      level: 'info',
    },
    {
      id: 'init-2',
      timestamp: '00:00:02.150',
      channel: 'C-V2X',
      title: 'ITMS Signal Preemption Service Connected',
      message: '[SIMULATED NTCIP 1211]: Signal ID #14 preemption standby on 5.9 GHz DSRC band.',
      rawPayload: { cv2x_mesh: 'READY', radius_m: 250, auto_override: true },
      level: 'info',
    },
  ],
  activeTab: 'command', // 'command' | 'ambulance' | 'hospital' | 'corridor' | 'camera'
  soundEnabled: true,
  outboundDrawerOpen: false,
  userGps: {
    lat: 12.9716,
    lng: 77.5946,
    accuracy: 4.2,
    address: 'Bengaluru Smart City Urban Corridor',
    isLive: false,
  },
  setUserGps: (gps) => set((state) => ({ userGps: { ...state.userGps, ...gps } })),

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  setZone: (zoneKey) => set({ selectedZone: zoneKey }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  setOutboundDrawerOpen: (open) => set({ outboundDrawerOpen: open }),

  toggleChecklist: (id) =>
    set((state) => ({
      paramedicChecklist: state.paramedicChecklist.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    })),

  toggleHospitalResource: (key) => {
    const current = get().hospitalStatus[key]
    const nextVal = !current
    const keyLabels = {
      bayReserved: 'Trauma Bay 1 Reserved',
      bloodCrossMatched: 'O-Negative Blood Units Cross-Matched',
      surgicalTeamNotified: 'Surgical Team Notified',
    }

    set((state) => ({
      hospitalStatus: { ...state.hospitalStatus, [key]: nextVal },
    }))

    const logEntry = {
      id: `hosp-${Date.now()}`,
      timestamp: getFormattedTime(),
      channel: 'FHIR/HL7',
      title: `Trauma Bay Readiness: ${keyLabels[key] || key}`,
      message: `[SIMULATED FHIR/HL7]: ${keyLabels[key] || key} status set to ${nextVal ? 'CONFIRMED' : 'UNCHECKED'}.`,
      rawPayload: { resource: key, status: nextVal ? 'RESERVED' : 'AVAILABLE', updated_by: 'ER_TRIAGE_DESK' },
      level: nextVal ? 'success' : 'warning',
    }
    get().addLog(logEntry)
  },

  toggleGreenCorridor: (forcedVal) =>
    set((state) => {
      const nextVal = typeof forcedVal === 'boolean' ? forcedVal : !state.greenCorridorActive
      const log = {
        id: `cv2x-${Date.now()}`,
        timestamp: getFormattedTime(),
        channel: 'NTCIP 1211',
        title: `Green Wave Corridor ${nextVal ? 'OVERRIDE ACTIVE' : 'RETURNED TO NORMAL CYCLING'}`,
        message: nextVal
          ? '[SIMULATED NTCIP 1211]: Signal ID #14 preemption granted (Green Wave Active).'
          : '[SIMULATED NTCIP 1211]: Signal ID #14 preemption released (Normal Cycling Restored).',
        rawPayload: { green_corridor: nextVal, override_mode: 'PRIORITY_0_PREEMPTION' },
        level: nextVal ? 'critical' : 'info',
      }
      get().addLog(log)
      return { greenCorridorActive: nextVal }
    }),

  addLog: (log) =>
    set((state) => ({
      simulatedLogs: [log, ...state.simulatedLogs].slice(0, 50),
    })),

  clearLogs: () => set({ simulatedLogs: [] }),

  triggerIncident: (scenarioKey) => {
    const scenario = SCENARIOS[scenarioKey]
    const zone = ZONES[scenarioKey]
    if (!scenario || !zone) return

    const nowTime = getFormattedTime()
    const incidentObj = {
      ...scenario,
      zoneDetails: zone,
      incidentId: `RESQ-IN-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: nowTime,
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'ACTIVE_P0',
    }

    if (get().soundEnabled) {
      playAlertBeep()
    }

    // Set store state
    set({
      activeIncident: incidentObj,
      selectedZone: scenarioKey,
      ambulanceStatus: 'alerted',
      countdown: 15,
      ambulanceEtaSeconds: scenarioKey === 'urban' ? 180 : scenarioKey === 'highway' ? 240 : 360,
      distanceKm: scenarioKey === 'urban' ? 2.4 : scenarioKey === 'highway' ? 4.2 : 6.8,
      hospitalStatus: { ...INITIAL_HOSPITAL_STATUS },
      greenCorridorActive: true,
      corridorProgress: 15,
      paramedicChecklist: [...INITIAL_CHECKLIST],
    })

    // Exact specified simulated outbound telemetry & gateway logs
    const newLogs = [
      {
        id: `log-sms-${Date.now()}`,
        timestamp: nowTime,
        channel: 'SMS (108 DISPATCH)',
        title: `CRITICAL P0 DISPATCH: ${zone.ambulanceBase.split(' ')[0]}`,
        message: `[SIMULATED SMS to 108 GVK-EMRI Dispatcher]: Incident at ${zone.name} (${zone.curveMarker}). Ambulance ${zone.ambulanceBase.split(' ')[0]} dispatched.`,
        rawPayload: {
          to: '+91-108-EMRI-DISPATCH',
          priority: 'P0_URGENT',
          location: zone.name,
          eta_window: '4 mins',
          ticket: incidentObj.incidentId,
        },
        level: 'critical',
      },
      {
        id: `log-erss-${Date.now() + 1}`,
        timestamp: nowTime,
        channel: 'ERSS 112 (POLICE)',
        title: `Highway Patrol Interceptor Deployed`,
        message: `[SIMULATED ERSS 112 Police Alert]: Highway patrol interceptor dispatched for traffic diversion.`,
        rawPayload: {
          erss_call_id: `ERSS-KA-2026-${Math.floor(Math.random() * 9000)}`,
          police_cad_unit: zone.policeUnit,
          upstream_diversion_km: 1.5,
        },
        level: 'warning',
      },
      {
        id: `log-mqtt-${Date.now() + 2}`,
        timestamp: nowTime,
        channel: 'MQTT',
        title: `Multi-Modal Edge Sensor Fusion: ${zone.sensorNode}`,
        message: `[SIMULATED MQTT PACKET]: { csi: ${scenario.csi}, delta_v: "${scenario.telemetry.deltaV} km/h", acoustic_spike: true, zone: "${zone.id === 'ghat' ? 'ghat_hairpin_8' : zone.id === 'highway' ? 'nh275_km42' : 'silk_board_junction'}" }`,
        rawPayload: {
          node_id: zone.sensorNode,
          csi: scenario.csi,
          delta_v: `${scenario.telemetry.deltaV} km/h`,
          acoustic_spike: true,
          zone: zone.id === 'ghat' ? 'ghat_hairpin_8' : zone.id === 'highway' ? 'nh275_km42' : 'silk_board_junction',
          road_surface: zone.roadSurface,
          weather: zone.weatherCondition,
        },
        level: 'critical',
      },
      {
        id: `log-cv2x-${Date.now() + 3}`,
        timestamp: nowTime,
        channel: 'NTCIP 1211',
        title: `Signal Preemption Granted (Green Wave Active)`,
        message: `[SIMULATED NTCIP 1211]: Signal ID #14 preemption granted (Green Wave Active).`,
        rawPayload: {
          corridor_id: `GC-${scenarioKey.toUpperCase()}`,
          active_signals: scenario.signals.map((s) => s.id),
          preemption_lead_m: 250,
          vehicle_vin: 'KA-01-EA-108-EMRI',
        },
        level: 'info',
      },
      {
        id: `log-fhir-${Date.now() + 4}`,
        timestamp: nowTime,
        channel: 'FHIR/HL7',
        title: `Trauma Bay Admission Notification: ${zone.nearestHospital}`,
        message: `[SIMULATED FHIR/HL7]: Incoming trauma ticket generated for ${zone.nearestHospital}. Recommended: Bay 1 Reserved, O-Negative Blood Units Cross-Matched.`,
        rawPayload: {
          destination_facility: zone.nearestHospital,
          clinical_triage_category: 'RED_IMMEDIATE',
          iss_score_predicted: scenario.issEstimate,
          extrication_eta: '6-8 mins',
        },
        level: 'info',
      },
    ]

    set((state) => ({
      simulatedLogs: [...newLogs, ...state.simulatedLogs].slice(0, 50),
    }))
  },

  triggerMobileIncident: ({
    snapshotUrl,
    coords,
    hospital,
    ambulance,
    address,
    csi = 4.7,
    deltaV = 76,
    gForce = '17.8 G',
    opticalConf = '99.6%',
  } = {}) => {
    const nowTime = getFormattedTime()
    const customGps = coords || get().userGps
    const hospitalName = hospital || 'Victoria Hospital Emergency Trauma Center'
    const ambulanceName = ambulance || 'KA-01-EA-108 (ALS Unit - Central Hub)'
    const locationName = address || `Mobile Camera Field Point (${customGps.lat.toFixed(4)}°N, ${customGps.lng.toFixed(4)}°E)`

    const incidentObj = {
      isMobileCam: true,
      snapshotUrl: snapshotUrl || null,
      title: 'Live Mobile Camera YOLO Crash Detection (Verified P0)',
      code: 'P0-MOBI-CAM-LIVE',
      severity: 'CRITICAL P0',
      csi: csi,
      issEstimate: 32,
      goldenHourMinutes: 40,
      vehicles: 'Live Mobile Visual Target (Crushed Vehicle Structure)',
      casualtiesCount: 2,
      casualtyBreakdown: {
        criticalP0: 1,
        seriousP1: 1,
        minorP2: 0,
      },
      trappedVictims: 1,
      extricationRequired: true,
      incidentId: `RESQ-MOB-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: nowTime,
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'ACTIVE_P0',
      zoneDetails: {
        id: 'mobile',
        name: locationName,
        subTitle: `Live GPS: ${customGps.lat.toFixed(4)}° N, ${customGps.lng.toFixed(4)}° E (±${Math.round(customGps.accuracy || 4)}m)`,
        district: 'Citizen/Field Smartphone Optical Feed',
        type: 'Live Mobile Camera Stream',
        speedLimit: '50 km/h',
        cameraNode: 'PHONE-CAM-LIVE-STREAM',
        sensorNode: 'MOBILE-EDGE-YOLOv10',
        coordinates: { lat: customGps.lat, lng: customGps.lng },
        nearestHospital: hospitalName,
        secondaryHospital: 'NIMHANS Neurotrauma Emergency Bay',
        ambulanceBase: ambulanceName,
        policeUnit: 'City Traffic Patrol Interceptor 03',
        networkStatus: '5G Mobile Uplink + GPS RTK',
        loraStatus: 'Direct Geolocation Hook Active',
        ambientDb: 72,
      },
      telemetry: {
        preImpactSpeed: '68 km/h',
        postImpactSpeed: '0 km/h in 110ms',
        deltaV: deltaV,
        gForce: gForce,
        acousticPeakDb: 128.4,
        acousticDurationMs: 340,
        opticalConfidence: `${opticalConf} (Live Mobile YOLOv10)`,
        impactAngle: 'Frontal Kinetic Deformation',
        hazmatRisk: 'Fuel Vapor Monitoring Armed',
        fireRisk: 'Low (Thermal Nominal)',
      },
      clinicalAssessment: {
        mechanism: 'Severe kinetic deceleration identified via mobile camera feed & optical flow.',
        headTraumaRisk: 'High (Immediate CT Protocol)',
        cervicalSpineRisk: 'Severe (C-Spine immobilization required)',
        chestAbdomenRisk: 'Blunt force trauma profile detected',
        recommendedBed: 'Trauma Resuscitation Bay 1 (Red Zone)',
        bloodCrossMatch: '4 Units O-Negative PRBC',
        ctScanType: 'Whole-Body Pan-Scan CT',
      },
      signals: [
        { id: 'SIG-MOB-01', name: 'Nearest Intersection Signal', distance: '400 m', state: 'GREEN_PREEMPTED', timer: '0:35' },
        { id: 'SIG-MOB-02', name: 'Corridor Transit Signal', distance: '1.2 km', state: 'ARMED_PREEMPTION', timer: '1:10' },
        { id: 'SIG-MOB-03', name: 'Hospital Approach Signal', distance: '2.5 km', state: 'HOLD_CYCLE', timer: '2:15' },
      ],
    }

    if (get().soundEnabled) {
      playAlertBeep()
    }

    set({
      activeIncident: incidentObj,
      selectedZone: 'urban', // default map anchor to urban or closest
      ambulanceStatus: 'alerted',
      countdown: 15,
      ambulanceEtaSeconds: 210,
      distanceKm: 2.8,
      hospitalStatus: { ...INITIAL_HOSPITAL_STATUS },
      greenCorridorActive: true,
      corridorProgress: 12,
      paramedicChecklist: [...INITIAL_CHECKLIST],
    })

    // Simulated emergency communications logs
    const newLogs = [
      {
        id: `log-mob-sms-${Date.now()}`,
        timestamp: nowTime,
        channel: 'SMS (108 DISPATCH)',
        title: `LIVE MOBILE CAM P0 DISPATCH: ${ambulanceName}`,
        message: `[SIMULATED SMS to 108 Dispatcher]: P0 CRASH CONFIRMED via live phone camera feed at GPS ${customGps.lat.toFixed(5)}, ${customGps.lng.toFixed(5)} (${locationName}). Auto-dispatched ambulance ${ambulanceName}. Nearest trauma bay: ${hospitalName}.`,
        rawPayload: {
          source: 'MOBILE_PHONE_CAMERA_YOLO',
          to: '+91-108-EMRI-DISPATCH',
          gps: { lat: customGps.lat, lng: customGps.lng, acc_m: customGps.accuracy },
          nearest_hospital: hospitalName,
          assigned_unit: ambulanceName,
          priority: 'P0_IMMEDIATE_ROLLOUT',
          ticket: incidentObj.incidentId,
        },
        level: 'critical',
      },
      {
        id: `log-mob-erss-${Date.now() + 1}`,
        timestamp: nowTime,
        channel: 'ERSS 112 (POLICE)',
        title: `Police CAD Alert: Mobile Incident Dispatched`,
        message: `[SIMULATED ERSS 112]: Live citizen/field phone camera crash report verified. Location coordinates broadcast to mobile patrol units.`,
        rawPayload: {
          call_type: 'MOBILE_EDGE_AI_CRASH',
          police_cad_channel: '112_TRAFFIC_DIV',
          coordinates: `${customGps.lat}, ${customGps.lng}`,
        },
        level: 'warning',
      },
      {
        id: `log-mob-fhir-${Date.now() + 2}`,
        timestamp: nowTime,
        channel: 'FHIR/HL7',
        title: `Hospital Trauma Bay Intake Alert: ${hospitalName}`,
        message: `[FHIR HL7 v2.5.1]: Electronic Trauma Admission Ticket opened for incoming casualty from Mobile Camera alert. Resuscitation Bay 1 armed.`,
        rawPayload: {
          destination_hospital: hospitalName,
          triage_class: 'RED_P0',
          predicted_iss: 32,
        },
        level: 'info',
      },
      {
        id: `log-mob-cv2x-${Date.now() + 3}`,
        timestamp: nowTime,
        channel: 'C-V2X',
        title: `Dynamic Green Wave Corridor Initialized for ${ambulanceName}`,
        message: `[C-V2X Signal Preemption]: Route from base to GPS (${customGps.lat.toFixed(4)}, ${customGps.lng.toFixed(4)}) locked to Green Wave cycle.`,
        rawPayload: { corridor: 'MOBILE_ORIGIN_ROUTE', preemption_active: true },
        level: 'info',
      },
    ]

    set((state) => ({
      simulatedLogs: [...newLogs, ...state.simulatedLogs].slice(0, 50),
    }))
  },

  decrementCountdown: () => {
    const { countdown, ambulanceStatus, soundEnabled } = get()
    if (ambulanceStatus !== 'alerted') return

    if (countdown > 1) {
      const next = countdown - 1
      if (soundEnabled) {
        playCountdownTick(next <= 5)
      }
      set({ countdown: next })
    } else if (countdown === 1) {
      // Driver timeout auto-escalation!
      set({
        countdown: 0,
        ambulanceStatus: 'escalated',
      })
      const timeoutLog = {
        id: `timeout-${Date.now()}`,
        timestamp: getFormattedTime(),
        channel: 'SMS (108 DISPATCH)',
        title: 'TICKET ESCALATED TO SECONDARY UNIT',
        message: `[SIMULATED SMS to 108 GVK-EMRI Dispatcher]: Driver acknowledgement timeout (15s). TICKET ESCALATED TO SECONDARY UNIT KA-02-ALS-99. Primary unit flagged unacknowledged.`,
        rawPayload: { event: 'DRIVER_TIMEOUT_AUTO_ESCALATION', ticket_escalated: true, backup_dispatched: 'KA-02-ALS-99' },
        level: 'warning',
      }
      get().addLog(timeoutLog)
    }
  },

  acceptDispatch: () => {
    const { soundEnabled, activeIncident } = get()
    if (soundEnabled) {
      playAcceptChime()
      setTimeout(() => playRadioSquelch(), 450)
    }

    set({
      ambulanceStatus: 'en_route',
      countdown: 0,
    })

    const acceptLog = {
      id: `accept-${Date.now()}`,
      timestamp: getFormattedTime(),
      channel: 'SMS (108 DISPATCH)',
      title: 'DISPATCH ACCEPTED BY PARAMEDIC CREW (KA-01-EA-108)',
      message: `Unit KA-01-EA-108 status updated to EN ROUTE. Siren and C-V2X transponder engaged. Estimated arrival in 4 minutes.`,
      rawPayload: {
        unit: 'KA-01-EA-108',
        crew: ['Paramedic R. Kumar (NREMT-P)', 'Pilot S. Hegde'],
        status: 'EN_ROUTE',
        ticket: activeIncident?.incidentId || 'P0-ACTIVE',
      },
      level: 'success',
    }
    get().addLog(acceptLog)
  },

  updateAmbulanceStatus: (status) => {
    set({ ambulanceStatus: status })
    const statusLogs = {
      arrived: {
        title: 'AMBULANCE ARRIVED ON SCENE',
        message: 'Unit KA-01-EA-108 has reached the crash locus. Commencing extrication and rapid trauma triage.',
        level: 'success',
      },
      en_route: {
        title: 'AMBULANCE EN ROUTE WITH P0 AUDIBLE/OPTICAL WARNINGS',
        message: 'Ambulance is navigating along pre-cleared Green Corridor at 84 km/h.',
        level: 'info',
      },
      idle: {
        title: 'AMBULANCE RETURNED TO BASE / STANDBY',
        message: 'Unit KA-01-EA-108 back in ready status at station bay.',
        level: 'info',
      },
    }

    if (statusLogs[status]) {
      get().addLog({
        id: `stat-${Date.now()}`,
        timestamp: getFormattedTime(),
        channel: 'SMS (108 DISPATCH)',
        title: statusLogs[status].title,
        message: statusLogs[status].message,
        rawPayload: { ambulance_status: status },
        level: statusLogs[status].level,
      })
    }
  },

  advanceSimulationProgress: () => {
    const { ambulanceStatus, ambulanceEtaSeconds, distanceKm, corridorProgress } = get()
    if (ambulanceStatus === 'en_route') {
      if (ambulanceEtaSeconds > 10) {
        set({
          ambulanceEtaSeconds: Math.max(10, ambulanceEtaSeconds - 5),
          distanceKm: Math.max(0.2, (distanceKm - 0.1).toFixed(1)),
          corridorProgress: Math.min(95, corridorProgress + 2),
        })
      } else {
        set({
          ambulanceStatus: 'arrived',
          ambulanceEtaSeconds: 0,
          distanceKm: 0,
          corridorProgress: 100,
        })
        get().updateAmbulanceStatus('arrived')
      }
    }
  },

  resetSystem: () => {
    set({
      activeIncident: null,
      ambulanceStatus: 'idle',
      countdown: 15,
      ambulanceEtaSeconds: 240,
      distanceKm: 4.2,
      hospitalStatus: { ...INITIAL_HOSPITAL_STATUS },
      greenCorridorActive: false,
      corridorProgress: 0,
      paramedicChecklist: [...INITIAL_CHECKLIST],
    })

    get().addLog({
      id: `reset-${Date.now()}`,
      timestamp: getFormattedTime(),
      channel: 'MQTT',
      title: 'SYSTEM RE-ARMED TO IDLE PATROL STATE',
      message: 'All mock incidents cleared. Edge AI nodes listening on optical, acoustic, and radar channels.',
      rawPayload: { status: 'STANDBY', monitoring_zones: 3 },
      level: 'info',
    })
  },
}))

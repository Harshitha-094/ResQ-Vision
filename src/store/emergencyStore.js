import { create } from 'zustand'
import { ZONES, SCENARIOS } from '../data/mockScenarios'
import { playAlertBeep, playCountdownTick, playAcceptChime, playRadioSquelch } from '../utils/audio'

const INITIAL_CHECKLIST = [
  { id: 'cervical', label: 'Cervical Collar & Kendrick Extrication Device (KED)', checked: false, critical: true },
  { id: 'hydraulic', label: 'Hydraulic Extrication Cutter & Spreader (Trapped Victim Protocol)', checked: false, critical: true },
  { id: 'o2', label: 'Portable High-Flow Oxygen & Bag-Valve-Mask Resuscitator', checked: false, critical: true },
  { id: 'lucas', label: 'LUCAS-3 Automated Chest Compression Device', checked: false, critical: false },
  { id: 'airway', label: 'Video Laryngoscope & Endotracheal Intubation Kit', checked: false, critical: false },
  { id: 'hemostatic', label: 'Combat Application Tourniquet (CAT) & Hemostatic Gauze', checked: false, critical: true },
]

const INITIAL_HOSPITAL_STATUS = {
  bedReserved: false,
  bloodCrossMatched: false,
  ctScanReady: false,
  traumaTeamMobilized: false,
  otStandby: false,
  ventilatorPrimed: false,
}

function getFormattedTime() {
  const now = new Date()
  return now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0')
}

export const useEmergencyStore = create((set, get) => ({
  // Core State
  activeIncident: null,
  selectedZone: 'highway',
  ambulanceStatus: 'idle', // 'idle' | 'alerted' | 'accepted' | 'en_route' | 'arrived'
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
      message: 'Monitoring 3 critical accident zones in Karnataka (NH-275 KM 42, Silk Board B-TRAC, Charmadi Hairpin #8).',
      rawPayload: { status: 'ONLINE', nodes: 3, latency_ms: 12, sync: 'NTP_IST' },
      level: 'info',
    },
    {
      id: 'init-2',
      timestamp: '00:00:02.150',
      channel: 'C-V2X',
      title: 'ITMS Signal Preemption Service Connected',
      message: 'Bengaluru Traffic Police B-TRAC & NHAI corridor preemption radio standby on 5.9 GHz DSRC band.',
      rawPayload: { cv2x_mesh: 'READY', radius_m: 250, auto_override: true },
      level: 'info',
    },
  ],
  activeTab: 'command', // 'command' | 'ambulance' | 'hospital' | 'corridor'
  soundEnabled: true,
  outboundDrawerOpen: false,

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
      bedReserved: 'Trauma Resuscitation Bay 1 (Red Zone)',
      bloodCrossMatched: 'O-Negative Blood Units (4 Units PRBC)',
      ctScanReady: 'Emergency Whole-Body CT Scanner',
      traumaTeamMobilized: 'Trauma Surgery & Neurotrauma On-Call Team',
      otStandby: 'Emergency Surgical OT 2',
      ventilatorPrimed: 'Mechanical Ventilator #4',
    }

    set((state) => ({
      hospitalStatus: { ...state.hospitalStatus, [key]: nextVal },
    }))

    const logEntry = {
      id: `hosp-${Date.now()}`,
      timestamp: getFormattedTime(),
      channel: 'FHIR/HL7',
      title: `Trauma Bay Resource ${nextVal ? 'SECURED' : 'RELEASED'}: ${keyLabels[key] || key}`,
      message: `HL7 ADT/ORM update broadcasted to Ramanagara District Hospital / NIMHANS Clinical EHR.`,
      rawPayload: { resource: key, status: nextVal ? 'RESERVED' : 'AVAILABLE', updated_by: 'TRAUMA_CHIEF_MD' },
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
        channel: 'C-V2X',
        title: `Green Wave Corridor ${nextVal ? 'OVERRIDE ACTIVE' : 'RETURNED TO NORMAL CYCLING'}`,
        message: nextVal
          ? 'Emergency signal preemption lock engaged 250m ahead of Ambulance KA-01-EA-108.'
          : 'Signal timing reverted to standard fixed-time / actuated urban cycle.',
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

    // Generate comprehensive simulated telemetry & outbound communication logs
    const newLogs = [
      {
        id: `log-sms-${Date.now()}`,
        timestamp: nowTime,
        channel: 'SMS (108 DISPATCH)',
        title: `CRITICAL P0 DISPATCH: ${zone.ambulanceBase}`,
        message: `[SIMULATED SMS to 108 Dispatcher]: P0 CRASH DETECTED at ${zone.name} (${zone.subTitle}). Ambulance ${zone.ambulanceBase} alerted. Delta-V: ${scenario.telemetry.deltaV} km/h, CSI: ${scenario.csi}/5.0. Immediate rollout required.`,
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
        title: `Police Interceptor Deployment: ${zone.policeUnit}`,
        message: `[SIMULATED ERSS 112 Police]: Traffic Interceptor alerted for upstream diversion & lane clearance. Suspected casualties: ${scenario.casualtiesCount}, Trapped: ${scenario.trappedVictims}.`,
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
        title: `Multi-Modal Edge Sensor Fusion Spike: ${zone.sensorNode}`,
        message: `[MQTT Telemetry]: { csi: ${scenario.csi}, delta_v: ${scenario.telemetry.deltaV}, acoustic_peak_db: ${scenario.telemetry.acousticPeakDb}, optical_conf: "${scenario.telemetry.opticalConfidence}", zone: "${zone.id}" }`,
        rawPayload: {
          node_id: zone.sensorNode,
          csi: scenario.csi,
          delta_v: scenario.telemetry.deltaV,
          g_force: scenario.telemetry.gForce,
          acoustic_db: scenario.telemetry.acousticPeakDb,
          vehicles: scenario.vehicles,
          trapped_victims: scenario.trappedVictims,
          mesh_protocol: zone.id === 'ghat' ? 'LoRaWAN_865_IN' : '5G_SA_URLLC',
        },
        level: 'critical',
      },
      {
        id: `log-cv2x-${Date.now() + 3}`,
        timestamp: nowTime,
        channel: 'C-V2X',
        title: `Dynamic Green Corridor Armed (Preemption 250m)`,
        message: `[C-V2X Signal Preemption]: Signal node ${scenario.signals[0]?.id || 'SIG-01'} (${scenario.signals[0]?.name}) preemption locked to GREEN WAVE. Cross-traffic yellow-to-red cycle triggered.`,
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
        title: `Trauma Bay Electronic Notification: ${zone.nearestHospital}`,
        message: `[FHIR HL7 v2.5.1]: Incoming polytrauma alert. Recommended reservation: ${scenario.clinicalAssessment.recommendedBed}. Blood protocol: ${scenario.clinicalAssessment.bloodCrossMatch}.`,
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
        ambulanceStatus: 'accepted', // Auto-escalated or confirmed
      })
      const timeoutLog = {
        id: `timeout-${Date.now()}`,
        timestamp: getFormattedTime(),
        channel: 'SMS (108 DISPATCH)',
        title: 'DRIVER ACKNOWLEDGEMENT TIMEOUT (15s): Auto-Confirmed with EMRI Central MDT',
        message: `15-second driver response timer expired. CAD auto-locked ticket to Primary Unit KA-01-EA-108 and dispatched backup dual-responder.`,
        rawPayload: { event: 'DRIVER_TIMEOUT_OVERRIDE', action: 'FORCE_LOCK_TICKET', secondary_alerted: true },
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

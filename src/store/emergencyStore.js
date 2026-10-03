import { create } from 'zustand'
import {
  INITIAL_INCIDENTS,
  NEARBY_HOSPITALS,
  FLEET_AMBULANCES,
  POLICE_UNITS,
  AUTHORIZED_CAMERAS,
  TOLL_PLAZAS,
  SIMULATION_STAGES,
  RESOLVED_INCIDENT_REPORTS
} from '../data/mockScenarios'
import { DEPARTMENT_ROLES, checkViewAuthorization } from '../data/rolesConfig'
import { playAlertBeep, playCountdownTick, playAcceptChime, playRadioSquelch } from '../utils/audio'

function getFormattedTime() {
  const now = new Date()
  return now.toTimeString().split(' ')[0]
}

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'New severe accident detected — RQ-1048',
    detail: 'CAM-07 NH-44 KM 42.4 (AI Confidence 92%)',
    time: '14:32:18',
    read: false,
    type: 'critical'
  },
  {
    id: 'notif-2',
    title: 'Ambulance 07 accepted dispatch for RQ-1048',
    detail: 'En route from Electronic City Post · ETA 02:14',
    time: '14:32:31',
    read: false,
    type: 'info'
  },
  {
    id: 'notif-3',
    title: 'Police unit dispatched — Highway Interceptor 04',
    detail: 'Mandatory response acknowledged by SI M. Kumar',
    time: '14:32:32',
    read: false,
    type: 'warning'
  },
  {
    id: 'notif-4',
    title: 'Hospital alerted — St. John’s Hospital',
    detail: 'Incoming trauma case advisory transmitted',
    time: '14:33:00',
    read: true,
    type: 'info'
  },
  {
    id: 'notif-5',
    title: 'Citizen accident report submitted — RQ-1052',
    detail: 'Electronic City Phase 1 · Awaiting operator review',
    time: '14:35:10',
    read: true,
    type: 'neutral'
  }
]

export const useEmergencyStore = create((set, get) => ({
  // Navigation & Department RBAC Role
  userRole: 'ambulance', // 'ambulance' | 'hospital' | 'police' | 'traffic' | 'toll' | 'citizen' | 'dispatcher'
  activeView: 'ambulances', // 'overview' | 'incidents' | 'incident_detail' | 'map' | 'ambulances' | 'hospitals' | 'police' | 'traffic' | 'toll' | 'cameras' | 'citizen' | 'reports'
  selectedIncidentId: 'RQ-1048',
  selectedAmbulanceUnitId: 'AMB-07', // 'AMB-07' (assigned) | 'AMB-04' (other unit)
  ambulanceDeviceMode: 'mobile', // 'mobile' | 'full'
  citizenDeviceMode: 'mobile', // 'mobile' | 'full'
  selectedCameraId: 'CAM-07',
  
  // Data
  incidents: [...INITIAL_INCIDENTS],
  hospitals: [...NEARBY_HOSPITALS],
  ambulances: [...FLEET_AMBULANCES],
  policeUnits: [...POLICE_UNITS],
  cameras: [...AUTHORIZED_CAMERAS],
  tollPlazas: [...TOLL_PLAZAS],
  reports: [...RESOLVED_INCIDENT_REPORTS],

  // 12-Stage Simulation State
  simulationStage: 6, // default: Ambulance en route (realistic middle stage)
  isAutoPlaying: false,
  autoPlayTimer: null,

  // Authority Specific States for RQ-1048
  hospitalState: {
    selectedHospitalId: 'HOSP-STJOHNS',
    acknowledged: true,
    preparing: true,
    ready: false, // will turn true at stage 11
    selectedBay: 'Trauma Bay 1 (Red Zone)',
    ambulanceArrived: false,
    handoverCompleted: false,
    patientAdmitted: false,
    receivingDoctor: 'Dr. A. Mathew, MD (Chief Medical Officer)',
    admittedBay: 'Trauma Bay 1 (Red Zone)',
    handoverTime: null,
    handoverReceiptId: null,
    casualtiesCount: 2
  },
  policeState: {
    unitId: 'POL-04',
    status: 'Dispatched', // 'Alert received' | 'Dispatched' | 'Arrived'
    officer: 'Sub-Inspector M. Kumar',
    trafficDiverted: true,
    investigationDocket: 'FIR-2026-NH44-01048'
  },
  policeCitizenState: {
    unitId: 'POL-11',
    status: 'Alert received', // 'Alert received' | 'Dispatched' | 'Arrived'
    officer: 'Sub-Inspector V. Rao',
    trafficDiverted: false,
    investigationDocket: 'FIR-2026-BLR-01052'
  },
  trafficState: {
    vmsAdvisoryActive: true,
    vmsMessage: 'CAUTION: CRASH 2KM AHEAD AT KM 42 — MERGE RIGHT',
    signalCorridorActive: true,
    corridorSignals: [
      { id: 'SIG-01', name: 'Electronic City Toll Access', state: 'GREEN_PRIORITY', timer: '0:35' },
      { id: 'SIG-02', name: 'Veerasandra Junction', state: 'GREEN_PRIORITY', timer: '1:12' },
      { id: 'SIG-03', name: 'Hosur Road Flyover Ramp', state: 'HOLD_CROSS_TRAFFIC', timer: '2:05' },
      { id: 'SIG-04', name: 'St. John’s Hospital Gate Spur', state: 'STANDBY_CLEAR', timer: '--:--' }
    ]
  },
  tollState: {
    plazaId: 'TOLL-17',
    emergencyLaneOpen: true,
    overrideMode: 'FASTag Auto-Lift Priority'
  },

  // Citizen Reporting Draft State
  citizenDraft: {
    photo: null, // Strictly null until citizen captures a live photo via camera
    hasPhoto: false,
    locationDetected: 'NH 44, near Electronic City Elevated Highway (12.8452° N, 77.6601° E)',
    shortLocation: 'Electronic City',
    coordinates: { lat: 12.8452, lng: 77.6601 },
    accuracyMeters: 4.8,
    timestamp: null,
    step: 'camera', // 'camera' | 'preview' | 'submitted'
    submittedIncidentId: null,
    gpsLocked: false
  },

  // System
  notifications: INITIAL_NOTIFICATIONS,
  notificationsOpen: false,
  demoPanelOpen: false,
  soundEnabled: true,
  confirmModal: {
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    isDestructive: false,
    onConfirm: null
  },

  // Interactive User Guides System
  userGuidesOpen: false,
  userGuidesActiveTopic: 'citizen',
  openUserGuides: (topic = 'citizen') => set({ userGuidesOpen: true, userGuidesActiveTopic: topic }),
  closeUserGuides: () => set({ userGuidesOpen: false }),
  setUserGuidesActiveTopic: (topic) => set({ userGuidesActiveTopic: topic }),

  // Response Timer for RQ-1048
  timerSeconds: 134, // 02:14
  timerStatus: 'within_target', // 'within_target' | 'at_risk' | 'exceeded'

  // Setters
  setActiveView: (view) => set({ activeView: view }),
  setUserRole: (newRole) => {
    const roleObj = DEPARTMENT_ROLES.find(r => r.id === newRole)
    const targetDesk = roleObj ? roleObj.primaryDesk : 'overview'
    set({
      userRole: newRole,
      activeView: targetDesk
    })
    get().addNotification({
      title: `Active Terminal: ${roleObj?.name || newRole}`,
      detail: `Department credentials switched. Desk isolation protocol active.`,
      type: 'info'
    })
  },
  setSelectedIncidentId: (id) => set({ selectedIncidentId: id }),
  setSelectedAmbulanceUnitId: (unitId) => set({ selectedAmbulanceUnitId: unitId }),
  setAmbulanceDeviceMode: (mode) => set({ ambulanceDeviceMode: mode }),
  setCitizenDeviceMode: (mode) => set({ citizenDeviceMode: mode }),
  setSelectedCameraId: (camId) => set({ selectedCameraId: camId }),
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),
  setDemoPanelOpen: (open) => set({ demoPanelOpen: open }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

  // Notification Actions
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n)
  })),
  markAllNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true }))
  })),
  addNotification: (notif) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      time: getFormattedTime(),
      read: false,
      ...notif
    }
    set((state) => ({
      notifications: [newNotif, ...state.notifications]
    }))
    if (get().soundEnabled) {
      if (notif.type === 'critical') playAlertBeep()
      else playRadioSquelch()
    }
  },

  // Confirm Modal
  openConfirmModal: ({ title, message, confirmLabel, cancelLabel, isDestructive, onConfirm }) => set({
    confirmModal: {
      isOpen: true,
      title,
      message,
      confirmLabel: confirmLabel || 'Confirm',
      cancelLabel: cancelLabel || 'Cancel',
      isDestructive: !!isDestructive,
      onConfirm
    }
  }),
  closeConfirmModal: () => set({
    confirmModal: {
      isOpen: false,
      title: '',
      message: '',
      confirmLabel: 'Confirm',
      cancelLabel: 'Cancel',
      isDestructive: false,
      onConfirm: null
    }
  }),

  // Response Timer Tick
  tickTimer: () => set((state) => {
    const active = state.incidents.find((i) => i.id === 'RQ-1048')
    if (!active || active.status === 'Completed') return state

    const newSec = Math.max(0, state.timerSeconds - 1)
    let status = 'within_target'
    if (newSec === 0) status = 'exceeded'
    else if (newSec < 60) status = 'at_risk'

    return {
      timerSeconds: newSec,
      timerStatus: status,
      incidents: state.incidents.map((inc) =>
        inc.id === 'RQ-1048' ? { ...inc, remainingSeconds: newSec } : inc
      )
    }
  }),

  // SIMULATION STAGE CONTROL (1 to 12)
  setSimulationStage: (stageNum) => {
    const stage = Math.min(12, Math.max(1, stageNum))
    set({ simulationStage: stage })

    const state = get()
    let updatedIncidents = [...state.incidents]
    let updatedHospital = { ...state.hospitalState }
    let updatedPolice = { ...state.policeState }

    const rqIndex = updatedIncidents.findIndex((i) => i.id === 'RQ-1048')
    if (rqIndex === -1) return

    const rq = { ...updatedIncidents[rqIndex] }
    const timeline = [...rq.timeline]

    switch (stage) {
      case 1: // Accident detected
        rq.status = 'Accident detected'
        rq.remainingSeconds = 180
        rq.response = {
          ...rq.response,
          ambulance: { unit: 'Unassigned', status: 'Searching nearest unit', targetArrival: '03:00', distanceKm: '2.8 km' },
          police: { unit: 'Queued', status: 'Alert queued', officer: '--' },
          hospital: { name: 'Not selected yet', status: 'Standby', eta: '--' }
        }
        break

      case 2: // Ambulance alert
        rq.status = 'Ambulance alerted'
        rq.remainingSeconds = 180
        rq.response = {
          ...rq.response,
          ambulance: { id: 'KA 01 AB 1234', unit: 'Ambulance 07', status: 'Alerted', targetArrival: '03:00', distanceKm: '2.8 km' },
          police: { unit: 'Highway Interceptor 04', status: 'Alert sent', officer: 'Sub-Inspector M. Kumar' },
          hospital: { name: 'Not selected yet', status: 'Standby', eta: '--' }
        }
        if (state.soundEnabled) playAlertBeep()
        break

      case 3: // Ambulance accepts
        rq.status = 'Ambulance accepted'
        rq.response = {
          ...rq.response,
          ambulance: { id: 'KA 01 AB 1234', unit: 'Ambulance 07', status: 'Accepted', targetArrival: '02:45', distanceKm: '2.8 km' }
        }
        if (!timeline.some(t => t.text.includes('Ambulance 07 accepted'))) {
          timeline.push({ time: getFormattedTime(), text: 'Ambulance 07 accepted dispatch', source: 'Ambulance' })
        }
        if (state.soundEnabled) playAcceptChime()
        break

      case 4: // Other ambulances blocked
        rq.status = 'Assigned to Ambulance 07'
        rq.response = {
          ...rq.response,
          ambulance: { id: 'KA 01 AB 1234', unit: 'Ambulance 07', status: 'Accepted (Other units locked)', targetArrival: '02:40', distanceKm: '2.8 km' }
        }
        break

      case 5: // Police alert & dispatch
        rq.status = 'Police dispatched'
        updatedPolice = { ...updatedPolice, status: 'Dispatched' }
        rq.response = {
          ...rq.response,
          police: { unit: 'Highway Interceptor 04', status: 'Dispatched', officer: 'Sub-Inspector M. Kumar' }
        }
        if (!timeline.some(t => t.text.includes('Highway Interceptor 04 notified'))) {
          timeline.push({ time: getFormattedTime(), text: 'Police Highway Interceptor 04 dispatched to scene', source: 'Police' })
        }
        break

      case 6: // Ambulance en route
        rq.status = 'Ambulance en route'
        rq.remainingSeconds = 134
        rq.response = {
          ...rq.response,
          ambulance: { id: 'KA 01 AB 1234', unit: 'Ambulance 07', status: 'En route', targetArrival: '02:14', distanceKm: '2.8 km' }
        }
        if (!timeline.some(t => t.text.includes('en route to scene'))) {
          timeline.push({ time: getFormattedTime(), text: 'Ambulance 07 en route with siren telemetry active', source: 'Ambulance' })
        }
        break

      case 7: // Ambulance arrives
        rq.status = 'Ambulance arrived on scene'
        rq.remainingSeconds = 0
        rq.response = {
          ...rq.response,
          ambulance: { id: 'KA 01 AB 1234', unit: 'Ambulance 07', status: 'Arrived on scene', targetArrival: '00:00', distanceKm: '0.0 km' }
        }
        updatedPolice = { ...updatedPolice, status: 'Arrived' }
        if (!timeline.some(t => t.text.includes('arrived at accident scene'))) {
          timeline.push({ time: getFormattedTime(), text: 'Ambulance 07 arrived at accident scene', source: 'Ambulance' })
        }
        break

      case 8: // Patient picked up
        rq.status = 'Patient picked up'
        rq.response = {
          ...rq.response,
          ambulance: { id: 'KA 01 AB 1234', unit: 'Ambulance 07', status: 'Patient picked up · Selecting hospital', targetArrival: '--', distanceKm: '0.0 km' }
        }
        if (!timeline.some(t => t.text.includes('Casualties stabilized'))) {
          timeline.push({ time: getFormattedTime(), text: 'Casualties stabilized & loaded into ambulance', source: 'Ambulance' })
        }
        break

      case 9: // Hospital selected
        rq.status = 'Hospital selected'
        updatedHospital = {
          ...updatedHospital,
          selectedHospitalId: 'HOSP-STJOHNS',
          acknowledged: true,
          preparing: true,
          ready: false
        }
        rq.response = {
          ...rq.response,
          ambulance: { id: 'KA 01 AB 1234', unit: 'Ambulance 07', status: 'Transporting to St. John’s', targetArrival: '06:00', distanceKm: '3.2 km' },
          hospital: { name: "St. John's Hospital", status: 'Preparing Bay', eta: '06 min' }
        }
        if (!timeline.some(t => t.text.includes('St. John’s Hospital selected'))) {
          timeline.push({ time: getFormattedTime(), text: 'St. John’s Hospital selected as destination', source: 'Ambulance' })
        }
        break

      case 10: // Hospital alerted
        rq.status = 'Hospital alerted'
        updatedHospital = {
          ...updatedHospital,
          acknowledged: true,
          preparing: true,
          ready: false
        }
        rq.response = {
          ...rq.response,
          hospital: { name: "St. John's Hospital", status: 'Preparing Bay', eta: '06 min' }
        }
        if (!timeline.some(t => t.text.includes('St. John’s Emergency Desk alerted'))) {
          timeline.push({ time: getFormattedTime(), text: 'St. John’s Emergency Desk alerted with inbound triage packet', source: 'Hospital' })
        }
        break

      case 11: // Hospital ready
        rq.status = 'Hospital ready for arrival'
        updatedHospital = {
          ...updatedHospital,
          acknowledged: true,
          preparing: true,
          ready: true
        }
        rq.response = {
          ...rq.response,
          hospital: { name: "St. John's Hospital", status: 'READY FOR ARRIVAL', eta: '03 min' }
        }
        if (!timeline.some(t => t.text.includes('READY FOR ARRIVAL'))) {
          timeline.push({ time: getFormattedTime(), text: 'Hospital marked READY FOR ARRIVAL (Trauma Bay 1 locked)', source: 'Hospital' })
        }
        if (state.soundEnabled) playAcceptChime()
        break

      case 12: // Incident completed
        rq.status = 'Completed'
        rq.remainingSeconds = 0
        rq.response = {
          ...rq.response,
          ambulance: { id: 'KA 01 AB 1234', unit: 'Ambulance 07', status: 'Completed handover · Available at Post', targetArrival: '--', distanceKm: '--' },
          hospital: { name: "St. John's Hospital", status: 'Patient admitted to Trauma Bay 1', eta: '--' }
        }
        updatedHospital = {
          ...updatedHospital,
          acknowledged: true,
          preparing: true,
          ready: true,
          ambulanceArrived: true,
          handoverCompleted: true,
          patientAdmitted: true,
          receivingDoctor: 'Dr. A. Mathew, MD (Chief Medical Officer)',
          admittedBay: 'Trauma Bay 1 (Red Zone)',
          handoverTime: getFormattedTime(),
          handoverReceiptId: 'REC-2026-RQ1048-SJ',
          casualtiesCount: 2
        }
        if (!rq.handoverDetails) {
          rq.handoverDetails = {
            receiptId: 'REC-2026-RQ1048-SJ',
            hospitalName: "St. John's Medical College Hospital",
            bay: 'Trauma Bay 1 (Red Zone)',
            receivingDoctor: 'Dr. A. Mathew, MD (Chief Medical Officer)',
            paramedic: 'Paramedic S. Nair (ALS Badge #9021)',
            driver: 'Ramesh K.',
            ambulanceUnit: 'Ambulance 07 (KA 01 AB 1234)',
            casualtiesCount: 2,
            handoverTime: getFormattedTime(),
            totalMissionTime: '15m 44s',
            notes: 'Two casualties transferred: 1 severe blunt chest trauma (vitals stable, O-Neg primed), 1 cervical strain (C-collar secured). Full vitals debrief handed to ER trauma lead.',
            status: 'Case Closed & Handed Over'
          }
        }
        if (!timeline.some(t => t.text.includes('Handover completed') || t.text.includes('Clinical handover signed'))) {
          timeline.push({ time: getFormattedTime(), text: 'Casualties handed over to Dr. A. Mathew at Trauma Bay 1. Paramedic sign-off complete. Incident closed.', source: 'Ambulance' })
        }
        break

      default:
        break
    }

    rq.timeline = timeline
    updatedIncidents[rqIndex] = rq

    set({
      incidents: updatedIncidents,
      hospitalState: updatedHospital,
      policeState: updatedPolice
    })
  },

  nextSimulationStage: () => {
    const cur = get().simulationStage
    if (cur < 12) {
      get().setSimulationStage(cur + 1)
    }
  },

  prevSimulationStage: () => {
    const cur = get().simulationStage
    if (cur > 1) {
      get().setSimulationStage(cur - 1)
    }
  },

  toggleAutoPlay: () => {
    const state = get()
    if (state.isAutoPlaying) {
      if (state.autoPlayTimer) clearInterval(state.autoPlayTimer)
      set({ isAutoPlaying: false, autoPlayTimer: null })
    } else {
      const timer = setInterval(() => {
        const currentStage = get().simulationStage
        if (currentStage >= 12) {
          get().setSimulationStage(1)
        } else {
          get().nextSimulationStage()
        }
      }, 5000)
      set({ isAutoPlaying: true, autoPlayTimer: timer })
    }
  },

  // Specific Direct Operator Actions (Synced with simulation stages)
  ambulanceAcceptIncident: () => {
    get().setSimulationStage(3)
    get().addNotification({
      title: 'Ambulance 07 accepted dispatch',
      detail: 'Responding to incident RQ-1048 at NH 44 KM 42.4',
      type: 'info'
    })
  },

  ambulanceRejectIncident: () => {
    get().addNotification({
      title: 'Ambulance 07 reported unable to respond',
      detail: 'Dispatch rerouting to backup unit (Ambulance 04)',
      type: 'warning'
    })
  },

  ambulanceStartNavigation: () => {
    get().setSimulationStage(6)
  },

  ambulanceMarkArrived: () => {
    get().setSimulationStage(7)
    get().addNotification({
      title: 'Ambulance 07 arrived on scene',
      detail: 'Casualty assessment and stabilization in progress',
      type: 'info'
    })
  },

  ambulanceMarkPatientPickedUp: () => {
    get().setSimulationStage(8)
    get().addNotification({
      title: 'Patient picked up by Ambulance 07',
      detail: 'Paramedics selecting destination trauma facility',
      type: 'info'
    })
  },

  ambulanceSelectHospital: (hospId) => {
    const hosp = get().hospitals.find(h => h.id === hospId) || get().hospitals[0]
    set((state) => ({
      hospitalState: {
        ...state.hospitalState,
        selectedHospitalId: hosp.id
      }
    }))
    get().setSimulationStage(9)
    get().addNotification({
      title: `Destination confirmed: ${hosp.name}`,
      detail: `${hosp.distanceKm} km · ETA ${hosp.etaMinutes} min · Emergency alert sent`,
      type: 'info'
    })
  },

  ambulanceArriveHospital: () => {
    const time = getFormattedTime()
    set((state) => {
      const updatedIncidents = state.incidents.map((inc) => {
        if (inc.id === 'RQ-1048') {
          const timeline = [...inc.timeline]
          if (!timeline.some(t => t.text.includes('arrived at hospital') || t.text.includes('reached St. John'))) {
            timeline.push({
              time,
              text: "Ambulance 07 arrived at St. John's Hospital emergency gate with 2 casualties",
              source: 'Ambulance'
            })
          }
          return {
            ...inc,
            timeline,
            response: {
              ...inc.response,
              ambulance: {
                ...inc.response?.ambulance,
                status: 'Arrived at Hospital · Handover pending',
                targetArrival: '00:00',
                distanceKm: '0.0 km'
              }
            }
          }
        }
        return inc
      })
      return {
        simulationStage: Math.max(state.simulationStage, 11),
        incidents: updatedIncidents,
        hospitalState: {
          ...state.hospitalState,
          ambulanceArrived: true,
          ready: true
        }
      }
    })
    get().addNotification({
      title: "Ambulance 07 arrived at St. John's Hospital",
      detail: '2 casualties at emergency gurney. Clinical handover initiated with ER team.',
      type: 'info'
    })
    if (get().soundEnabled) {
      playAcceptChime()
    }
  },

  ambulanceConfirmHandoverAndCloseCase: (customDetails = {}) => {
    const time = getFormattedTime()
    const receiptId = `REC-2026-RQ1048-SJ`
    const receivingDoctor = customDetails.receivingDoctor || 'Dr. A. Mathew, MD (Chief Medical Officer)'
    const traumaBay = customDetails.traumaBay || 'Trauma Bay 1 (Red Zone)'
    const paramedic = customDetails.paramedic || 'Paramedic S. Nair (ALS Badge #9021)'
    const casualtiesCount = customDetails.casualtiesCount || 2
    const notes = customDetails.notes || 'Both casualties transferred in stable condition. IV infusion and cervical collar intact. Full vitals telemetry transferred.'

    const handoverDetails = {
      receiptId,
      hospitalName: "St. John's Medical College Hospital",
      bay: traumaBay,
      receivingDoctor,
      paramedic,
      driver: 'Ramesh K.',
      ambulanceUnit: 'Ambulance 07 (KA 01 AB 1234)',
      casualtiesCount,
      handoverTime: time,
      totalMissionTime: '15m 44s',
      notes,
      status: 'Case Closed & Handed Over'
    }

    set((state) => {
      const updatedIncidents = state.incidents.map((inc) => {
        if (inc.id === 'RQ-1048') {
          const timeline = [...inc.timeline]
          if (!timeline.some(t => t.text.includes('Clinical handover signed') || t.text.includes('Handover completed'))) {
            timeline.push({
              time,
              text: `Casualties handed over to ${receivingDoctor} at ${traumaBay}. Clinical handover signed. Incident closed.`,
              source: 'Ambulance'
            })
          }
          return {
            ...inc,
            status: 'Completed',
            remainingSeconds: 0,
            handoverDetails,
            timeline,
            response: {
              ...inc.response,
              ambulance: {
                ...inc.response?.ambulance,
                status: 'Completed handover · Available at Post',
                targetArrival: '--',
                distanceKm: '--'
              },
              hospital: {
                ...inc.response?.hospital,
                status: `Patient admitted to ${traumaBay}`,
                eta: '--'
              }
            }
          }
        }
        return inc
      })

      return {
        simulationStage: 12,
        incidents: updatedIncidents,
        hospitalState: {
          ...state.hospitalState,
          acknowledged: true,
          preparing: true,
          ready: true,
          ambulanceArrived: true,
          handoverCompleted: true,
          patientAdmitted: true,
          receivingDoctor,
          admittedBay: traumaBay,
          handoverTime: time,
          handoverReceiptId: receiptId,
          casualtiesCount
        }
      }
    })

    get().addNotification({
      title: 'Incident RQ-1048 closed by Ambulance 07',
      detail: `Clinical handover signed with ${receivingDoctor} at St. John's. Unit KA 01 AB 1234 back to AVAILABLE.`,
      type: 'info'
    })

    if (get().soundEnabled) {
      playAcceptChime()
    }
  },

  ambulanceResetToAvailable: () => {
    set((state) => ({
      simulationStage: 1,
      hospitalState: {
        ...state.hospitalState,
        ambulanceArrived: false,
        handoverCompleted: false,
        patientAdmitted: false,
        ready: false,
        handoverTime: null,
        handoverReceiptId: null
      }
    }))
    get().addNotification({
      title: 'Ambulance 07 reset to AVAILABLE',
      detail: 'Unit stationed at Electronic City Post · Ready for next dispatch.',
      type: 'info'
    })
  },

  // Hospital Actions
  hospitalAcknowledge: () => {
    set((state) => ({
      hospitalState: { ...state.hospitalState, acknowledged: true }
    }))
    get().addNotification({
      title: 'Hospital Emergency Desk acknowledged inbound case',
      detail: 'Triage team standing by for Ambulance 07',
      type: 'info'
    })
  },

  hospitalPrepare: () => {
    set((state) => ({
      hospitalState: { ...state.hospitalState, preparing: true }
    }))
    get().setSimulationStage(10)
    get().addNotification({
      title: 'Hospital preparing Trauma Bay 1',
      detail: 'O-Negative blood cross-match primed',
      type: 'info'
    })
  },

  hospitalMarkReady: () => {
    get().setSimulationStage(11)
    get().addNotification({
      title: 'St. John’s Hospital: READY FOR ARRIVAL',
      detail: 'Trauma Bay 1 cleared · Surgical staff in position',
      type: 'success'
    })
  },

  // Police Actions
  policeAcknowledge: () => {
    set((state) => ({
      policeState: { ...state.policeState, status: 'Alert received' }
    }))
    get().addNotification({
      title: 'Police Highway Interceptor 04 acknowledged incident',
      detail: 'Mandatory vehicular collision response protocol active',
      type: 'warning'
    })
  },

  policeDispatch: () => {
    get().setSimulationStage(5)
    get().addNotification({
      title: 'Police Highway Interceptor 04 dispatched',
      detail: 'ETA 4 mins to NH 44 KM 42.4',
      type: 'warning'
    })
  },

  policeMarkArrived: () => {
    set((state) => ({
      policeState: { ...state.policeState, status: 'Arrived' }
    }))
    get().addNotification({
      title: 'Police Highway Interceptor 04 arrived on scene',
      detail: 'Traffic diversion established · Lane 2 cordon active',
      type: 'info'
    })
  },

  // Traffic Authority Actions
  toggleVmsAdvisory: () => set((state) => ({
    trafficState: {
      ...state.trafficState,
      vmsAdvisoryActive: !state.trafficState.vmsAdvisoryActive
    }
  })),

  toggleSignalCorridor: () => set((state) => ({
    trafficState: {
      ...state.trafficState,
      signalCorridorActive: !state.trafficState.signalCorridorActive
    }
  })),

  // Toll Authority Actions
  toggleTollEmergencyLane: () => set((state) => ({
    tollState: {
      ...state.tollState,
      emergencyLaneOpen: !state.tollState.emergencyLaneOpen
    }
  })),

  // Citizen Reporting Flow
  citizenSetLocation: ({ location, shortLocation, coordinates, accuracyMeters }) => {
    set((state) => ({
      citizenDraft: {
        ...state.citizenDraft,
        locationDetected: location || state.citizenDraft.locationDetected,
        shortLocation: shortLocation || state.citizenDraft.shortLocation,
        coordinates: coordinates || state.citizenDraft.coordinates,
        accuracyMeters: accuracyMeters || state.citizenDraft.accuracyMeters,
        gpsLocked: true
      }
    }))
  },

  citizenCapturePhoto: (customPhotoUrl, locationData = null) => {
    set((state) => ({
      citizenDraft: {
        ...state.citizenDraft,
        hasPhoto: Boolean(customPhotoUrl),
        photo: customPhotoUrl || null,
        timestamp: getFormattedTime(),
        step: 'preview',
        ...(locationData ? {
          locationDetected: locationData.location || state.citizenDraft.locationDetected,
          shortLocation: locationData.shortLocation || state.citizenDraft.shortLocation,
          coordinates: locationData.coordinates || state.citizenDraft.coordinates,
          accuracyMeters: locationData.accuracyMeters || state.citizenDraft.accuracyMeters,
          gpsLocked: true
        } : {})
      }
    }))
  },

  citizenSubmitReport: () => {
    const newId = 'RQ-1052'
    const draft = get().citizenDraft
    const currentTime = draft.timestamp || getFormattedTime()
    const actualLocation = draft.locationDetected || 'Electronic City Phase 1 Road (12.8452° N, 77.6601° E)'
    const shortLocation = draft.shortLocation || 'Electronic City'
    const coordinates = draft.coordinates || { lat: 12.8452, lng: 77.6601 }
    const accuracy = draft.accuracyMeters || 4.8
    // Strictly preserve original citizen clicked photo - NO demo photo fallback!
    const photo = draft.photo

    set((state) => {
      const updatedIncidents = state.incidents.map((inc) => {
        if (inc.id === newId) {
          return {
            ...inc,
            location: actualLocation,
            shortLocation,
            coordinates,
            image: photo, // Original citizen clicked photo
            isOriginalCitizenPhoto: true,
            isDemoStream: false,
            detectedTime: currentTime,
            status: 'Citizen report received · Dispatched to authorities',
            severity: 'Moderate',
            source: 'ORIGINAL CITIZEN LIVE PHOTO REPORT',
            timeline: [
              { time: currentTime, text: `Live accident photo clicked by citizen bystander (Original Camera Capture)`, source: 'Citizen' },
              { time: currentTime, text: `Actual incident GPS locked: ${coordinates.lat}° N, ${coordinates.lng}° E (±${accuracy}m)`, source: 'System' },
              { time: currentTime, text: `Original citizen photo & coordinates transmitted to Ambulance 04, BTP Patrol 11, and Traffic Authority`, source: 'System' }
            ],
            citizenReport: {
              photoReceived: Boolean(photo),
              isOriginalClickedPhoto: true,
              locationReceived: true,
              confirmed: true,
              capturedTime: currentTime,
              reportedBy: 'Citizen Bystander (Live Device Camera Snap)',
              accuracyMeters: accuracy,
              actualLocation,
              coordinates
            },
            response: {
              ...inc.response,
              ambulance: {
                id: 'KA 04 E 2211',
                unit: 'Ambulance 04',
                status: 'Dispatched to Citizen GPS',
                targetArrival: '03:45',
                distanceKm: '1.8 km'
              },
              police: {
                unit: 'BTP Patrol 11',
                status: 'Dispatched to Incident Scene',
                officer: 'SI V. Rao'
              },
              traffic: {
                status: 'Corridor advisory active',
                impact: 'Moderate',
                road: actualLocation
              }
            }
          }
        }
        return inc
      })

      return {
        incidents: updatedIncidents,
        citizenDraft: {
          ...state.citizenDraft,
          step: 'submitted',
          submittedIncidentId: newId,
          timestamp: currentTime
        },
        trafficState: {
          ...state.trafficState,
          vmsAdvisoryActive: true,
          vmsMessage: `CAUTION: ACCIDENT AT ${shortLocation.toUpperCase()} — EMERGENCY CORRIDOR ACTIVE`
        }
      }
    })

    get().addNotification({
      title: `Citizen report ${newId} dispatched to emergency grid`,
      detail: `Location: ${actualLocation} · Ambulance 04, BTP Patrol 11 & Traffic alerted.`,
      type: 'critical'
    })

    if (get().soundEnabled) {
      playAlertBeep()
    }
  },

  ambulanceAcceptCitizenIncident: () => {
    set((state) => ({
      incidents: state.incidents.map((inc) =>
        inc.id === 'RQ-1052'
          ? {
              ...inc,
              status: 'Ambulance 04 en route to citizen GPS',
              response: {
                ...inc.response,
                ambulance: {
                  ...inc.response.ambulance,
                  status: 'En route to scene (GPS locked)',
                  targetArrival: '02:50'
                }
              }
            }
          : inc
      )
    }))
    get().addNotification({
      title: 'Ambulance 04 accepted citizen incident RQ-1052',
      detail: 'Navigating to verified citizen photo GPS coordinates',
      type: 'info'
    })
    if (get().soundEnabled) {
      playAcceptChime()
    }
  },

  policeDispatchToCitizenIncident: () => {
    set((state) => ({
      policeCitizenState: { ...state.policeCitizenState, status: 'Dispatched' },
      incidents: state.incidents.map((inc) =>
        inc.id === 'RQ-1052'
          ? {
              ...inc,
              response: {
                ...inc.response,
                police: {
                  ...inc.response.police,
                  status: 'En route to citizen location with siren active'
                }
              }
            }
          : inc
      )
    }))
    get().addNotification({
      title: 'BTP Patrol 11 dispatched to citizen accident',
      detail: 'Responding to citizen GPS location under Section 134A',
      type: 'warning'
    })
  },

  ambulanceArriveCitizenScene: () => {
    set((state) => ({
      incidents: state.incidents.map((inc) =>
        inc.id === 'RQ-1052'
          ? {
              ...inc,
              status: 'Ambulance 04 arrived at citizen location',
              response: {
                ...inc.response,
                ambulance: {
                  ...inc.response.ambulance,
                  status: 'Arrived on scene (GPS verified)',
                  targetArrival: 'Arrived'
                }
              }
            }
          : inc
      )
    }))
    get().addNotification({
      title: 'Ambulance 04 arrived at citizen scene',
      detail: 'Paramedic triage underway at reported coordinates',
      type: 'info'
    })
  },

  ambulancePickUpCitizenPatient: () => {
    set((state) => ({
      incidents: state.incidents.map((inc) =>
        inc.id === 'RQ-1052'
          ? {
              ...inc,
              status: 'Patient secured in Ambulance 04',
              response: {
                ...inc.response,
                ambulance: {
                  ...inc.response.ambulance,
                  status: 'Patient secured · En route to hospital'
                }
              }
            }
          : inc
      )
    }))
    get().addNotification({
      title: 'Ambulance 04: Patient secured from citizen crash scene',
      detail: 'Transporting to emergency care center',
      type: 'info'
    })
  },

  policeAcknowledgeCitizen: () => {
    set((state) => ({
      policeCitizenState: { ...state.policeCitizenState, status: 'Alert received' }
    }))
    get().addNotification({
      title: 'BTP Patrol 11 acknowledged citizen report RQ-1052',
      detail: 'Section 134A mandatory accident protocol active',
      type: 'info'
    })
  },

  policeDispatchCitizen: () => {
    set((state) => ({
      policeCitizenState: { ...state.policeCitizenState, status: 'Dispatched' },
      incidents: state.incidents.map((inc) =>
        inc.id === 'RQ-1052'
          ? {
              ...inc,
              response: {
                ...inc.response,
                police: {
                  ...inc.response.police,
                  status: 'Dispatched (Priority Siren)'
                }
              }
            }
          : inc
      )
    }))
    get().addNotification({
      title: 'BTP Patrol 11 en route to citizen accident location',
      detail: 'Patrol vehicle dispatched with beacon and siren active',
      type: 'warning'
    })
  },

  policeArriveCitizen: () => {
    set((state) => ({
      policeCitizenState: { ...state.policeCitizenState, status: 'Arrived', trafficDiverted: true },
      incidents: state.incidents.map((inc) =>
        inc.id === 'RQ-1052'
          ? {
              ...inc,
              response: {
                ...inc.response,
                police: {
                  ...inc.response.police,
                  status: 'Arrived on scene · Securing perimeter'
                }
              }
            }
          : inc
      )
    }))
    get().addNotification({
      title: 'BTP Patrol 11 arrived at citizen accident scene',
      detail: 'Perimeter secured and traffic cones deployed',
      type: 'info'
    })
  },

  citizenResetForm: () => {
    set({
      citizenDraft: {
        photo: null,
        hasPhoto: false,
        locationDetected: 'NH 44, near Electronic City Elevated Highway (12.8452° N, 77.6601° E)',
        shortLocation: 'Electronic City',
        coordinates: { lat: 12.8452, lng: 77.6601 },
        accuracyMeters: 4.8,
        timestamp: null,
        step: 'camera',
        submittedIncidentId: null,
        gpsLocked: false
      }
    })
  },

  // Confirm and verify citizen report into active dispatch grid
  confirmCitizenIncident: (id) => {
    set((state) => ({
      incidents: state.incidents.map((inc) =>
        inc.id === id
          ? {
              ...inc,
              severity: 'Moderate',
              status: 'Dispatched to patrol',
              response: {
                ...inc.response,
                ambulance: { unit: 'Ambulance 04', status: 'Alerted', targetArrival: '04:00', distanceKm: '1.8 km' },
                police: { unit: 'BTP Patrol 11', status: 'Dispatched', officer: 'SI V. Rao' }
              }
            }
          : inc
      )
    }))
    get().addNotification({
      title: `Incident ${id} confirmed by operator`,
      detail: 'Ambulance 04 and Police Patrol 11 dispatched to scene',
      type: 'info'
    })
  },

  // Close Incident
  closeIncident: (id) => {
    set((state) => ({
      incidents: state.incidents.map((inc) =>
        inc.id === id ? { ...inc, status: 'Completed' } : inc
      )
    }))
    get().addNotification({
      title: `Incident ${id} closed and archived`,
      detail: 'Response audit docket finalized',
      type: 'info'
    })
  }
}))

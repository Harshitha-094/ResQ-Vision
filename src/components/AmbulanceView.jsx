import React, { useState } from 'react'
import {
  Navigation2,
  CheckCircle2,
  MapPin,
  Check,
  Building2,
  Smartphone,
  Truck,
  FileCheck2,
  RotateCcw,
  BookOpen,
  Camera,
  Radio
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'
import HospitalSelectionModal from './HospitalSelectionModal'
import HospitalHandoverModal from './HospitalHandoverModal'

export default function AmbulanceView() {
  const {
    selectedAmbulanceUnitId,
    setSelectedAmbulanceUnitId,
    simulationStage,
    ambulanceAcceptIncident,
    ambulanceRejectIncident,
    ambulanceStartNavigation,
    ambulanceMarkArrived,
    ambulanceMarkPatientPickedUp,
    ambulanceArriveHospital,
    ambulanceResetToAvailable,
    ambulanceAcceptCitizenIncident,
    ambulanceArriveCitizenScene,
    ambulancePickUpCitizenPatient,
    citizenSubmitReport,
    hospitalState,
    ambulanceDeviceMode,
    setAmbulanceDeviceMode,
    incidents,
    hospitals,
    openUserGuides
  } = useEmergencyStore()

  const [hospitalModalOpen, setHospitalModalOpen] = useState(false)
  const [handoverModalOpen, setHandoverModalOpen] = useState(false)
  const isUnit07 = selectedAmbulanceUnitId === 'AMB-07'
  const isAcceptedBy07 = simulationStage >= 3
  const incident = incidents.find(i => i.id === 'RQ-1048') || incidents[0]
  const citizenIncident = incidents.find(i => i.id === 'RQ-1052')
  const selectedHospital = hospitals.find(h => h.id === hospitalState.selectedHospitalId) || hospitals[0]

  const isCitizenDispatchedTo04 = Boolean(
    citizenIncident && (
      citizenIncident.source?.includes('CITIZEN') ||
      citizenIncident.status?.toLowerCase().includes('citizen') ||
      citizenIncident.status?.toLowerCase().includes('ambulance 04') ||
      citizenIncident.response?.ambulance?.status?.toLowerCase().includes('en route') ||
      citizenIncident.response?.ambulance?.status?.toLowerCase().includes('dispatched') ||
      citizenIncident.citizenReport?.photoReceived
    )
  )

  // Status computation for top header
  let unitStatus = 'AVAILABLE'
  let unitStatusColor = 'text-emerald-800 bg-emerald-50 border-emerald-200'

  if (isUnit07) {
    if (simulationStage === 2) {
      unitStatus = 'ALERT RECEIVED'
      unitStatusColor = 'text-red-700 bg-red-50 border-red-200'
    } else if (simulationStage >= 3 && simulationStage <= 5) {
      unitStatus = 'ACCEPTED'
      unitStatusColor = 'text-blue-700 bg-blue-50 border-blue-200'
    } else if (simulationStage === 6) {
      unitStatus = 'EN ROUTE'
      unitStatusColor = 'text-amber-800 bg-amber-50 border-amber-200'
    } else if (simulationStage === 7) {
      unitStatus = 'ARRIVED ON SCENE'
      unitStatusColor = 'text-emerald-800 bg-emerald-50 border-emerald-200'
    } else if (simulationStage === 8) {
      unitStatus = 'PATIENT SECURED'
      unitStatusColor = 'text-emerald-800 bg-emerald-50 border-emerald-200'
    } else if (simulationStage >= 9 && simulationStage <= 11) {
      unitStatus = hospitalState.ambulanceArrived ? 'ARRIVED AT HOSPITAL' : 'TRANSPORTING TO ER'
      unitStatusColor = hospitalState.ambulanceArrived
        ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
        : 'text-blue-700 bg-blue-50 border-blue-200'
    } else if (simulationStage >= 12) {
      unitStatus = 'CASE CLOSED · AVAILABLE'
      unitStatusColor = 'text-emerald-800 bg-emerald-50 border-emerald-200'
    }
  } else {
    // Ambulance 04
    if (isCitizenDispatchedTo04) {
      if (citizenIncident.status?.includes('arrived')) {
        unitStatus = 'ARRIVED ON SCENE'
        unitStatusColor = 'text-emerald-800 bg-emerald-50 border-emerald-200'
      } else if (citizenIncident.status?.includes('secured')) {
        unitStatus = 'PATIENT SECURED'
        unitStatusColor = 'text-emerald-800 bg-emerald-50 border-emerald-200'
      } else if (citizenIncident.response?.ambulance?.status?.toLowerCase().includes('en route')) {
        unitStatus = 'EN ROUTE TO CITIZEN GPS'
        unitStatusColor = 'text-amber-800 bg-amber-50 border-amber-200'
      } else {
        unitStatus = 'CITIZEN DISPATCH ALERT'
        unitStatusColor = 'text-red-700 bg-red-50 border-red-200'
      }
    } else {
      unitStatus = isAcceptedBy07 ? 'STANDBY / AVAILABLE' : 'AVAILABLE'
    }
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Unit & Device Mode Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-2xs">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-slate-800">Terminal Dispatch Node:</span>
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              onClick={() => setSelectedAmbulanceUnitId('AMB-07')}
              className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                isUnit07 ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ambulance 07 (Assigned AI Crash)
            </button>
            <button
              onClick={() => setSelectedAmbulanceUnitId('AMB-04')}
              className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                !isUnit07 ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Ambulance 04 (Citizen Unit)</span>
              {isCitizenDispatchedTo04 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => openUserGuides('ambulance')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-medium transition-colors cursor-pointer"
            title="Open Ambulance 108 Step-by-Step SOP Guide"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>SOP Guide</span>
          </button>
          <button
            onClick={() => setAmbulanceDeviceMode(ambulanceDeviceMode === 'mobile' ? 'full' : 'mobile')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium cursor-pointer shadow-2xs"
          >
            <Smartphone className="w-3.5 h-3.5 text-slate-500" />
            <span>{ambulanceDeviceMode === 'mobile' ? 'Expand Full' : 'Mobile Bezel'}</span>
          </button>
        </div>
      </div>

      {/* Main Ambulance Device Frame */}
      <div className={`mx-auto transition-all duration-200 ${
        ambulanceDeviceMode === 'mobile'
          ? 'max-w-md bg-white rounded-2xl border-2 sm:border-4 border-slate-300 p-4 sm:p-5 shadow-lg space-y-4'
          : 'w-full bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4'
      }`}>
        {/* At the top: AMBULANCE Unit ID & Status */}
        <div className="flex items-center justify-between gap-2.5 border-b border-slate-200 pb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold font-mono tracking-tight text-slate-900 shrink-0">
                {isUnit07 ? 'AMBULANCE 07' : 'AMBULANCE 04'}
              </h2>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                {isUnit07 ? 'ALS UNIT' : 'BLS UNIT'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate" title={isUnit07 ? 'KA 01 AB 1234 · ALS Crew (Electronic City Depot)' : 'KA 04 E 2211 · BLS Crew (Bommanahalli Bay)'}>
              <span className="font-semibold text-slate-700">{isUnit07 ? 'KA 01 AB 1234' : 'KA 04 E 2211'}</span>
              <span className="hidden sm:inline">{isUnit07 ? ' · ALS Crew (Electronic City Depot)' : ' · BLS Crew (Bommanahalli Bay)'}</span>
              <span className="sm:hidden">{isUnit07 ? ' · Electronic City' : ' · Bommanahalli'}</span>
            </div>
          </div>

          <div className="text-right shrink-0 flex flex-col items-end">
            <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider font-semibold">Status</span>
            <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-mono font-bold border whitespace-nowrap shadow-2xs mt-0.5 ${unitStatusColor}`}>
              {unitStatus}
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CASE A: AMBULANCE 04 SCENARIOS (Citizen Report vs Standby) */}
        {/* ======================================================== */}
        {!isUnit07 && (
          <div className="space-y-4">
            {isCitizenDispatchedTo04 ? (
              /* CITIZEN EMERGENCY REPORT DISPATCHED TO AMBULANCE 04 */
              <div className="space-y-4">
                {/* Emergency Header */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-red-50 border border-red-200 text-red-700 font-mono text-[11px] font-bold flex items-center gap-1.5">
                      <Radio className="w-3 h-3 text-red-600 animate-pulse" />
                      <span>CITIZEN LIVE PHOTO DISPATCH</span>
                    </span>
                    <span className="font-mono text-xs text-slate-500 font-bold">
                      {citizenIncident.id}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Accident Reported by Citizen
                  </h3>
                  <div className="flex items-center gap-3 text-xs font-mono text-slate-600">
                    <span className="text-emerald-700 font-bold">1.8 km away</span>
                    <span>·</span>
                    <span className="text-amber-800 font-bold">Target arrival: 03:45</span>
                  </div>
                </div>

                {/* Actual Photo Clicked by Citizen */}
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center">
                  {citizenIncident.image ? (
                    <>
                      <img
                        src={citizenIncident.image}
                        alt="Original Citizen Captured Accident Scene"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-emerald-400 border border-white/20 flex items-center gap-1.5 backdrop-blur-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>ORIGINAL CITIZEN LIVE PHOTO</span>
                      </div>
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white border border-white/20">
                        GPS: {citizenIncident.coordinates.lat.toFixed(4)}° N, {citizenIncident.coordinates.lng.toFixed(4)}° E
                      </div>
                    </>
                  ) : (
                    <div className="p-6 text-center space-y-2 text-slate-400">
                      <Camera className="w-8 h-8 text-slate-500 mx-auto" />
                      <div className="text-xs font-mono text-slate-300">Awaiting Original Camera Snap from Bystander</div>
                    </div>
                  )}
                </div>

                {/* Actual Location Where Photo Was Clicked */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>ACTUAL LOCATION WHERE PHOTO WAS CLICKED</span>
                    </span>
                    <span className="font-mono text-[10px] text-emerald-700 font-bold">
                      GPS ±{citizenIncident.citizenReport?.accuracyMeters || 3.4}m
                    </span>
                  </div>

                  <p className="text-slate-800 text-xs font-medium">
                    {citizenIncident.location}
                  </p>

                  <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
                    <span>Coordinates: {citizenIncident.coordinates.lat.toFixed(5)}° N, {citizenIncident.coordinates.lng.toFixed(5)}° E</span>
                    <span className="text-blue-600 font-medium">Direct Route Calculated</span>
                  </div>
                </div>

                {/* Navigation Route Map */}
                <div className="relative h-32 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center">
                  <svg viewBox="0 0 300 120" className="w-full h-full">
                    <path d="M 20,60 Q 150,30 280,70" stroke="#cbd5e1" strokeWidth="6" fill="none" />
                    <path d="M 50,60 L 250,68" stroke="#2563eb" strokeWidth="2.5" strokeDasharray="5 3" fill="none" />
                    <circle cx="50" cy="60" r="6" fill="#059669" />
                    <circle cx="250" cy="68" r="8" fill="#dc2626" />
                    <text x="50" y="80" fill="#065f46" fontSize="9" fontWeight="bold" textAnchor="middle">Ambulance 04</text>
                    <text x="250" y="90" fill="#991b1b" fontSize="9" fontWeight="bold" textAnchor="middle">Photo Spot</text>
                  </svg>
                  <div className="absolute bottom-1 right-2 text-[10px] text-slate-500 font-mono">
                    Routing to Citizen GPS Spot
                  </div>
                </div>

                {/* Ambulance 04 Action Controls */}
                <div className="space-y-2 pt-1">
                  {!citizenIncident.response?.ambulance?.status?.toLowerCase().includes('en route') &&
                   !citizenIncident.status?.includes('arrived') &&
                   !citizenIncident.status?.includes('secured') && (
                    <button
                      onClick={ambulanceAcceptCitizenIncident}
                      className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-2xs text-center cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Navigation2 className="w-4 h-4 fill-white" />
                      <span>Accept Citizen Incident & Route to Photo GPS</span>
                    </button>
                  )}

                  {citizenIncident.response?.ambulance?.status?.toLowerCase().includes('en route') && (
                    <button
                      onClick={ambulanceArriveCitizenScene}
                      className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-2xs text-center cursor-pointer flex items-center justify-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Mark Arrived at Citizen GPS Scene</span>
                    </button>
                  )}

                  {citizenIncident.status?.includes('arrived') && (
                    <button
                      onClick={ambulancePickUpCitizenPatient}
                      className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-2xs text-center cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Patient Picked Up (Proceed to Hospital)</span>
                    </button>
                  )}

                  {citizenIncident.status?.includes('secured') && (
                    <div className="space-y-2">
                      <button
                        onClick={() => setHospitalModalOpen(true)}
                        className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-2xs text-center cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Building2 className="w-4 h-4" />
                        <span>Select Hospital & Transfer Patient</span>
                      </button>

                      <button
                        onClick={() => setHandoverModalOpen(true)}
                        className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Hospital Handover & Close Citizen Case</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* AMBULANCE 04 ACTIVE STANDBY */
              <div className="py-8 px-4 text-center space-y-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-500 shadow-2xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  Unit 04 on Active Standby
                </h3>

                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Ambulance 07 is currently assigned to highway crash RQ-1048. Ambulance 04 is the designated standby unit for live citizen-reported incidents.
                </p>

                <div className="pt-2">
                  <span className="inline-block px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-emerald-700 shadow-2xs">
                    Standby at Bommanahalli Bay · GPS Ready
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-2">
                  <p>When a citizen reports an accident with a live photo, this unit will immediately receive the exact verified coordinates.</p>
                  <button
                    onClick={citizenSubmitReport}
                    className="px-3.5 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Simulate Citizen Photo Report Dispatched to Ambulance 04
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* CASE B: AMBULANCE 07 — BEFORE ACCEPTING (New emergency)  */}
        {/* ======================================================== */}
        {isUnit07 && simulationStage <= 2 && (
          <div className="space-y-4">
            {/* New emergency Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-red-50 border border-red-200 text-red-700 font-mono text-[11px] font-bold">
                  NEW EMERGENCY
                </span>
                <span className="font-mono text-xs text-slate-500 font-bold">
                  {incident.id}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Severe accident
              </h3>
              <div className="flex items-center gap-4 text-xs font-mono text-slate-600">
                <span>2.8 km away</span>
                <span>·</span>
                <span className="text-amber-800 font-bold">Target arrival: 03:00</span>
              </div>
            </div>

            {/* Accident Image */}
            <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
              <img
                src={incident.image}
                alt="Accident scene capture"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white border border-white/20 flex items-center gap-1.5 backdrop-blur-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span>DEMO STREAM · CAM-07 NH-44 HIGHWAY</span>
              </div>
            </div>

            {/* Small Map Preview */}
            <div className="relative h-32 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 300 120" className="w-full h-full">
                <path d="M 20,60 Q 150,30 280,70" stroke="#cbd5e1" strokeWidth="6" fill="none" />
                <path d="M 50,60 L 250,68" stroke="#2563eb" strokeWidth="2.5" strokeDasharray="5 3" fill="none" />
                <circle cx="50" cy="60" r="6" fill="#059669" />
                <circle cx="250" cy="68" r="8" fill="#dc2626" />
                <text x="50" y="80" fill="#065f46" fontSize="9" fontWeight="bold" textAnchor="middle">Ambulance</text>
                <text x="250" y="90" fill="#991b1b" fontSize="9" fontWeight="bold" textAnchor="middle">Accident</text>
              </svg>
              <div className="absolute bottom-1 right-2 text-[10px] text-slate-500 font-mono">
                Route: NH 44 Expressway
              </div>
            </div>

            {/* Two Large Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={ambulanceAcceptIncident}
                className="py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-2xs text-center cursor-pointer"
              >
                Accept incident
              </button>
              <button
                onClick={ambulanceRejectIncident}
                className="py-3.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium text-sm transition-colors text-center cursor-pointer shadow-2xs"
              >
                Can't respond
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CASE C: AMBULANCE 07 — AFTER ACCEPTING (Full Workflow)   */}
        {/* ======================================================== */}
        {isUnit07 && simulationStage >= 3 && (
          <div className="space-y-4">
            {/* Header: Incident RQ-1048 & Responding status */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-slate-900">
                  Incident {incident.id}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] bg-red-50 text-red-700 font-mono font-bold border border-red-200">
                  Severe
                </span>
              </div>
              <p className="text-xs font-semibold text-blue-700">
                You're responding to this incident.
              </p>
            </div>

            {/* Simple Status Stepper */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono space-y-1.5">
              <div className={`flex items-center gap-2 ${simulationStage >= 3 ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                <span>{simulationStage >= 3 ? '✓' : '○'}</span>
                <span>Accepted</span>
              </div>
              <div className={`flex items-center gap-2 ${
                simulationStage === 6 ? 'text-blue-700 font-bold' : simulationStage > 6 ? 'text-emerald-700 font-medium' : 'text-slate-400'
              }`}>
                <span>{simulationStage > 6 ? '✓' : simulationStage === 6 ? '→' : '○'}</span>
                <span>En route</span>
              </div>
              <div className={`flex items-center gap-2 ${
                simulationStage === 7 ? 'text-blue-700 font-bold' : simulationStage > 7 ? 'text-emerald-700 font-medium' : 'text-slate-400'
              }`}>
                <span>{simulationStage > 7 ? '✓' : simulationStage === 7 ? '→' : '○'}</span>
                <span>Arrived on scene</span>
              </div>
              <div className={`flex items-center gap-2 ${
                simulationStage === 8 ? 'text-blue-700 font-bold' : simulationStage > 8 ? 'text-emerald-700 font-medium' : 'text-slate-400'
              }`}>
                <span>{simulationStage > 8 ? '✓' : simulationStage === 8 ? '→' : '○'}</span>
                <span>Patient picked up</span>
              </div>
              <div className={`flex items-center gap-2 ${
                simulationStage >= 9 ? 'text-emerald-700 font-medium' : 'text-slate-400'
              }`}>
                <span>{simulationStage >= 9 ? '✓' : '○'}</span>
                <span>Hospital selected</span>
              </div>
              <div className={`flex items-center gap-2 ${
                simulationStage >= 12
                  ? 'text-emerald-700 font-bold'
                  : simulationStage >= 9
                  ? 'text-blue-700 font-bold'
                  : 'text-slate-400'
              }`}>
                <span>{simulationStage >= 12 ? '✓' : simulationStage >= 9 ? '→' : '○'}</span>
                <span>
                  {simulationStage >= 12 ? 'Hospital handover confirmed · Case closed' : 'Hospital arrival & handover'}
                </span>
              </div>
            </div>

            {/* Destination Confirmed Card */}
            {simulationStage >= 9 && simulationStage <= 11 && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Destination confirmed</span>
                  </div>
                  {hospitalState.ambulanceArrived ? (
                    <span className="px-2 py-0.5 rounded-md bg-white border border-emerald-300 text-emerald-800 font-mono text-[10px] font-bold">
                      ARRIVED AT BAY
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-800 font-mono font-medium">
                      In-transit (ETA {selectedHospital.etaMinutes || 6} min)
                    </span>
                  )}
                </div>
                <div className="text-slate-900 font-bold text-sm">
                  {incident.location || 'Accident location'} → {selectedHospital.name}
                </div>
                <div className="text-[11px] text-slate-600 font-mono flex flex-wrap items-center justify-between gap-1 pt-0.5">
                  <span className="text-amber-900 font-medium">
                    Distance: {selectedHospital.distanceKm || 3.2} km · Green Corridor Active
                  </span>
                  <span className="text-emerald-800 font-medium">
                    GPS: {selectedHospital.coordinates.lat.toFixed(4)}° N, {selectedHospital.coordinates.lng.toFixed(4)}° E
                  </span>
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-emerald-200 text-[11px]">
                  <span className="text-slate-600 font-mono">
                    Trauma Bay 1 Reserved · {selectedHospital.traumaLevel?.split('&')[0]}
                  </span>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${incident.coordinates?.lat || 12.8452},${incident.coordinates?.lng || 77.6601}&destination=${selectedHospital.coordinates.lat},${selectedHospital.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-md bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-mono text-[10px] flex items-center gap-1 transition-colors font-medium"
                  >
                    <span>Google Maps Route</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            )}

            {/* Navigation Map */}
            <div className="relative h-44 sm:h-52 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 360 180" className="w-full h-full">
                <path d="M 30,140 Q 180,80 330,40" stroke="#cbd5e1" strokeWidth="16" fill="none" strokeLinecap="round" />
                <path d="M 30,140 Q 180,80 330,40" stroke="#94a3b8" strokeWidth="2" fill="none" strokeLinecap="round" />
                
                {/* Active path */}
                <path d="M 30,140 Q 180,80 330,40" stroke="#2563eb" strokeWidth="3" strokeDasharray="5 4" fill="none" />

                {/* Marker: Current ambulance location */}
                <g transform="translate(180, 85)">
                  <circle r="10" fill="#ffffff" stroke="#059669" strokeWidth="2" />
                  <rect x="-3" y="-3" width="6" height="6" fill="#059669" rx="1" />
                  <text x="0" y="20" fill="#065f46" fontSize="9" fontWeight="bold" textAnchor="middle">Ambulance 07</text>
                </g>

                {/* Marker: Target */}
                <g transform="translate(330, 40)">
                  <circle r="12" fill="rgba(239, 68, 68, 0.15)" stroke="#dc2626" strokeWidth="1" />
                  <circle r="6" fill="#dc2626" />
                  <text x="-15" y="-12" fill="#991b1b" fontSize="9" fontWeight="bold">NH 44 Crash</text>
                </g>
              </svg>

              <div className="absolute top-2 right-2 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs">
                Speed: 64 km/h · Siren ACTIVE
              </div>
            </div>

            {/* Action Buttons */}
            <div>
              {simulationStage <= 5 && (
                <button
                  onClick={ambulanceStartNavigation}
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-2xs text-center cursor-pointer flex items-center justify-center gap-2"
                >
                  <Navigation2 className="w-4 h-4 fill-white" />
                  <span>Start navigation</span>
                </button>
              )}

              {simulationStage === 6 && (
                <button
                  onClick={ambulanceMarkArrived}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-2xs text-center cursor-pointer flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Mark arrived on scene</span>
                </button>
              )}

              {simulationStage === 7 && (
                <button
                  onClick={ambulanceMarkPatientPickedUp}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-2xs text-center cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Patient picked up</span>
                </button>
              )}

              {simulationStage === 8 && (
                <button
                  onClick={() => setHospitalModalOpen(true)}
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-2xs text-center cursor-pointer flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Select hospital</span>
                </button>
              )}

              {simulationStage >= 9 && simulationStage <= 11 && (
                <div className="space-y-2">
                  <button
                    onClick={() => setHandoverModalOpen(true)}
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-2xs text-center cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Confirm Hospital Arrival & Handover (Close Case)</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {!hospitalState.ambulanceArrived && (
                      <button
                        onClick={ambulanceArriveHospital}
                        className="flex-1 py-2 px-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mark At Gate</span>
                      </button>
                    )}
                    <button
                      onClick={() => setHospitalModalOpen(true)}
                      className="flex-1 py-2 px-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Change Hospital</span>
                    </button>
                  </div>
                </div>
              )}

              {simulationStage >= 12 && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-2.5">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="font-mono font-bold text-xs text-emerald-900 uppercase tracking-wider">
                          Handover Confirmed & Case Closed
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-emerald-300 text-emerald-800 text-[10px] font-mono font-bold">
                        REC-2026-RQ1048-SJ
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-2.5 rounded-lg bg-white border border-emerald-200 space-y-0.5">
                        <span className="text-[10px] text-slate-500 block uppercase font-sans">Destination Bay</span>
                        <span className="text-slate-900 font-bold text-xs truncate block">St. John's Hospital</span>
                        <span className="text-[10px] text-emerald-700 block">Trauma Bay 1 (Red Zone)</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-emerald-200 space-y-0.5">
                        <span className="text-[10px] text-slate-500 block uppercase font-sans">Attending Lead</span>
                        <span className="text-slate-900 font-bold text-xs truncate block">Dr. A. Mathew, MD</span>
                        <span className="text-[10px] text-slate-600 block">2 Casualties Admitted</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-slate-600 pt-1 border-t border-emerald-200">
                      <span>Total Response: <strong className="text-slate-900">15m 44s</strong></span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Unit back on AVAILABLE</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => setHandoverModalOpen(true)}
                      className="py-2.5 px-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <FileCheck2 className="w-4 h-4 text-emerald-600" />
                      <span>View Signed Docket</span>
                    </button>

                    <button
                      onClick={ambulanceResetToAvailable}
                      className="py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset to Standby</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hospital Destination Selector Modal */}
      <HospitalSelectionModal
        isOpen={hospitalModalOpen}
        onClose={() => setHospitalModalOpen(false)}
      />

      {/* Hospital Arrival & Case Closure Handover Modal */}
      <HospitalHandoverModal
        isOpen={handoverModalOpen}
        onClose={() => setHandoverModalOpen(false)}
      />
    </div>
  )
}

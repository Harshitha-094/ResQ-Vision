import React, { useState } from 'react'
import {
  Navigation2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  MapPin,
  Check,
  Building2,
  Smartphone,
  Maximize2,
  Minimize2,
  Radio,
  XCircle,
  Truck,
  FileCheck2,
  RotateCcw,
  ShieldCheck
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
    incidents
  } = useEmergencyStore()

  const [hospitalModalOpen, setHospitalModalOpen] = useState(false)
  const [handoverModalOpen, setHandoverModalOpen] = useState(false)
  const isUnit07 = selectedAmbulanceUnitId === 'AMB-07'
  const isAcceptedBy07 = simulationStage >= 3
  const incident = incidents.find(i => i.id === 'RQ-1048') || incidents[0]
  const citizenIncident = incidents.find(i => i.id === 'RQ-1052')

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
  let unitStatusColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-800'

  if (isUnit07) {
    if (simulationStage === 2) {
      unitStatus = 'ALERT RECEIVED'
      unitStatusColor = 'text-red-400 bg-red-950/80 border-red-800'
    } else if (simulationStage >= 3 && simulationStage <= 5) {
      unitStatus = 'ACCEPTED'
      unitStatusColor = 'text-blue-400 bg-blue-950/80 border-blue-800'
    } else if (simulationStage === 6) {
      unitStatus = 'EN ROUTE'
      unitStatusColor = 'text-amber-400 bg-amber-950/80 border-amber-800'
    } else if (simulationStage === 7) {
      unitStatus = 'ARRIVED ON SCENE'
      unitStatusColor = 'text-emerald-400 bg-emerald-950/80 border-emerald-800'
    } else if (simulationStage === 8) {
      unitStatus = 'PATIENT SECURED'
      unitStatusColor = 'text-emerald-400 bg-emerald-950/80 border-emerald-800'
    } else if (simulationStage >= 9 && simulationStage <= 11) {
      unitStatus = hospitalState.ambulanceArrived ? 'ARRIVED AT HOSPITAL' : 'TRANSPORTING TO ER'
      unitStatusColor = hospitalState.ambulanceArrived
        ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800'
        : 'text-blue-400 bg-blue-950/80 border-blue-800'
    } else if (simulationStage >= 12) {
      unitStatus = 'CASE CLOSED · AVAILABLE'
      unitStatusColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-800'
    }
  } else {
    // Ambulance 04
    if (isCitizenDispatchedTo04) {
      if (citizenIncident.status?.includes('arrived')) {
        unitStatus = 'ARRIVED ON SCENE'
        unitStatusColor = 'text-emerald-400 bg-emerald-950/80 border-emerald-800'
      } else if (citizenIncident.status?.includes('secured')) {
        unitStatus = 'PATIENT SECURED'
        unitStatusColor = 'text-emerald-400 bg-emerald-950/80 border-emerald-800'
      } else if (citizenIncident.response?.ambulance?.status?.toLowerCase().includes('en route')) {
        unitStatus = 'EN ROUTE TO CITIZEN GPS'
        unitStatusColor = 'text-amber-400 bg-amber-950/80 border-amber-800'
      } else {
        unitStatus = 'CITIZEN DISPATCH ALERT'
        unitStatusColor = 'text-red-400 bg-red-950/80 border-red-800'
      }
    } else {
      unitStatus = isAcceptedBy07 ? 'STANDBY / AVAILABLE' : 'AVAILABLE'
    }
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Unit & Device Mode Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-200">Terminal Dispatch Node:</span>
          <div className="flex items-center rounded border border-slate-700 bg-slate-950 p-0.5">
            <button
              onClick={() => setSelectedAmbulanceUnitId('AMB-07')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                isUnit07 ? 'bg-slate-800 text-emerald-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ambulance 07 (Assigned AI Crash)
            </button>
            <button
              onClick={() => setSelectedAmbulanceUnitId('AMB-04')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
                !isUnit07 ? 'bg-slate-800 text-blue-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Ambulance 04 (Citizen Unit)</span>
              {isCitizenDispatchedTo04 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        <button
          onClick={() => setAmbulanceDeviceMode(ambulanceDeviceMode === 'mobile' ? 'full' : 'mobile')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white border border-slate-700 self-start sm:self-auto"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{ambulanceDeviceMode === 'mobile' ? 'Expand Full Width' : 'Phone Bezel View'}</span>
        </button>
      </div>

      {/* Main Ambulance Device Frame */}
      <div className={`mx-auto transition-all duration-200 ${
        ambulanceDeviceMode === 'mobile'
          ? 'max-w-md bg-slate-950 rounded-2xl border-4 border-slate-800 p-4 shadow-2xl space-y-4'
          : 'w-full bg-slate-950 rounded-xl border border-slate-800 p-5 shadow-lg space-y-4'
      }`}>
        {/* At the top: AMBULANCE Unit ID & Status */}
        <div className="flex items-center justify-between border-b border-slate-800/90 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold font-mono tracking-tight text-slate-100">
              {isUnit07 ? 'AMBULANCE 07' : 'AMBULANCE 04'}
            </h2>
            <div className="text-[11px] text-slate-400 font-mono">
              {isUnit07 ? 'KA 01 AB 1234 · ALS Crew (Electronic City Depot)' : 'KA 04 E 2211 · BLS Crew (Bommanahalli Bay)'}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Status</span>
            <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${unitStatusColor}`}>
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
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Emergency Header */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-red-950 border border-red-800 text-red-400 font-mono text-[11px] font-bold flex items-center gap-1.5">
                      <Radio className="w-3 h-3 text-red-400 animate-pulse" />
                      <span>CITIZEN LIVE PHOTO DISPATCH</span>
                    </span>
                    <span className="font-mono text-xs text-slate-400 font-bold">
                      {citizenIncident.id}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-100">
                    Accident Reported by Citizen
                  </h3>
                  <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
                    <span className="text-emerald-400 font-bold">1.8 km away</span>
                    <span>·</span>
                    <span className="text-amber-400 font-bold">Target arrival: 03:45</span>
                  </div>
                </div>

                {/* Actual Photo Clicked by Citizen */}
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-black">
                  <img
                    src={citizenIncident.image}
                    alt="Citizen captured accident scene"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white border border-slate-700 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>CITIZEN SMARTPHONE CAPTURE</span>
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/85 text-[10px] font-mono text-emerald-300 border border-emerald-900">
                    GPS LOCK: {citizenIncident.coordinates.lat.toFixed(4)}° N, {citizenIncident.coordinates.lng.toFixed(4)}° E
                  </div>
                </div>

                {/* Actual Location Where Photo Was Clicked */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="font-bold text-slate-100 flex items-center gap-1.5 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      <span>ACTUAL LOCATION WHERE PHOTO WAS CLICKED</span>
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400 font-bold">
                      GPS ±{citizenIncident.citizenReport?.accuracyMeters || 3.4}m
                    </span>
                  </div>

                  <p className="text-slate-200 text-xs font-medium">
                    {citizenIncident.location}
                  </p>

                  <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                    <span>Coordinates: {citizenIncident.coordinates.lat.toFixed(5)}° N, {citizenIncident.coordinates.lng.toFixed(5)}° E</span>
                    <span className="text-blue-400">Direct Route Calculated</span>
                  </div>
                </div>

                {/* Navigation Route Map */}
                <div className="relative h-32 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
                  <svg viewBox="0 0 300 120" className="w-full h-full">
                    <path d="M 20,60 Q 150,30 280,70" stroke="#334155" strokeWidth="6" fill="none" />
                    <path d="M 50,60 L 250,68" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4 3" fill="none" />
                    <circle cx="50" cy="60" r="6" fill="#10b981" />
                    <circle cx="250" cy="68" r="8" fill="#ef4444" />
                    <text x="50" y="80" fill="#6ee7b7" fontSize="9" fontWeight="bold" textAnchor="middle">Ambulance 04</text>
                    <text x="250" y="90" fill="#fca5a5" fontSize="9" fontWeight="bold" textAnchor="middle">Photo Spot</text>
                  </svg>
                  <div className="absolute bottom-1 right-2 text-[10px] text-slate-400 font-mono">
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
                      className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors shadow-lg shadow-red-950/40 text-center cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Navigation2 className="w-4 h-4 fill-white" />
                      <span>Accept Citizen Incident & Route to Photo GPS</span>
                    </button>
                  )}

                  {citizenIncident.response?.ambulance?.status?.toLowerCase().includes('en route') && (
                    <button
                      onClick={ambulanceArriveCitizenScene}
                      className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors shadow-lg shadow-emerald-950/40 text-center cursor-pointer flex items-center justify-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Mark Arrived at Citizen GPS Scene</span>
                    </button>
                  )}

                  {citizenIncident.status?.includes('arrived') && (
                    <button
                      onClick={ambulancePickUpCitizenPatient}
                      className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors shadow-lg shadow-emerald-950/40 text-center cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Patient Picked Up (Proceed to Hospital)</span>
                    </button>
                  )}

                  {citizenIncident.status?.includes('secured') && (
                    <div className="space-y-2">
                      <button
                        onClick={() => setHospitalModalOpen(true)}
                        className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors shadow-lg shadow-blue-950/40 text-center cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Building2 className="w-4 h-4" />
                        <span>Select Hospital & Transfer Patient</span>
                      </button>

                      <button
                        onClick={() => setHandoverModalOpen(true)}
                        className="w-full py-2.5 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
              <div className="py-8 px-4 text-center space-y-3 bg-slate-900/40 rounded-xl border border-slate-800">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>

                <h3 className="text-base font-bold text-slate-200">
                  Unit 04 on Active Standby
                </h3>

                <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                  Ambulance 07 is currently handling camera accident RQ-1048. Ambulance 04 is the designated rapid response unit for citizen-reported incidents.
                </p>

                <div className="pt-2">
                  <span className="inline-block px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-emerald-400">
                    Standby at Bommanahalli Bay · GPS Ready
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono space-y-2">
                  <p>When any citizen reports an accident with a photo, this unit will immediately receive the exact clicked coordinates.</p>
                  <button
                    onClick={citizenSubmitReport}
                    className="px-3 py-1.5 rounded-lg bg-blue-900/80 hover:bg-blue-800 border border-blue-700 text-blue-200 text-xs font-semibold transition-colors cursor-pointer"
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
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* New emergency Header as Specified */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-red-950 border border-red-800 text-red-400 font-mono text-[11px] font-bold">
                  NEW EMERGENCY
                </span>
                <span className="font-mono text-xs text-slate-400 font-bold">
                  {incident.id}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-100">
                Severe accident
              </h3>
              <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
                <span>2.8 km away</span>
                <span>·</span>
                <span className="text-amber-400 font-bold">Target arrival: 03:00</span>
              </div>
            </div>

            {/* Accident Image as Specified */}
            <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-800 bg-black">
              <img
                src={incident.image}
                alt="Accident scene capture"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                CAM-07 NH-44
              </div>
            </div>

            {/* Small Map Preview as Specified */}
            <div className="relative h-32 bg-slate-900 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 300 120" className="w-full h-full">
                <path d="M 20,60 Q 150,30 280,70" stroke="#334155" strokeWidth="6" fill="none" />
                <path d="M 50,60 L 250,68" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4 3" fill="none" />
                <circle cx="50" cy="60" r="6" fill="#10b981" />
                <circle cx="250" cy="68" r="8" fill="#ef4444" />
                <text x="50" y="80" fill="#6ee7b7" fontSize="9" fontWeight="bold" textAnchor="middle">Ambulance</text>
                <text x="250" y="90" fill="#fca5a5" fontSize="9" fontWeight="bold" textAnchor="middle">Accident</text>
              </svg>
              <div className="absolute bottom-1 right-2 text-[10px] text-slate-400 font-mono">
                Route: NH 44 Expressway
              </div>
            </div>

            {/* Two Large Buttons as Specified */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={ambulanceAcceptIncident}
                className="py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors shadow-lg shadow-emerald-950/40 text-center cursor-pointer"
              >
                Accept incident
              </button>
              <button
                onClick={ambulanceRejectIncident}
                className="py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-sm transition-colors text-center cursor-pointer"
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
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Header: Incident RQ-1048 & You're responding to this incident as Specified */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-slate-100">
                  Incident {incident.id}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-red-950 text-red-400 font-mono font-bold border border-red-900">
                  Severe
                </span>
              </div>
              <p className="text-xs font-semibold text-emerald-400">
                You're responding to this incident.
              </p>
            </div>

            {/* Simple Status Stepper as Specified */}
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-xs font-mono space-y-1.5">
              <div className={`flex items-center gap-2 ${simulationStage >= 3 ? 'text-emerald-400' : 'text-slate-400'}`}>
                <span>{simulationStage >= 3 ? '✓' : '○'}</span>
                <span>Accepted</span>
              </div>
              <div className={`flex items-center gap-2 ${
                simulationStage === 6 ? 'text-blue-400 font-bold' : simulationStage > 6 ? 'text-emerald-400' : 'text-slate-400'
              }`}>
                <span>{simulationStage > 6 ? '✓' : simulationStage === 6 ? '→' : '○'}</span>
                <span>En route</span>
              </div>
              <div className={`flex items-center gap-2 ${
                simulationStage === 7 ? 'text-blue-400 font-bold' : simulationStage > 7 ? 'text-emerald-400' : 'text-slate-400'
              }`}>
                <span>{simulationStage > 7 ? '✓' : simulationStage === 7 ? '→' : '○'}</span>
                <span>Arrived on scene</span>
              </div>
              <div className={`flex items-center gap-2 ${
                simulationStage === 8 ? 'text-blue-400 font-bold' : simulationStage > 8 ? 'text-emerald-400' : 'text-slate-400'
              }`}>
                <span>{simulationStage > 8 ? '✓' : simulationStage === 8 ? '→' : '○'}</span>
                <span>Patient picked up</span>
              </div>
              <div className={`flex items-center gap-2 ${
                simulationStage >= 9 ? 'text-emerald-400' : 'text-slate-400'
              }`}>
                <span>{simulationStage >= 9 ? '✓' : '○'}</span>
                <span>Hospital selected</span>
              </div>
              <div className={`flex items-center gap-2 ${
                simulationStage >= 12
                  ? 'text-emerald-400 font-bold'
                  : simulationStage >= 9
                  ? 'text-blue-400 font-bold'
                  : 'text-slate-400'
              }`}>
                <span>{simulationStage >= 12 ? '✓' : simulationStage >= 9 ? '→' : '○'}</span>
                <span>
                  {simulationStage >= 12 ? 'Hospital handover confirmed · Case closed' : 'Hospital arrival & handover'}
                </span>
              </div>
            </div>

            {/* Destination Confirmed Card (Shown after hospital selected) */}
            {simulationStage >= 9 && simulationStage <= 11 && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/80 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Destination confirmed</span>
                  </div>
                  {hospitalState.ambulanceArrived ? (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-900/60 border border-emerald-700 text-emerald-300 font-mono text-[10px] font-bold">
                      ARRIVED AT BAY
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 font-mono">
                      In-transit (ETA 06 min)
                    </span>
                  )}
                </div>
                <div className="text-slate-200 font-bold">
                  Accident location → St. John's Hospital
                </div>
                <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
                  <span>Route via Hosur Rd Expressway · 3.2 km</span>
                  <span className="text-emerald-400 font-semibold">Trauma Bay 1 Reserved</span>
                </div>
              </div>
            )}

            {/* Large Navigation Map as Specified */}
            <div className="relative h-44 sm:h-52 bg-slate-900 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 360 180" className="w-full h-full">
                {/* Roads */}
                <path d="M 30,140 Q 180,80 330,40" stroke="#1e293b" strokeWidth="16" fill="none" strokeLinecap="round" />
                <path d="M 30,140 Q 180,80 330,40" stroke="#334155" strokeWidth="3" fill="none" strokeLinecap="round" />
                
                {/* Active path */}
                <path d="M 30,140 Q 180,80 330,40" stroke="#3b82f6" strokeWidth="3" strokeDasharray="5 4" fill="none" />

                {/* Marker: Current ambulance location */}
                <g transform="translate(180, 85)">
                  <circle r="10" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
                  <rect x="-3" y="-3" width="6" height="6" fill="#10b981" rx="1" />
                  <text x="0" y="20" fill="#6ee7b7" fontSize="9" fontWeight="bold" textAnchor="middle">Ambulance 07</text>
                </g>

                {/* Marker: Target */}
                <g transform="translate(330, 40)">
                  <circle r="12" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="1" />
                  <circle r="6" fill="#ef4444" />
                  <text x="-15" y="-12" fill="#fca5a5" fontSize="9" fontWeight="bold">NH 44 Crash</text>
                </g>
              </svg>

              <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/80 border border-slate-800 text-[11px] font-mono text-slate-200">
                Speed: 64 km/h · Siren ACTIVE
              </div>
            </div>

            {/* Large Primary Action Button as Specified */}
            <div>
              {simulationStage <= 5 && (
                <button
                  onClick={ambulanceStartNavigation}
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors shadow-lg shadow-blue-950/40 text-center cursor-pointer flex items-center justify-center gap-2"
                >
                  <Navigation2 className="w-4 h-4 fill-white" />
                  <span>Start navigation</span>
                </button>
              )}

              {simulationStage === 6 && (
                <button
                  onClick={ambulanceMarkArrived}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors shadow-lg shadow-emerald-950/40 text-center cursor-pointer flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Mark arrived on scene</span>
                </button>
              )}

              {simulationStage === 7 && (
                <button
                  onClick={ambulanceMarkPatientPickedUp}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors shadow-lg shadow-emerald-950/40 text-center cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Patient picked up</span>
                </button>
              )}

              {simulationStage === 8 && (
                <button
                  onClick={() => setHospitalModalOpen(true)}
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors shadow-lg shadow-blue-950/40 text-center cursor-pointer flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Select hospital</span>
                </button>
              )}

              {simulationStage >= 9 && simulationStage <= 11 && (
                <div className="space-y-2">
                  <button
                    onClick={() => setHandoverModalOpen(true)}
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors shadow-lg shadow-emerald-950/40 text-center cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Confirm Hospital Arrival & Handover (Close Case)</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {!hospitalState.ambulanceArrived && (
                      <button
                        onClick={ambulanceArriveHospital}
                        className="flex-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Mark At Gate</span>
                      </button>
                    )}
                    <button
                      onClick={() => setHospitalModalOpen(true)}
                      className="flex-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Change Hospital</span>
                    </button>
                  </div>
                </div>
              )}

              {simulationStage >= 12 && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-800/70 space-y-3 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="font-mono font-bold text-xs text-emerald-300 uppercase tracking-wider">
                          Handover Confirmed & Case Closed
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 text-[10px] font-mono font-bold">
                        REC-2026-RQ1048-SJ
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-0.5">
                        <span className="text-[10px] text-slate-400 block uppercase">Destination Bay</span>
                        <span className="text-slate-100 font-bold text-xs truncate block">St. John's Hospital</span>
                        <span className="text-[10px] text-emerald-400 block">Trauma Bay 1 (Red Zone)</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-0.5">
                        <span className="text-[10px] text-slate-400 block uppercase">Attending Lead</span>
                        <span className="text-slate-100 font-bold text-xs truncate block">Dr. A. Mathew, MD</span>
                        <span className="text-[10px] text-slate-400 block">2 Casualties Admitted</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 pt-1 border-t border-slate-800/80">
                      <span>Total Response: <strong className="text-slate-100">15m 44s</strong></span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Unit back on AVAILABLE</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => setHandoverModalOpen(true)}
                      className="py-3 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <FileCheck2 className="w-4 h-4 text-emerald-400" />
                      <span>View Signed Docket</span>
                    </button>

                    <button
                      onClick={ambulanceResetToAvailable}
                      className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-1.5 cursor-pointer"
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

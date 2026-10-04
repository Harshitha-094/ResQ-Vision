import React from 'react'
import {
  Activity,
  AlertTriangle,
  Radio,
  Sliders,
  CheckCircle2,
  Car,
  Clock,
  Shield,
  Ambulance,
  Navigation,
  MapPin,
  Camera,
  ExternalLink
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'

export default function TrafficView() {
  const {
    trafficState,
    toggleVmsAdvisory,
    toggleSignalCorridor,
    incidents,
    setActiveView,
    setSelectedAmbulanceUnitId
  } = useEmergencyStore()

  const citizenIncident = incidents.find((i) => i.id === 'RQ-1052')
  const isCitizenReportActive = Boolean(
    citizenIncident && (
      citizenIncident.source?.includes('CITIZEN') ||
      citizenIncident.citizenReport?.photoReceived ||
      citizenIncident.status?.toLowerCase().includes('citizen')
    )
  )

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span>Traffic Authority & Corridor Control</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Bengaluru Traffic Police (BTP) & National Highway Traffic Management System (HTMS)
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Adaptive Signal Grid Synchronized</span>
        </div>
      </div>

      {/* Main Monitoring Cards */}
      <div className="space-y-4">
        {/* CITIZEN-REPORTED INCIDENT CORRIDOR CARD (If reported or active) */}
        {isCitizenReportActive && (
          <div className="p-5 rounded-xl bg-white border border-blue-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-mono text-xs font-semibold flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-blue-600 animate-pulse" />
                  <span>CITIZEN REPORTED CORRIDOR · RQ-1052</span>
                </span>
                <span className="text-xs text-slate-600 font-medium">
                  {citizenIncident.shortLocation || 'Electronic City'} Sector
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-mono text-xs font-semibold">
                  Traffic Impact: Moderate
                </span>
              </div>
            </div>

            {/* Fetched GPS Coordinates & Photo Reference */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>Actual Photo Spot</span>
                </span>
                <p className="text-xs text-slate-800 font-medium line-clamp-2">
                  {citizenIncident.location}
                </p>
                <p className="text-[11px] text-emerald-700 font-mono font-medium">
                  GPS: {citizenIncident.coordinates.lat.toFixed(4)}° N, {citizenIncident.coordinates.lng.toFixed(4)}° E (±{citizenIncident.citizenReport?.accuracyMeters || 3.4}m)
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold flex items-center gap-1">
                  <Ambulance className="w-3.5 h-3.5 text-blue-600" />
                  <span>Assigned Rescue Routing</span>
                </span>
                <div className="text-slate-800 font-semibold text-xs">
                  Ambulance 04 (KA 04 E 2211)
                </div>
                <p className="text-[11px] text-slate-500 font-mono">
                  Status: {citizenIncident.response?.ambulance?.status || 'Dispatched'} · ETA 03:45
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-slate-700" />
                  <span>Police Enforcement</span>
                </span>
                <div className="text-slate-800 font-semibold text-xs">
                  BTP Patrol 11 (SI V. Rao)
                </div>
                <p className="text-[11px] text-slate-500 font-mono">
                  En route to secure photo location perimeter
                </p>
              </div>
            </div>

            {/* Traffic Signal Preemption & VMS Warning for Citizen Location */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                <span className="text-slate-500 font-medium">Target VMS Display:</span>
                <span className="font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium text-[11px]">
                  CAUTION: ACCIDENT AT {citizenIncident.shortLocation.toUpperCase()} — AMBULANCE & PATROL ROUTED
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => {
                    setSelectedAmbulanceUnitId('AMB-04')
                    setActiveView('ambulances')
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <Ambulance className="w-3.5 h-3.5 text-blue-600" />
                  <span>Inspect Ambulance 04</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Primary Alert Corridor: NH 44 (AI Camera Detected) */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="text-base font-bold text-slate-900">
                NH 44 (Bengaluru–Hosur Highway)
              </div>
              <div className="text-xs font-medium text-red-600 mt-0.5">
                Accident detected at KM 42.4 (Camera CAM-07 · Lane #2 Blocked)
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 font-mono text-xs font-semibold">
                Traffic impact: High
              </span>
            </div>
          </div>

          {/* Operational Status Points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold">Ambulance Movement</span>
              <div className="font-semibold text-emerald-700 flex items-center gap-1.5">
                <Ambulance className="w-3.5 h-3.5" />
                <span>Emergency vehicles approaching</span>
              </div>
              <p className="text-[11px] text-slate-500">Ambulance 07 currently 2.8 km away · ETA 02:14</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold">Police Response</span>
              <div className="font-semibold text-amber-700 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Highway Interceptor 04</span>
              </div>
              <p className="text-[11px] text-slate-500">Arriving to set up traffic diversion cones</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold">Corridor Flow</span>
              <div className="font-semibold text-slate-800">
                Average Speed: 18 km/h
              </div>
              <p className="text-[11px] text-slate-500">Heavy congestion behind incident site</p>
            </div>
          </div>

          {/* Traffic Operational Controls */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
              <span className="text-slate-500 font-medium">Variable Message Signs (VMS):</span>
              <span className="font-mono text-slate-800 font-medium text-[11px] bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                {trafficState.vmsAdvisoryActive ? trafficState.vmsMessage : 'Standard Traffic Speed Signs'}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={toggleVmsAdvisory}
                className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-colors border cursor-pointer ${
                  trafficState.vmsAdvisoryActive
                    ? 'bg-amber-600 border-amber-600 text-white'
                    : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 shadow-2xs'
                }`}
              >
                {trafficState.vmsAdvisoryActive ? 'Disable VMS Warning' : 'Broadcast VMS Warning'}
              </button>

              <button
                onClick={toggleSignalCorridor}
                className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-colors border cursor-pointer ${
                  trafficState.signalCorridorActive
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 border-blue-600 text-white shadow-2xs'
                }`}
              >
                {trafficState.signalCorridorActive ? 'Signal Priority ACTIVE' : 'Enable Signal Priority'}
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Corridors: Tumkur Road & Outer Ring Road */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Tumkur Road */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Tumkur Road (NH 48)</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-mono font-semibold border border-amber-200">
                Traffic impact: Moderate
              </span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              Accident reported at Yeshwanthpur Junction. Ambulance 12 en route with patient to Victoria Hospital. Left turn restricted.
            </p>
            <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-100">
              Corridor Status: Diversion Active (Flow: 32 km/h)
            </div>
          </div>

          {/* Outer Ring Road */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Outer Ring Road (Silk Board)</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold border border-slate-200">
                Traffic impact: Low
              </span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              Minor two-wheeler sideswipe on shoulder. BTP Patrol 11 on scene. Normal underpass traffic flow maintained.
            </p>
            <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-100">
              Corridor Status: Normal Monitoring (Flow: 45 km/h)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

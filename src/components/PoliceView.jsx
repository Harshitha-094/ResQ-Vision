import React, { useState } from 'react'
import {
  Shield,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Clock,
  Car,
  FileText,
  UserCheck,
  Radio,
  Camera,
  Navigation,
  ExternalLink
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'

export default function PoliceView() {
  const {
    policeState,
    policeCitizenState,
    policeAcknowledge,
    policeDispatch,
    policeMarkArrived,
    policeAcknowledgeCitizen,
    policeDispatchCitizen,
    policeArriveCitizen,
    incidents,
    setActiveView,
    setSelectedIncidentId
  } = useEmergencyStore()

  const [activeIncidentId, setActiveIncidentId] = useState('RQ-1048')

  const incident1048 = incidents.find((i) => i.id === 'RQ-1048') || incidents[0]
  const incident1052 = incidents.find((i) => i.id === 'RQ-1052')

  const isCitizenIncident = activeIncidentId === 'RQ-1052'
  const incident = isCitizenIncident ? (incident1052 || incident1048) : incident1048
  const currentStatus = isCitizenIncident
    ? (policeCitizenState?.status || 'Dispatched')
    : (policeState.status || 'Dispatched')

  const isCitizenReportReceived = Boolean(
    incident1052 && (
      incident1052.source?.includes('CITIZEN') ||
      incident1052.citizenReport?.photoReceived ||
      incident1052.status?.toLowerCase().includes('citizen')
    )
  )

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header: Police Response */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-300" />
            <span>Police Response Grid</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Karnataka State Police / Highway Patrol & Bengaluru Traffic Police (BTP)
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Section 134A Motor Vehicles Act Enforced</span>
        </div>
      </div>

      {/* Incident Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300 font-mono">Select Active Call:</span>
          <div className="flex items-center rounded border border-slate-700 bg-slate-950 p-0.5">
            <button
              onClick={() => setActiveIncidentId('RQ-1048')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                !isCitizenIncident
                  ? 'bg-slate-800 text-amber-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              RQ-1048 (NH-44 AI Cam)
            </button>
            <button
              onClick={() => setActiveIncidentId('RQ-1052')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
                isCitizenIncident
                  ? 'bg-slate-800 text-blue-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>RQ-1052 (Citizen Photo Report)</span>
              {isCitizenReportReceived && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {isCitizenIncident && (
          <span className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800 text-blue-300 text-[10px] font-mono">
            GPS Locked from Citizen Device
          </span>
        )}
      </div>

      {/* Main Container */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
        {/* Banner communicating police response is MANDATORY under Section 134A */}
        <div className="p-3.5 rounded-lg bg-red-950/30 border border-red-800/80 text-xs space-y-1">
          <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              {isCitizenIncident
                ? 'Section 134A Mandatory Citizen Response'
                : 'Mandatory highway response'}
            </span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {isCitizenIncident
              ? 'Under Section 134A of the Motor Vehicles Act (Good Samaritan Protections), police patrol dispatch is mandatory upon receiving citizen accident telemetry. Patrol units must navigate directly to the exact photo coordinates to secure injured persons and safeguard evidence.'
              : 'Police dispatch is legally mandatory for reported vehicular collisions under NHAI Highway Safety and Motor Vehicles Act protocol. Response does not depend on ambulance acceptance.'}
          </p>
        </div>

        {/* Incident Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Incident</span>
            <span className="font-bold text-base text-slate-100">{incident.id}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {isCitizenIncident ? 'Citizen Photo Telemetry' : 'AI CCTV Verified'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Location</span>
            <span className="font-bold text-slate-200 text-sm truncate block">
              {incident.shortLocation || 'NH 44'}
            </span>
            <span className="text-[10px] text-emerald-400 block mt-0.5 truncate">
              {incident.coordinates ? `${incident.coordinates.lat.toFixed(4)}°, ${incident.coordinates.lng.toFixed(4)}°` : 'KM 42.4'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Severity</span>
            <span className={`font-bold text-base ${isCitizenIncident ? 'text-amber-400' : 'text-red-400'}`}>
              {incident.severity || 'Moderate'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {incident.vehicles || 'Vehicles Involved'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Patrol Status</span>
            <span className="font-bold text-amber-400 text-base">{currentStatus}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {isCitizenIncident ? 'Unit: BTP Patrol 11' : 'Unit: Interceptor 04'}
            </span>
          </div>
        </div>

        {/* If Citizen Incident: Prominently Show the Clicked Photo and Fetched Location */}
        {isCitizenIncident && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            {/* Clicked Photo */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-blue-400" />
                <span>Actual Photo Clicked by Citizen:</span>
              </span>
              <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-800 bg-black flex items-center justify-center">
                {incident.image ? (
                  <>
                    <img
                      src={incident.image}
                      alt="Citizen road report"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/85 text-[10px] font-mono text-emerald-400 border border-emerald-800 flex items-center gap-1 backdrop-blur-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>ORIGINAL CITIZEN LIVE PHOTO</span>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center space-y-1 text-slate-400">
                    <Camera className="w-6 h-6 text-slate-500 mx-auto animate-pulse" />
                    <div className="text-[11px] font-mono text-slate-300">Awaiting Live Photo Capture from Citizen</div>
                    <div className="text-[10px] text-slate-500">Only original bystander camera image will appear here.</div>
                  </div>
                )}
              </div>
            </div>

            {/* Actual Fetched Location Details */}
            <div className="space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>Actual Location Fetched from Click:</span>
                </span>
                <p className="text-xs text-slate-200 font-medium leading-relaxed bg-slate-900/80 p-2.5 rounded border border-slate-800">
                  {incident.location}
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded bg-slate-900 border border-slate-850">
                    <span className="text-[10px] text-slate-400 block">GPS Coordinates:</span>
                    <span className="text-slate-100 font-bold">
                      {incident.coordinates ? `${incident.coordinates.lat.toFixed(5)}° N, ${incident.coordinates.lng.toFixed(5)}° E` : '--'}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-850">
                    <span className="text-[10px] text-slate-400 block">Fix Accuracy:</span>
                    <span className="text-emerald-400 font-bold">
                      ±{incident.citizenReport?.accuracyMeters || 3.4}m (Satellite Lock)
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-850 pt-2">
                <span>Co-dispatched: <strong>Ambulance 04</strong></span>
                <span className="text-emerald-400">Target ETA: 03:45</span>
              </div>
            </div>
          </div>
        )}

        {/* Patrol Unit Assignment Details */}
        <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-2">
          <div className="font-semibold text-slate-300 text-[11px] uppercase font-mono tracking-wider flex items-center justify-between">
            <span>Assigned Enforcement Details</span>
            <span className="text-slate-400">
              Unit ID: {isCitizenIncident ? 'POL-11' : 'POL-04'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300 text-[11px]">
            <div>
              • <strong className="text-slate-200">Vehicle:</strong>{' '}
              {isCitizenIncident ? 'BTP Central Patrol 11 (KA 01 G 5511)' : 'Highway Interceptor 04 (KA 42 G 112)'}
            </div>
            <div>
              • <strong className="text-slate-200">Officer In-Charge:</strong>{' '}
              {isCitizenIncident ? 'Sub-Inspector V. Rao' : 'Sub-Inspector M. Kumar'}
            </div>
            <div>
              • <strong className="text-slate-200">Docket:</strong>{' '}
              {isCitizenIncident ? 'FIR-2026-BLR-01052' : 'FIR-2026-NH44-01048'}
            </div>
          </div>
        </div>

        {/* Actions as Specified: Acknowledge, Dispatched, Arrived */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Current Action State: <strong className="text-slate-200">{currentStatus}</strong>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
            <button
              onClick={isCitizenIncident ? policeAcknowledgeCitizen : policeAcknowledge}
              className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors border cursor-pointer ${
                currentStatus === 'Alert received'
                  ? 'bg-amber-600 text-white border-amber-500 font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              Acknowledge
            </button>

            <button
              onClick={isCitizenIncident ? policeDispatchCitizen : policeDispatch}
              className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors border cursor-pointer ${
                currentStatus === 'Dispatched' || currentStatus?.includes('Dispatched')
                  ? 'bg-amber-600 text-white border-amber-500 font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              Dispatched
            </button>

            <button
              onClick={isCitizenIncident ? policeArriveCitizen : policeMarkArrived}
              className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors border cursor-pointer ${
                currentStatus === 'Arrived'
                  ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              Arrived
            </button>
          </div>
        </div>

        {/* Arrived Scene Security Notice */}
        {currentStatus === 'Arrived' && (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-xs text-slate-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isCitizenIncident
                ? 'BTP Patrol 11 is on scene at the citizen-reported GPS location. Traffic diversion established and perimeter secured for Ambulance 04.'
                : 'Highway Interceptor 04 is on scene. Traffic diversion cones deployed on Lane 2. Scene secured for ambulance extrication.'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import {
  Shield,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Camera
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
    incidents
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
    <div className="space-y-4 max-w-4xl mx-auto text-slate-800">
      {/* Header: Police Response */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-700" />
            <span>Police Response Grid</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Karnataka State Police / Highway Patrol & Bengaluru Traffic Police (BTP)
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Section 134A Motor Vehicles Act Enforced</span>
        </div>
      </div>

      {/* Incident Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Active Incident:</span>
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              onClick={() => setActiveIncidentId('RQ-1048')}
              className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                !isCitizenIncident
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              RQ-1048 (NH-44 AI Cam)
            </button>
            <button
              onClick={() => setActiveIncidentId('RQ-1052')}
              className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                isCitizenIncident
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>RQ-1052 (Citizen Report)</span>
              {isCitizenReportReceived && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {isCitizenIncident && (
          <span className="px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono">
            GPS Locked from Citizen Device
          </span>
        )}
      </div>

      {/* Main Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        {/* Banner communicating police response is MANDATORY under Section 134A */}
        <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-xs space-y-1 text-blue-900">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider font-mono text-blue-800">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              {isCitizenIncident
                ? 'Section 134A Mandatory Citizen Response'
                : 'Mandatory highway response'}
            </span>
          </div>
          <p className="text-slate-700 text-xs leading-relaxed">
            {isCitizenIncident
              ? 'Under Section 134A of the Motor Vehicles Act (Good Samaritan Protections), police patrol dispatch is mandatory upon receiving citizen accident telemetry. Patrol units navigate directly to the exact photo coordinates to secure injured persons and safeguard evidence.'
              : 'Police dispatch is legally mandatory for reported vehicular collisions under NHAI Highway Safety and Motor Vehicles Act protocol. Response does not depend on ambulance acceptance.'}
          </p>
        </div>

        {/* Incident Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase font-sans">Incident</span>
            <span className="font-bold text-base text-slate-900">{incident.id}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5 font-sans">
              {isCitizenIncident ? 'Citizen Telemetry' : 'AI CCTV Verified'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase font-sans">Location</span>
            <span className="font-bold text-slate-900 text-sm truncate block font-sans">
              {incident.shortLocation || 'NH 44'}
            </span>
            <span className="text-[11px] text-emerald-700 block mt-0.5 truncate font-medium">
              {incident.coordinates ? `${incident.coordinates.lat.toFixed(4)}°, ${incident.coordinates.lng.toFixed(4)}°` : 'KM 42.4'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase font-sans">Severity</span>
            <span className={`font-bold text-base ${isCitizenIncident ? 'text-amber-800' : 'text-red-700'}`}>
              {incident.severity || 'Moderate'}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5 font-sans">
              {incident.vehicles || 'Vehicles Involved'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase font-sans">Patrol Status</span>
            <span className="font-bold text-amber-800 text-base">{currentStatus}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5 font-sans">
              {isCitizenIncident ? 'Unit: BTP Patrol 11' : 'Unit: Interceptor 04'}
            </span>
          </div>
        </div>

        {/* If Citizen Incident: Prominently Show the Clicked Photo and Fetched Location */}
        {isCitizenIncident && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
            {/* Clicked Photo */}
            <div className="space-y-1.5">
              <span className="text-xs uppercase font-mono text-slate-600 block font-semibold flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-blue-600" />
                <span>Actual Photo Clicked by Citizen:</span>
              </span>
              <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center">
                {incident.image ? (
                  <>
                    <img
                      src={incident.image}
                      alt="Citizen road report"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-emerald-400 border border-white/20 flex items-center gap-1 backdrop-blur-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>ORIGINAL CITIZEN LIVE PHOTO</span>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center space-y-1 text-slate-400">
                    <Camera className="w-6 h-6 text-slate-500 mx-auto" />
                    <div className="text-xs font-mono text-slate-300">Awaiting Live Photo Capture from Citizen</div>
                  </div>
                )}
              </div>
            </div>

            {/* Actual Fetched Location Details */}
            <div className="space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5">
                <span className="text-xs uppercase font-mono text-slate-600 block font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Actual Location Fetched from Click:</span>
                </span>
                <p className="text-xs text-slate-800 font-medium leading-relaxed bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  {incident.location}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 block font-sans">GPS Coordinates:</span>
                    <span className="text-slate-900 font-bold">
                      {incident.coordinates ? `${incident.coordinates.lat.toFixed(5)}° N, ${incident.coordinates.lng.toFixed(5)}° E` : '--'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 block font-sans">Fix Accuracy:</span>
                    <span className="text-emerald-700 font-bold">
                      ±{incident.citizenReport?.accuracyMeters || 3.4}m
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-600 font-mono flex items-center justify-between border-t border-slate-200 pt-2">
                <span>Co-dispatched: <strong className="text-slate-900 font-sans">Ambulance 04</strong></span>
                <span className="text-emerald-700 font-semibold">ETA: 03:45</span>
              </div>
            </div>
          </div>
        )}

        {/* Patrol Unit Assignment Details */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="font-semibold text-slate-700 text-xs uppercase font-mono tracking-wider flex items-center justify-between">
            <span>Assigned Enforcement Details</span>
            <span className="text-slate-500">
              Unit ID: {isCitizenIncident ? 'POL-11' : 'POL-04'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700 text-xs">
            <div>
              • <strong className="text-slate-900">Vehicle:</strong>{' '}
              {isCitizenIncident ? 'BTP Central Patrol 11 (KA 01 G 5511)' : 'Highway Interceptor 04 (KA 42 G 112)'}
            </div>
            <div>
              • <strong className="text-slate-900">Officer In-Charge:</strong>{' '}
              {isCitizenIncident ? 'Sub-Inspector V. Rao' : 'Sub-Inspector M. Kumar'}
            </div>
            <div>
              • <strong className="text-slate-900">Docket:</strong>{' '}
              {isCitizenIncident ? 'FIR-2026-BLR-01052' : 'FIR-2026-NH44-01048'}
            </div>
          </div>
        </div>

        {/* Actions as Specified: Acknowledge, Dispatched, Arrived */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Current Action State: <strong className="text-slate-900">{currentStatus}</strong>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
            <button
              onClick={isCitizenIncident ? policeAcknowledgeCitizen : policeAcknowledge}
              className={`px-4 py-2 rounded-lg font-medium text-xs transition-colors border cursor-pointer ${
                currentStatus === 'Alert received'
                  ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
              }`}
            >
              Acknowledge
            </button>

            <button
              onClick={isCitizenIncident ? policeDispatchCitizen : policeDispatch}
              className={`px-4 py-2 rounded-lg font-medium text-xs transition-colors border cursor-pointer ${
                currentStatus === 'Dispatched' || currentStatus?.includes('Dispatched')
                  ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
              }`}
            >
              Dispatched
            </button>

            <button
              onClick={isCitizenIncident ? policeArriveCitizen : policeMarkArrived}
              className={`px-4 py-2 rounded-lg font-medium text-xs transition-colors border cursor-pointer ${
                currentStatus === 'Arrived'
                  ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-2xs'
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
              }`}
            >
              Arrived
            </button>
          </div>
        </div>

        {/* Arrived Scene Security Notice */}
        {currentStatus === 'Arrived' && (
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
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

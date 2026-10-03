import React from 'react'
import {
  Shield,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Clock,
  Car,
  FileText,
  UserCheck,
  Radio
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'

export default function PoliceView() {
  const {
    policeState,
    policeAcknowledge,
    policeDispatch,
    policeMarkArrived,
    incidents
  } = useEmergencyStore()

  const incident = incidents.find(i => i.id === 'RQ-1048') || incidents[0]
  const currentStatus = policeState.status || 'Dispatched'

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header as Specified: Police Response */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-300" />
            <span>Police Response</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Karnataka State Police / Highway Patrol Dispatch Grid
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Section 134A Motor Vehicles Act Enforced</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
        {/* Banner communicating police response is MANDATORY as Specified */}
        <div className="p-3.5 rounded-lg bg-red-950/30 border border-red-800/80 text-xs space-y-1">
          <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Mandatory response</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Police dispatch is legally mandatory for reported vehicular collisions under NHAI Highway Safety and Motor Vehicles Act protocol. Response does not depend on ambulance acceptance.
          </p>
        </div>

        {/* Incident Details as Specified */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Incident</span>
            <span className="font-bold text-base text-slate-100">{incident.id}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">AI CCTV Verified</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Location</span>
            <span className="font-bold text-slate-200 text-sm">NH 44 · 2.8 km</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">KM 42.4 Ramanagara Bypass</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Severity</span>
            <span className="font-bold text-red-400 text-base">Severe</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">2 Vehicles Involved</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Status</span>
            <span className="font-bold text-amber-400 text-base">{currentStatus}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Unit: Interceptor 04</span>
          </div>
        </div>

        {/* Patrol Unit Assignment Details */}
        <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-2">
          <div className="font-semibold text-slate-300 text-[11px] uppercase font-mono tracking-wider flex items-center justify-between">
            <span>Assigned Enforcement Details</span>
            <span className="text-slate-400">Unit ID: POL-04</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300 text-[11px]">
            <div>• <strong className="text-slate-200">Vehicle:</strong> Highway Interceptor 04 (KA 42 G 112)</div>
            <div>• <strong className="text-slate-200">Officer In-Charge:</strong> Sub-Inspector M. Kumar</div>
            <div>• <strong className="text-slate-200">Docket:</strong> FIR-2026-NH44-01048</div>
          </div>
        </div>

        {/* Actions as Specified: Acknowledge, Dispatched, Arrived */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Current Action State: <strong className="text-slate-200">{currentStatus}</strong>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
            <button
              onClick={policeAcknowledge}
              className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors border ${
                currentStatus === 'Alert received'
                  ? 'bg-amber-600 text-white border-amber-500 font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              Acknowledge
            </button>

            <button
              onClick={policeDispatch}
              className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors border ${
                currentStatus === 'Dispatched'
                  ? 'bg-amber-600 text-white border-amber-500 font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              Dispatched
            </button>

            <button
              onClick={policeMarkArrived}
              className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors border ${
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
              Highway Interceptor 04 is on scene. Traffic diversion cones deployed on Lane 2. Scene secured for ambulance extrication.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

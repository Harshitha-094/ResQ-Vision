import React from 'react'
import {
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Ambulance,
  Shield,
  Clock,
  ArrowRight
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'

export default function TollView() {
  const {
    tollState,
    toggleTollEmergencyLane,
    incidents,
    simulationStage
  } = useEmergencyStore()

  const incident = incidents.find(i => i.id === 'RQ-1048') || incidents[0]

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header as Specified: Toll Authority */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-400" />
            <span>Toll Authority</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            National Highways Authority of India (NHAI) · Plaza Operations Desk
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>FASTag Corridor Node: Toll Plaza 17</span>
        </div>
      </div>

      {/* Main Toll Dashboard Card as Specified */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-4">
        {/* Notice of Incident Association */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="text-base sm:text-lg font-bold font-mono text-slate-100">
              Incident {incident.id}
            </div>
            <div className="text-xs text-amber-400 font-mono font-medium">
              2.1 km from Toll Plaza 17
            </div>
          </div>

          <span className="px-2.5 py-1 rounded bg-amber-950/80 border border-amber-850 text-amber-300 font-mono text-xs font-semibold self-start sm:self-auto">
            Highway Incident Alert Active
          </span>
        </div>

        {/* Operational Status Display as Specified */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          {/* Ambulance Status */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-400">
              <Ambulance className="w-4 h-4 text-emerald-400" />
              <span className="uppercase font-semibold">Ambulance:</span>
            </div>
            <div className="text-base font-bold text-emerald-400">
              {incident.response?.ambulance?.status || 'En route'}
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Unit: {incident.response?.ambulance?.id || 'KA 01 AB 1234'} (Ambulance 07)
            </p>
          </div>

          {/* Police Status */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-400">
              <Shield className="w-4 h-4 text-slate-300" />
              <span className="uppercase font-semibold">Police:</span>
            </div>
            <div className="text-base font-bold text-amber-400">
              {incident.response?.police?.status || 'Dispatched'}
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Unit: {incident.response?.police?.unit || 'Highway Interceptor 04'}
            </p>
          </div>
        </div>

        {/* Dedicated Toll Operations Control (Without controls that belong to ambulance or police) */}
        <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-semibold text-slate-200">
              Dedicated Emergency FASTag Lane #1:
            </span>
            <p className="text-[11px] text-slate-400">
              Automatic barrier override for approaching emergency vehicles and medical transports.
            </p>
          </div>

          <button
            onClick={toggleTollEmergencyLane}
            className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors border shrink-0 ${
              tollState.emergencyLaneOpen
                ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
          >
            {tollState.emergencyLaneOpen ? '✓ Lane #1 Cleared & Open' : 'Open Dedicated Emergency Lane'}
          </button>
        </div>

        {/* Regulatory Note as Specified */}
        <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2.5 flex items-center justify-between">
          <span>NHAI Plaza Operations · Toll Plaza 17 (Attibele / Electronic City)</span>
          <span className="font-mono">Read-Only Telemetry Dispatch</span>
        </div>
      </div>
    </div>
  )
}

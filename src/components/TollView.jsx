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
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span>Toll Authority</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            National Highways Authority of India (NHAI) · Plaza Operations Desk
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs font-medium text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>FASTag Corridor Node: Toll Plaza 17</span>
        </div>
      </div>

      {/* Main Toll Dashboard Card */}
      <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-5">
        {/* Notice of Incident Association */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="text-base sm:text-lg font-bold font-mono text-slate-900">
              Incident {incident.id}
            </div>
            <div className="text-xs text-amber-700 font-medium mt-0.5">
              2.1 km from Toll Plaza 17 (Attibele Approach)
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-mono text-xs font-semibold self-start sm:self-auto">
            Highway Incident Alert Active
          </span>
        </div>

        {/* Operational Status Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Ambulance Status */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-500">
              <Ambulance className="w-4 h-4 text-emerald-600" />
              <span className="uppercase font-semibold font-mono text-[10px]">Ambulance Telemetry</span>
            </div>
            <div className="text-base font-bold text-emerald-700">
              {incident.response?.ambulance?.status || 'En route'}
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Unit: {incident.response?.ambulance?.id || 'KA 01 AB 1234'} (Ambulance 07)
            </p>
          </div>

          {/* Police Status */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-500">
              <Shield className="w-4 h-4 text-slate-700" />
              <span className="uppercase font-semibold font-mono text-[10px]">Police Interceptor</span>
            </div>
            <div className="text-base font-bold text-amber-700">
              {incident.response?.police?.status || 'Dispatched'}
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Unit: {incident.response?.police?.unit || 'Highway Interceptor 04'}
            </p>
          </div>
        </div>

        {/* Dedicated Toll Operations Control */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <span className="font-semibold text-slate-900 text-sm">
              Dedicated Emergency FASTag Lane #1:
            </span>
            <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
              Automatic barrier override for approaching emergency vehicles and medical transports.
            </p>
          </div>

          <button
            onClick={toggleTollEmergencyLane}
            className={`px-4 py-2.5 rounded-lg font-semibold text-xs transition-colors border shrink-0 cursor-pointer shadow-2xs ${
              tollState.emergencyLaneOpen
                ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            {tollState.emergencyLaneOpen ? '✓ Lane #1 Cleared & Open' : 'Open Dedicated Emergency Lane'}
          </button>
        </div>

        {/* Regulatory Note */}
        <div className="text-xs text-slate-500 border-t border-slate-100 pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span>NHAI Plaza Operations · Toll Plaza 17 (Attibele / Electronic City)</span>
          <span className="font-mono text-[11px] text-slate-400">Read-Only Telemetry Dispatch</span>
        </div>
      </div>
    </div>
  )
}

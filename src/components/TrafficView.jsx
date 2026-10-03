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
  Navigation
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'

export default function TrafficView() {
  const {
    trafficState,
    toggleVmsAdvisory,
    toggleSignalCorridor,
    incidents,
    simulationStage
  } = useEmergencyStore()

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            <span>Traffic Authority</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Bengaluru Traffic Police (BTP) & National Highway Traffic Management System
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Adaptive Signal Network Online</span>
        </div>
      </div>

      {/* Main Monitoring Cards - Operational as Specified */}
      <div className="space-y-3">
        {/* Primary Alert Corridor: NH 44 */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
            <div>
              <div className="text-lg font-bold text-slate-100 font-mono">
                NH 44 (Bengaluru–Hosur Highway)
              </div>
              <div className="text-xs font-semibold text-red-400">
                Accident reported at KM 42.4 (Lane #2 Blocked)
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-800 text-red-300 font-mono text-xs font-bold">
                Traffic impact: High
              </span>
            </div>
          </div>

          {/* Operational Status Points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] block uppercase font-mono">Ambulance Movement</span>
              <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Ambulance className="w-3.5 h-3.5" />
                <span>Emergency vehicles approaching</span>
              </div>
              <p className="text-[11px] text-slate-400">Ambulance 07 currently 2.8 km away · ETA 02:14</p>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] block uppercase font-mono">Police Response</span>
              <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Highway Interceptor 04</span>
              </div>
              <p className="text-[11px] text-slate-400">Arriving to set up traffic diversion cones</p>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] block uppercase font-mono">Corridor Flow</span>
              <div className="font-semibold text-slate-200">
                Average Speed: 18 km/h
              </div>
              <p className="text-[11px] text-slate-400">Heavy congestion behind incident site</p>
            </div>
          </div>

          {/* Traffic Operational Controls */}
          <div className="pt-2 border-t border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Variable Message Signs (VMS):</span>
              <span className="font-mono text-slate-200 font-medium">
                {trafficState.vmsAdvisoryActive ? trafficState.vmsMessage : 'Standard Traffic Speed Signs'}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={toggleVmsAdvisory}
                className={`px-3 py-1.5 rounded font-medium transition-colors border ${
                  trafficState.vmsAdvisoryActive
                    ? 'bg-amber-950 border-amber-700 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                {trafficState.vmsAdvisoryActive ? 'Disable VMS Warning' : 'Broadcast VMS Warning'}
              </button>

              <button
                onClick={toggleSignalCorridor}
                className={`px-3 py-1.5 rounded font-medium transition-colors border ${
                  trafficState.signalCorridorActive
                    ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
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
          <div className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-100 font-mono">Tumkur Road (NH 48)</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 text-[10px] font-mono border border-amber-900">
                Traffic impact: Moderate
              </span>
            </div>
            <p className="text-slate-300 text-[11px]">
              Accident reported at Yeshwanthpur Junction. Ambulance 12 en route with patient to Victoria Hospital. Left turn restricted.
            </p>
            <div className="text-[11px] font-mono text-slate-400">
              Corridor Status: Diversion Active (Flow: 32 km/h)
            </div>
          </div>

          {/* Outer Ring Road */}
          <div className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-100 font-mono">Outer Ring Road (Silk Board)</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
                Traffic impact: Low
              </span>
            </div>
            <p className="text-slate-300 text-[11px]">
              Minor two-wheeler sideswipe on shoulder. BTP Patrol 11 on scene. Normal underpass traffic flow maintained.
            </p>
            <div className="text-[11px] font-mono text-slate-400">
              Corridor Status: Normal Monitoring (Flow: 45 km/h)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

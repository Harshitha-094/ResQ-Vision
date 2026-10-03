import React from 'react'
import {
  AlertTriangle,
  Ambulance,
  Building2,
  Clock,
  ArrowRight,
  Shield,
  Radio,
  Camera,
  Smartphone,
  Eye
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'
import LiveMap from './LiveMap'
import ResponseTimer from './ResponseTimer'

export default function ControlCenterView() {
  const {
    incidents,
    setActiveView,
    setSelectedIncidentId
  } = useEmergencyStore()

  const handleIncidentClick = (incidentId) => {
    setSelectedIncidentId(incidentId)
    setActiveView('incident_detail')
  }

  // Calculate realistic summary counts
  const activeCount = incidents.filter(i => i.status !== 'Completed').length
  const availableAmbulancesCount = 12
  const enRouteCount = 7
  const hospitalsAlertedCount = 3

  return (
    <div className="space-y-4">
      {/* Header and Supporting Text */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            Emergency Control Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitoring active incidents and emergency response.
          </p>
        </div>

        {/* Small live broadcast indicator */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time dispatch telemetry</span>
        </div>
      </div>

      {/* Simple Operational Summary at the Top (NOT giant statistic cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="px-3.5 py-2.5 rounded border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Active incidents</span>
            <span className="font-mono font-bold text-slate-100 text-base">
              {String(activeCount).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">1 Severe · 1 Mod · 1 Mild · 1 Citizen</span>
        </div>
        <div className="px-3.5 py-2.5 rounded border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Ambulances available</span>
            <span className="font-mono font-bold text-emerald-400 text-base">
              {String(availableAmbulancesCount).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] text-emerald-400/80 font-mono mt-0.5">12 / 16 Fleet Units Ready</span>
        </div>
        <div className="px-3.5 py-2.5 rounded border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">En route</span>
            <span className="font-mono font-bold text-blue-400 text-base">
              {String(enRouteCount).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] text-blue-400/80 font-mono mt-0.5">07 Active Dispatches</span>
        </div>
        <div className="px-3.5 py-2.5 rounded border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Hospitals alerted</span>
            <span className="font-mono font-bold text-slate-200 text-base">
              {String(hospitalsAlertedCount).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">Trauma Bays On Standby</span>
        </div>
      </div>

      {/* Large Live Map - Main Visual Element */}
      <div className="w-full">
        <LiveMap onSelectIncident={handleIncidentClick} />
      </div>

      {/* Active Incidents List (Realistic rows rather than giant cards) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-200">
              Active incidents
            </h2>
            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
              {incidents.length} total
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Click row to open detailed view
          </span>
        </div>

        {/* Table / List of Realistic Incident Rows */}
        <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/40 divide-y divide-slate-800/80">
          {incidents.map((incident) => {
            const isSevere = incident.severity === 'Severe'
            const isModerate = incident.severity === 'Moderate'
            const isMild = incident.severity === 'Mild'

            // Format remaining seconds
            const mins = Math.floor((incident.remainingSeconds || 0) / 60)
            const secs = (incident.remainingSeconds || 0) % 60
            const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} remaining`

            return (
              <div
                key={incident.id}
                onClick={() => handleIncidentClick(incident.id)}
                className="p-3 sm:px-4 hover:bg-slate-800/60 transition-colors cursor-pointer flex flex-col gap-1.5 text-xs group"
              >
                {/* Row 1: RQ-1048    Severe     NH 44, Bengaluru */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-100 group-hover:text-blue-400 transition-colors text-sm w-20">
                      {incident.id}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        isSevere
                          ? 'bg-red-950/80 border-red-800 text-red-400'
                          : isModerate
                          ? 'bg-amber-950/80 border-amber-800 text-amber-400'
                          : isMild
                          ? 'bg-slate-800 border-slate-700 text-slate-300'
                          : 'bg-blue-950/80 border-blue-800 text-blue-400'
                      }`}
                    >
                      {incident.severity}
                    </span>

                    <span className="text-slate-200 font-medium truncate">
                      {incident.shortLocation || incident.location}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-200 shrink-0">
                    <span className="text-[11px] font-medium hidden sm:inline">Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                {/* Row 2: Ambulance en route / 02:14 remaining */}
                <div className="flex items-center justify-between pl-23 text-slate-400 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 inline-block" />
                    <span className="text-slate-300 font-medium">{incident.status}</span>
                  </div>

                  <span className="font-mono text-slate-400 text-[11px]">
                    {incident.remainingSeconds !== undefined ? timeStr : '--:--'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

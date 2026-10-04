import React from 'react'
import {
  ArrowRight
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'
import LiveMap from './LiveMap'

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
    <div className="space-y-5">
      {/* Header and Supporting Text */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Emergency Control Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time monitoring of active incidents and inter-agency dispatch status.
          </p>
        </div>

        {/* Small live broadcast indicator */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Real-time dispatch telemetry</span>
        </div>
      </div>

      {/* Operational Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="px-4 py-3 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Active Incidents</span>
            <span className="font-mono font-bold text-slate-900 text-lg">
              {String(activeCount).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">1 Severe · 1 Mod · 1 Mild · 1 Citizen</span>
        </div>

        <div className="px-4 py-3 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Ambulances Available</span>
            <span className="font-mono font-bold text-emerald-700 text-lg">
              {String(availableAmbulancesCount).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1">12 / 16 Units Ready</span>
        </div>

        <div className="px-4 py-3 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">En Route</span>
            <span className="font-mono font-bold text-blue-700 text-lg">
              {String(enRouteCount).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[11px] text-blue-700 font-medium mt-1">07 Active Dispatches</span>
        </div>

        <div className="px-4 py-3 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Hospitals Alerted</span>
            <span className="font-mono font-bold text-slate-900 text-lg">
              {String(hospitalsAlertedCount).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Trauma Bays On Standby</span>
        </div>
      </div>

      {/* Large Live Map - Main Visual Element */}
      <div className="w-full">
        <LiveMap onSelectIncident={handleIncidentClick} />
      </div>

      {/* Active Incidents List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Active Incidents
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-mono text-slate-600 border border-slate-200">
              {incidents.length} total
            </span>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Click an incident to open dispatch docket
          </span>
        </div>

        {/* Table / List of Realistic Incident Rows */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs divide-y divide-slate-100">
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
                className="p-3.5 sm:px-5 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col gap-1.5 text-xs group"
              >
                {/* Row 1: ID, Severity, Location, Citizen Tag */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm w-20">
                      {incident.id}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                        isSevere
                          ? 'bg-red-50 border-red-200 text-red-700'
                          : isModerate
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : isMild
                          ? 'bg-slate-100 border-slate-200 text-slate-700'
                          : 'bg-blue-50 border-blue-200 text-blue-700'
                      }`}
                    >
                      {incident.severity}
                    </span>

                    <span className="text-slate-800 font-medium truncate">
                      {incident.shortLocation || incident.location}
                    </span>

                    {incident.source?.includes('CITIZEN') && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-mono hidden md:inline">
                        GPS Verified
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-blue-600 shrink-0">
                    <span className="text-xs font-medium hidden sm:inline">Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                {/* Row 2: Status & Time Remaining */}
                <div className="flex items-center justify-between sm:pl-23 text-slate-500 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
                    <span className="text-slate-600 font-medium">{incident.status}</span>
                  </div>

                  <span className="font-mono text-slate-500 text-[11px]">
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

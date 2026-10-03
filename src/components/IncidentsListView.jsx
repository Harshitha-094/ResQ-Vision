import React, { useState } from 'react'
import {
  AlertTriangle,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  Camera,
  Smartphone,
  Shield,
  Ambulance,
  Search
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'

export default function IncidentsListView() {
  const {
    incidents,
    setActiveView,
    setSelectedIncidentId,
    confirmCitizenIncident
  } = useEmergencyStore()

  const [filterSeverity, setFilterSeverity] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredIncidents = incidents.filter(i => {
    if (filterSeverity !== 'ALL' && i.severity !== filterSeverity) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        i.id.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q) ||
        i.status.toLowerCase().includes(q)
      )
    }
    return true
  })

  const handleInspect = (id) => {
    setSelectedIncidentId(id)
    setActiveView('incident_detail')
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>Live Incidents Queue</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Active highway & urban road collision callouts currently monitored by dispatch
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span>Total Recorded: {incidents.length}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        {/* Severity Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 overflow-x-auto">
          {['ALL', 'Severe', 'Moderate', 'Mild', 'Pending Review'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors shrink-0 ${
                filterSeverity === sev
                  ? 'bg-slate-800 text-slate-100 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev === 'ALL' ? 'All Incidents' : sev}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search incident ID, road..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Incidents Table */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40 divide-y divide-slate-800">
        {filteredIncidents.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No incidents found matching current filter.
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const isSevere = incident.severity === 'Severe'
            const isModerate = incident.severity === 'Moderate'
            const isPending = incident.severity === 'Pending Review'

            return (
              <div
                key={incident.id}
                className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                {/* Left Info: ID, Severity, Location, Source */}
                <div className="space-y-1 md:max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-100">
                      {incident.id}
                    </span>

                    <span
                      className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold border uppercase ${
                        isSevere
                          ? 'bg-red-950 text-red-400 border-red-800'
                          : isModerate
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : isPending
                          ? 'bg-blue-950 text-blue-400 border-blue-800'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {incident.severity}
                    </span>

                    <span className="text-[11px] text-slate-400 font-mono">
                      {incident.source}
                    </span>
                  </div>

                  <div className="text-slate-200 font-medium text-xs">
                    {incident.location}
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono">
                    Detected: {incident.detectedTime} IST · Status: <span className="text-slate-300">{incident.status}</span>
                  </div>
                </div>

                {/* Middle Info: Response Assets */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 md:min-w-[280px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Ambulance:</span>
                    <span className="text-emerald-400 font-semibold">
                      {incident.response?.ambulance?.unit || 'Unassigned'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Police Unit:</span>
                    <span className="text-slate-300">
                      {incident.response?.police?.unit || 'Queued'}
                    </span>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {isPending && incident.status === 'Waiting for confirmation' && (
                    <button
                      onClick={() => confirmCitizenIncident(incident.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
                    >
                      Verify & Dispatch
                    </button>
                  )}

                  <button
                    onClick={() => handleInspect(incident.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

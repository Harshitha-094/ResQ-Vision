import React, { useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            <span>Live Incidents Queue</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active highway & urban collision alerts currently managed by dispatchers.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-500">
          <span>Total Recorded: {incidents.length}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        {/* Severity Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 overflow-x-auto">
          {['ALL', 'Severe', 'Moderate', 'Mild', 'Pending Review'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                filterSeverity === sev
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sev === 'ALL' ? 'All Incidents' : sev}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search incident ID, road..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Incidents Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs divide-y divide-slate-100">
        {filteredIncidents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
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
                className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                {/* Left Info: ID, Severity, Location, Source */}
                <div className="space-y-1 md:max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {incident.id}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border uppercase ${
                        isSevere
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : isModerate
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : isPending
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {incident.severity}
                    </span>

                    <span className="text-[11px] text-slate-500 font-mono">
                      {incident.source}
                    </span>
                  </div>

                  <div className="text-slate-800 font-medium text-xs">
                    {incident.location}
                  </div>

                  <div className="text-[11px] text-slate-500">
                    Detected: {incident.detectedTime} IST · Status: <span className="text-slate-700 font-medium">{incident.status}</span>
                  </div>
                </div>

                {/* Middle Info: Response Assets */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-50 p-3 rounded-lg border border-slate-200 md:min-w-[280px]">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-sans">Ambulance:</span>
                    <span className="text-emerald-700 font-semibold">
                      {incident.response?.ambulance?.unit || 'Unassigned'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-sans">Police Unit:</span>
                    <span className="text-slate-700 font-medium">
                      {incident.response?.police?.unit || 'Queued'}
                    </span>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {isPending && incident.status === 'Waiting for confirmation' && (
                    <button
                      onClick={() => confirmCitizenIncident(incident.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors cursor-pointer shadow-2xs"
                    >
                      Verify & Dispatch
                    </button>
                  )}

                  <button
                    onClick={() => handleInspect(incident.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
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

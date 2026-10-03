import React, { useState } from 'react'
import {
  ArrowLeft,
  Clock,
  Shield,
  Ambulance,
  Building2,
  Activity,
  CreditCard,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Archive,
  Maximize2,
  FileCheck2,
  Lock
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'
import { checkViewAuthorization } from '../data/rolesConfig'
import ResponseTimer from './ResponseTimer'
import HospitalHandoverModal from './HospitalHandoverModal'

export default function IncidentDetailView() {
  const {
    selectedIncidentId,
    incidents,
    setActiveView,
    userRole,
    openConfirmModal,
    closeIncident,
    setSelectedAmbulanceUnitId,
    simulationStage
  } = useEmergencyStore()

  const [handoverModalOpen, setHandoverModalOpen] = useState(false)
  const incident = incidents.find(i => i.id === selectedIncidentId) || incidents[0]

  const handleCloseIncident = () => {
    openConfirmModal({
      title: `Close Incident ${incident.id}?`,
      message: 'Confirm that emergency medical handover and police scene clearance have concluded. This will archive the dispatch docket to official response records.',
      confirmLabel: 'Confirm Close Incident',
      isDestructive: false,
      onConfirm: () => {
        closeIncident(incident.id)
      }
    })
  }

  const isSevere = incident.severity === 'Severe'
  const isModerate = incident.severity === 'Moderate'

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-2.5 text-xs">
        <button
          onClick={() => setActiveView('overview')}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Control Center</span>
        </button>

        <div className="flex items-center gap-2">
          {incident.status !== 'Completed' ? (
            <button
              onClick={handleCloseIncident}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-100 transition-colors text-xs font-medium"
            >
              <Archive className="w-3.5 h-3.5 text-slate-400" />
              <span>Close Incident</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[11px] border border-emerald-800">
                Archived / Handover Completed
              </span>
              <button
                onClick={() => setHandoverModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Handover Docket</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Incident Header & Subheader as Specified */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 font-mono">
              Incident {incident.id}
            </h1>
            <span className={`text-xs px-2 py-0.5 rounded font-mono font-medium border ${
              incident.status === 'Completed'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}>
              {incident.status}
            </span>
          </div>

          <div className="mt-1 font-mono text-xs font-bold tracking-wider flex items-center gap-2 text-slate-300">
            <span className={isSevere ? 'text-red-400' : isModerate ? 'text-amber-400' : 'text-blue-400'}>
              {incident.severity.toUpperCase()}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">{incident.source.toUpperCase()}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 font-normal font-sans">{incident.location}</span>
          </div>
        </div>

        {/* Response Timer */}
        {incident.remainingSeconds !== undefined && incident.status !== 'Completed' && (
          <ResponseTimer
            seconds={incident.remainingSeconds}
            targetSeconds={incident.targetSeconds || 180}
            label="Target arrival"
          />
        )}
      </div>

      {/* Official Handover & Case Closure Docket Banner when Completed */}
      {incident.status === 'Completed' && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-800/80 space-y-3 shadow-md animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="font-mono font-bold text-xs sm:text-sm text-emerald-300 uppercase tracking-wider">
                  Hospital Handover Confirmed & Case Formally Closed
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Transferred by Ambulance 07 to St. John's Medical College Hospital
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono text-[11px] font-bold">
                REC-2026-RQ1048-SJ
              </span>
              <button
                onClick={() => setHandoverModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700 text-emerald-200 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>View Signed Docket</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
            <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Destination Bay</span>
              <span className="text-slate-100 font-bold block truncate">St. John's Hospital</span>
              <span className="text-[10px] text-emerald-400 truncate block">Trauma Bay 1 (Red Zone)</span>
            </div>
            <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Attending Lead</span>
              <span className="text-slate-100 font-bold block truncate">Dr. A. Mathew, MD</span>
              <span className="text-[10px] text-slate-400 truncate block">Chief Medical Officer</span>
            </div>
            <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Casualties</span>
              <span className="text-slate-100 font-bold block">2 Patients Transferred</span>
              <span className="text-[10px] text-emerald-400">Vitals Stabilized</span>
            </div>
            <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Ambulance Unit</span>
              <span className="text-slate-100 font-bold block truncate">Ambulance 07</span>
              <span className="text-[10px] text-slate-400 truncate block">Back to AVAILABLE</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Left (Timeline + Accident Image + Response Details) & Right (Accident -> Ambulance -> Hospital Map) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
        {/* Left Side (7 Cols): Timeline, Accident Image, Response */}
        <div className="lg:col-span-7 space-y-5">
          {/* Top row: Timeline beside Accident Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Simple Timeline as Specified */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3.5 space-y-2.5">
              <div className="text-[11px] font-semibold text-slate-400 uppercase font-mono tracking-wider flex items-center justify-between">
                <span>Incident Timeline</span>
                <Clock className="w-3.5 h-3.5 text-slate-500" />
              </div>

              <div className="space-y-2 text-xs font-mono">
                {incident.timeline && incident.timeline.map((entry, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-slate-400 font-medium shrink-0">
                      {entry.time}
                    </span>
                    <span className="text-slate-200 font-sans text-[11px] leading-snug">
                      {entry.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Accident Image Beside the Timeline as Specified */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                <img
                  src={incident.image}
                  alt={`Accident scene capture for ${incident.id}`}
                  className="w-full h-full object-cover"
                />
                {/* Visual camera or citizen photo overlay tag */}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/75 border border-white/20 text-[10px] font-mono text-white flex items-center gap-1.5 backdrop-blur-xs">
                  <span className={`w-1.5 h-1.5 rounded-full ${incident.source?.includes('CITIZEN') ? 'bg-blue-400' : 'bg-red-500'}`} />
                  <span>{incident.source?.includes('CITIZEN') ? 'CITIZEN LIVE CAPTURE' : incident.cameraNode || 'AI CAM FEED'}</span>
                </div>
                {incident.source?.includes('CITIZEN') ? (
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/75 text-[10px] font-mono text-emerald-400 border border-emerald-900/50">
                    GPS ±{incident.citizenReport?.accuracyMeters || 3.4}m Verified
                  </div>
                ) : incident.confidence ? (
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/75 text-[10px] font-mono text-emerald-400 border border-emerald-900/50">
                    Confidence {incident.confidence}%
                  </div>
                ) : null}
              </div>
              <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Vehicles: {incident.vehicles || '2 Vehicles'}</span>
                <span>Casualties: {incident.casualties || 2}</span>
              </div>
            </div>
          </div>

          {/* Below it show: Response Section as Specified */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase font-mono tracking-wider">
              Response
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Ambulance */}
              <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[11px] font-semibold uppercase font-mono">
                  Ambulance
                </div>
                <div className="font-bold text-slate-100 text-sm">
                  {incident.id === 'RQ-1052' ? 'Ambulance 04' : (incident.response?.ambulance?.id || 'KA 01 AB 1234')}
                </div>
                <div className="text-emerald-400 text-xs font-medium">
                  {incident.response?.ambulance?.status || 'En route'}
                </div>
                <button
                  onClick={() => {
                    if (incident.id === 'RQ-1052') {
                      setSelectedAmbulanceUnitId('AMB-04')
                    }
                    setActiveView('ambulances')
                  }}
                  className="mt-2 text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                >
                  {!checkViewAuthorization('ambulances', userRole).allowed ? (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Lock className="w-2.5 h-2.5 text-amber-500" />
                      <span>Restricted</span>
                    </span>
                  ) : (
                    <>
                      <span>Open Console</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Police */}
              <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[11px] font-semibold uppercase font-mono">
                  Police
                </div>
                <div className="font-bold text-slate-100 text-sm">
                  Unit assigned
                </div>
                <div className="text-amber-400 text-xs font-medium">
                  {incident.response?.police?.status || 'Dispatched'}
                </div>
                <button
                  onClick={() => setActiveView('police')}
                  className="mt-2 text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                >
                  {!checkViewAuthorization('police', userRole).allowed ? (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Lock className="w-2.5 h-2.5 text-amber-500" />
                      <span>Restricted</span>
                    </span>
                  ) : (
                    <>
                      <span>Open Police Unit</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Hospital */}
              <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[11px] font-semibold uppercase font-mono">
                  Hospital
                </div>
                <div className="font-bold text-slate-100 text-sm truncate">
                  {incident.response?.hospital?.name || 'Not selected yet'}
                </div>
                <div className="text-slate-400 text-xs font-medium">
                  {incident.response?.hospital?.status || 'Not selected yet'}
                </div>
                <button
                  onClick={() => setActiveView('hospitals')}
                  className="mt-2 text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                >
                  {!checkViewAuthorization('hospitals', userRole).allowed ? (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Lock className="w-2.5 h-2.5 text-amber-500" />
                      <span>Restricted</span>
                    </span>
                  ) : (
                    <>
                      <span>Open Hospital Bay</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Traffic & Toll Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-2.5 rounded bg-slate-950/70 border border-slate-850 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Traffic Authority</span>
                  <span className="text-slate-200 font-medium">
                    {incident.response?.traffic?.status || 'Advisory Active'} · {incident.response?.traffic?.road || 'NH 44'}
                  </span>
                </div>
                <button
                  onClick={() => setActiveView('traffic')}
                  className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {!checkViewAuthorization('traffic', userRole).allowed && (
                    <Lock className="w-2.5 h-2.5 text-amber-500" />
                  )}
                  <span>Inspect</span>
                </button>
              </div>

              <div className="p-2.5 rounded bg-slate-950/70 border border-slate-850 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Toll Authority</span>
                  <span className="text-slate-200 font-medium">
                    {incident.response?.toll?.plaza || 'Toll Plaza 17'} · {incident.response?.toll?.emergencyLane || 'Lane #1 Cleared'}
                  </span>
                </div>
                <button
                  onClick={() => setActiveView('toll')}
                  className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {!checkViewAuthorization('toll', userRole).allowed && (
                    <Lock className="w-2.5 h-2.5 text-amber-500" />
                  )}
                  <span>Inspect</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side (5 Cols): Small map with Accident -> Ambulance -> Hospital as Specified */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 font-mono">
                Accident → Ambulance → Hospital
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                Live Route Vectors
              </span>
            </div>

            {/* Focused GIS Vector Map */}
            <div className="relative w-full h-[320px] bg-slate-950 rounded border border-slate-800 overflow-hidden">
              <svg
                viewBox="0 0 400 320"
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full select-none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Road lines */}
                <path d="M 50,60 L 200,160 L 320,260" stroke="#1e293b" strokeWidth="16" fill="none" strokeLinecap="round" />
                <path d="M 50,60 L 200,160 L 320,260" stroke="#334155" strokeWidth="3" fill="none" strokeLinecap="round" />

                {/* Corridor branches */}
                <path d="M 200,160 L 340,110" stroke="#1e293b" strokeWidth="12" fill="none" strokeLinecap="round" />
                <path d="M 200,160 L 340,110" stroke="#334155" strokeWidth="2" fill="none" strokeLinecap="round" />

                {/* Route connecting Ambulance (200, 160) -> Accident (320, 260) */}
                <path
                  d="M 200,160 L 320,260"
                  stroke="#3b82f6"
                  strokeWidth="3.5"
                  strokeDasharray="5 3"
                  fill="none"
                />

                {/* Route connecting Accident (320, 260) -> Hospital (50, 60) */}
                <path
                  d="M 320,260 L 200,160 L 50,60"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                  fill="none"
                  opacity="0.8"
                />

                {/* Marker 1: Accident (320, 260) */}
                <g transform="translate(320, 260)">
                  <circle r="14" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="1" />
                  <circle r="8" fill="#ef4444" />
                  <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">!</text>
                  <text x="-15" y="24" fill="#fca5a5" fontSize="10" fontWeight="bold" textAnchor="middle">
                    Accident ({incident.id})
                  </text>
                </g>

                {/* Marker 2: Ambulance (200, 160) */}
                <g transform="translate(200, 160)">
                  <circle r="12" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
                  <rect x="-4" y="-4" width="8" height="8" fill="#10b981" rx="1" />
                  <text x="16" y="4" fill="#6ee7b7" fontSize="10" fontWeight="bold">
                    Ambulance 07 (En route)
                  </text>
                  <text x="16" y="15" fill="#94a3b8" fontSize="8">
                    2.8 km away · ETA 02:14
                  </text>
                </g>

                {/* Marker 3: Hospital (50, 60) */}
                <g transform="translate(50, 60)">
                  <circle r="12" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
                  <rect x="-4" y="-4" width="8" height="8" fill="#3b82f6" rx="1" />
                  <path d="M -2.5,0 L 2.5,0 M 0,-2.5 L 0,2.5" stroke="#ffffff" strokeWidth="1.2" />
                  <text x="16" y="4" fill="#93c5fd" fontSize="10" fontWeight="bold">
                    St. John's Hospital
                  </text>
                  <text x="16" y="15" fill="#94a3b8" fontSize="8">
                    3.2 km from scene · Level-1 Bay
                  </text>
                </g>
              </svg>
            </div>

            {/* Step Route Legend */}
            <div className="space-y-1.5 text-[11px] pt-1 font-mono">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Ambulance → Accident:</span>
                </span>
                <span className="text-slate-400">2.8 km (02:14)</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Accident → St. John's:</span>
                </span>
                <span className="text-slate-400">3.2 km (08:00)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hospital Handover & Docket Modal */}
      <HospitalHandoverModal
        isOpen={handoverModalOpen}
        onClose={() => setHandoverModalOpen(false)}
      />
    </div>
  )
}

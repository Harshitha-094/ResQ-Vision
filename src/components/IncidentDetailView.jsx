import React, { useState } from 'react'
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  ExternalLink,
  Archive,
  FileCheck2,
  Lock,
  Camera
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
    setSelectedAmbulanceUnitId
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
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3 text-xs">
        <button
          onClick={() => setActiveView('overview')}
          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors font-medium cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Control Center</span>
        </button>

        <div className="flex items-center gap-2">
          {incident.status !== 'Completed' ? (
            <button
              onClick={handleCloseIncident}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 transition-colors text-xs font-medium cursor-pointer shadow-2xs"
            >
              <Archive className="w-3.5 h-3.5 text-slate-500" />
              <span>Close Incident</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-mono text-[11px] border border-emerald-200 font-semibold">
                Archived / Handover Completed
              </span>
              <button
                onClick={() => setHandoverModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-medium cursor-pointer shadow-2xs"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Handover Docket</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Incident Header & Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              Incident {incident.id}
            </h1>
            <span className={`text-xs px-2.5 py-0.5 rounded-md font-mono font-semibold border ${
              incident.status === 'Completed'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              {incident.status}
            </span>
          </div>

          <div className="mt-1 font-mono text-xs font-semibold tracking-wider flex items-center gap-2 text-slate-600">
            <span className={isSevere ? 'text-red-700' : isModerate ? 'text-amber-700' : 'text-blue-700'}>
              {incident.severity.toUpperCase()}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">{incident.source.toUpperCase()}</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-700 font-normal font-sans">{incident.location}</span>
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

      {/* Official Handover Docket Banner when Completed */}
      {incident.status === 'Completed' && (
        <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="font-mono font-bold text-xs sm:text-sm text-emerald-900 uppercase tracking-wider">
                  Hospital Handover Confirmed & Case Formally Closed
                </div>
                <div className="text-[11px] text-emerald-700 font-mono">
                  Transferred by Ambulance 07 to St. John's Medical College Hospital
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-white border border-emerald-300 text-emerald-800 font-mono text-[11px] font-bold">
                REC-2026-RQ1048-SJ
              </span>
              <button
                onClick={() => setHandoverModalOpen(true)}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>View Signed Docket</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-2.5 rounded-lg bg-white border border-emerald-200">
              <span className="text-[10px] text-slate-500 block uppercase font-sans">Destination Bay</span>
              <span className="text-slate-900 font-bold block truncate">St. John's Hospital</span>
              <span className="text-[11px] text-emerald-700 truncate block">Trauma Bay 1 (Red Zone)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-emerald-200">
              <span className="text-[10px] text-slate-500 block uppercase font-sans">Attending Lead</span>
              <span className="text-slate-900 font-bold block truncate">Dr. A. Mathew, MD</span>
              <span className="text-[11px] text-slate-600 truncate block">Chief Medical Officer</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-emerald-200">
              <span className="text-[10px] text-slate-500 block uppercase font-sans">Casualties</span>
              <span className="text-slate-900 font-bold block">2 Patients Transferred</span>
              <span className="text-[11px] text-emerald-700">Vitals Stabilized</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-emerald-200">
              <span className="text-[10px] text-slate-500 block uppercase font-sans">Ambulance Unit</span>
              <span className="text-slate-900 font-bold block truncate">Ambulance 07</span>
              <span className="text-[11px] text-slate-600 truncate block">Back to AVAILABLE</span>
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
            {/* Timeline */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs">
              <div className="text-xs font-semibold text-slate-700 uppercase font-mono tracking-wider flex items-center justify-between border-b border-slate-100 pb-2">
                <span>Incident Timeline</span>
                <Clock className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                {incident.timeline && incident.timeline.map((entry, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="text-slate-500 font-medium shrink-0">
                      {entry.time}
                    </span>
                    <span className="text-slate-800 font-sans text-xs leading-snug">
                      {entry.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Accident Image */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs flex flex-col">
              <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                {incident.image ? (
                  <>
                    <img
                      src={incident.image}
                      alt={`Accident scene capture for ${incident.id}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Visual camera or citizen photo overlay tag */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 border border-white/20 text-[10px] font-mono text-white flex items-center gap-1.5 backdrop-blur-xs">
                      <span className={`w-1.5 h-1.5 rounded-full ${incident.source?.includes('CITIZEN') ? 'bg-emerald-400' : 'bg-red-500'}`} />
                      <span>{incident.source?.includes('CITIZEN') ? 'ORIGINAL CITIZEN LIVE PHOTO' : incident.cameraNode ? `PUBLIC CAM DEMO · ${incident.cameraNode}` : 'AI CAM FEED'}</span>
                    </div>
                    {incident.source?.includes('CITIZEN') ? (
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-[10px] font-mono text-emerald-400 border border-emerald-900/50">
                        GPS ±{incident.citizenReport?.accuracyMeters || 3.4}m Verified
                      </div>
                    ) : incident.confidence ? (
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-[10px] font-mono text-emerald-400 border border-emerald-900/50">
                        Confidence {incident.confidence}%
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="p-6 text-center space-y-2 text-slate-400">
                    <Camera className="w-8 h-8 text-slate-500 mx-auto" />
                    <div className="text-xs font-mono text-slate-300">Awaiting Citizen Live Camera Photo</div>
                    <div className="text-[10px] text-slate-500">Original bystander camera image will appear here upon submission.</div>
                  </div>
                )}
              </div>
              <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>Vehicles: {incident.vehicles || '2 Vehicles'}</span>
                <span>Casualties: {incident.casualties || 2}</span>
              </div>
            </div>
          </div>

          {/* Response Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs">
            <h2 className="text-xs font-semibold text-slate-700 uppercase font-mono tracking-wider border-b border-slate-100 pb-2">
              Assigned Emergency Units
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Ambulance */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-slate-500 text-[10px] font-semibold uppercase font-mono">
                  Ambulance
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  {incident.id === 'RQ-1052' ? 'Ambulance 04' : (incident.response?.ambulance?.id || 'KA 01 AB 1234')}
                </div>
                <div className="text-emerald-700 text-xs font-medium">
                  {incident.response?.ambulance?.status || 'En route'}
                </div>
                <button
                  onClick={() => {
                    if (incident.id === 'RQ-1052') {
                      setSelectedAmbulanceUnitId('AMB-04')
                    }
                    setActiveView('ambulances')
                  }}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer"
                >
                  {!checkViewAuthorization('ambulances', userRole).allowed ? (
                    <span className="flex items-center gap-1 text-slate-500">
                      <Lock className="w-2.5 h-2.5 text-amber-600" />
                      <span>Restricted</span>
                    </span>
                  ) : (
                    <>
                      <span>Open Console</span>
                      <ExternalLink className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>

              {/* Police */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-slate-500 text-[10px] font-semibold uppercase font-mono">
                  Police
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  Unit assigned
                </div>
                <div className="text-amber-700 text-xs font-medium">
                  {incident.response?.police?.status || 'Dispatched'}
                </div>
                <button
                  onClick={() => setActiveView('police')}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer"
                >
                  {!checkViewAuthorization('police', userRole).allowed ? (
                    <span className="flex items-center gap-1 text-slate-500">
                      <Lock className="w-2.5 h-2.5 text-amber-600" />
                      <span>Restricted</span>
                    </span>
                  ) : (
                    <>
                      <span>Open Police Unit</span>
                      <ExternalLink className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>

              {/* Hospital */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-slate-500 text-[10px] font-semibold uppercase font-mono">
                  Hospital
                </div>
                <div className="font-bold text-slate-900 text-sm truncate">
                  {incident.response?.hospital?.name || 'Not selected yet'}
                </div>
                <div className="text-slate-500 text-xs">
                  {incident.response?.hospital?.status || 'Not selected yet'}
                </div>
                <button
                  onClick={() => setActiveView('hospitals')}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer"
                >
                  {!checkViewAuthorization('hospitals', userRole).allowed ? (
                    <span className="flex items-center gap-1 text-slate-500">
                      <Lock className="w-2.5 h-2.5 text-amber-600" />
                      <span>Restricted</span>
                    </span>
                  ) : (
                    <>
                      <span>Open Hospital Bay</span>
                      <ExternalLink className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Traffic & Toll Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Traffic Authority</span>
                  <span className="text-slate-900 font-medium">
                    {incident.response?.traffic?.status || 'Advisory Active'} · {incident.response?.traffic?.road || 'NH 44'}
                  </span>
                </div>
                <button
                  onClick={() => setActiveView('traffic')}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  {!checkViewAuthorization('traffic', userRole).allowed && (
                    <Lock className="w-3 h-3 text-amber-600" />
                  )}
                  <span>Inspect</span>
                </button>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Toll Authority</span>
                  <span className="text-slate-900 font-medium">
                    {incident.response?.toll?.plaza || 'Toll Plaza 17'} · {incident.response?.toll?.emergencyLane || 'Lane #1 Cleared'}
                  </span>
                </div>
                <button
                  onClick={() => setActiveView('toll')}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  {!checkViewAuthorization('toll', userRole).allowed && (
                    <Lock className="w-3 h-3 text-amber-600" />
                  )}
                  <span>Inspect</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side (5 Cols): Map with Accident -> Ambulance -> Hospital */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
              <span className="font-semibold text-slate-900 font-mono">
                Accident → Ambulance → Hospital
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                Route Vector
              </span>
            </div>

            {/* GIS Vector Map */}
            <div className="relative w-full h-[320px] bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
              <svg
                viewBox="0 0 400 320"
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full select-none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Road lines */}
                <path d="M 50,60 L 200,160 L 320,260" stroke="#cbd5e1" strokeWidth="16" fill="none" strokeLinecap="round" />
                <path d="M 50,60 L 200,160 L 320,260" stroke="#94a3b8" strokeWidth="2" fill="none" strokeLinecap="round" />

                {/* Corridor branches */}
                <path d="M 200,160 L 340,110" stroke="#cbd5e1" strokeWidth="12" fill="none" strokeLinecap="round" />
                <path d="M 200,160 L 340,110" stroke="#94a3b8" strokeWidth="2" fill="none" strokeLinecap="round" />

                {/* Route connecting Ambulance (200, 160) -> Accident (320, 260) */}
                <path
                  d="M 200,160 L 320,260"
                  stroke="#2563eb"
                  strokeWidth="3.5"
                  strokeDasharray="6 4"
                  fill="none"
                />

                {/* Route connecting Accident (320, 260) -> Hospital (50, 60) */}
                <path
                  d="M 320,260 L 200,160 L 50,60"
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeDasharray="5 5"
                  fill="none"
                />

                {/* Marker 1: Accident (320, 260) */}
                <g transform="translate(320, 260)">
                  <circle r="14" fill="rgba(239, 68, 68, 0.15)" stroke="#dc2626" strokeWidth="1.5" />
                  <circle r="8" fill="#dc2626" />
                  <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">!</text>
                  <text x="-15" y="24" fill="#991b1b" fontSize="10" fontWeight="bold" textAnchor="middle">
                    Accident ({incident.id})
                  </text>
                </g>

                {/* Marker 2: Ambulance (200, 160) */}
                <g transform="translate(200, 160)">
                  <circle r="12" fill="#ffffff" stroke="#059669" strokeWidth="2" />
                  <rect x="-4" y="-4" width="8" height="8" fill="#059669" rx="1" />
                  <text x="16" y="4" fill="#065f46" fontSize="10" fontWeight="bold">
                    Ambulance 07 (En route)
                  </text>
                  <text x="16" y="15" fill="#64748b" fontSize="8">
                    2.8 km away · ETA 02:14
                  </text>
                </g>

                {/* Marker 3: Hospital (50, 60) */}
                <g transform="translate(50, 60)">
                  <circle r="12" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
                  <rect x="-4" y="-4" width="8" height="8" fill="#2563eb" rx="1" />
                  <path d="M -2.5,0 L 2.5,0 M 0,-2.5 L 0,2.5" stroke="#ffffff" strokeWidth="1.2" />
                  <text x="16" y="4" fill="#1e40af" fontSize="10" fontWeight="bold">
                    St. John's Hospital
                  </text>
                  <text x="16" y="15" fill="#64748b" fontSize="8">
                    3.2 km from scene · Level-1 Bay
                  </text>
                </g>
              </svg>
            </div>

            {/* Step Route Legend */}
            <div className="space-y-1.5 text-xs pt-1 font-mono">
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>Ambulance → Accident:</span>
                </span>
                <span className="text-slate-500 font-semibold">2.8 km (02:14)</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Accident → St. John's:</span>
                </span>
                <span className="text-slate-500 font-semibold">3.2 km (08:00)</span>
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

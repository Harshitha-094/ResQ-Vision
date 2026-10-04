import React from 'react'
import {
  Camera,
  Radio,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Maximize2,
  Shield,
  Layers
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'

export default function CameraMonitoringView() {
  const {
    cameras,
    selectedCameraId,
    setSelectedCameraId,
    setActiveView,
    setSelectedIncidentId
  } = useEmergencyStore()

  const activeCam = cameras.find(c => c.id === selectedCameraId) || cameras[0]

  const handleOpenIncident = (incidentId) => {
    setSelectedIncidentId(incidentId)
    setActiveView('incident_detail')
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <span>Camera Monitoring</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authorized edge cameras deployed along Highways, Toll Plazas, Petrol Pumps & Traffic Junctions
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs font-medium text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Edge Neural Stream (RTSP 1080p 25fps)</span>
        </div>
      </div>

      {/* Camera Selection Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {cameras.map((cam) => {
          const isSelected = cam.id === activeCam.id

          return (
            <button
              key={cam.id}
              onClick={() => setSelectedCameraId(cam.id)}
              className={`px-3 py-2 rounded-lg border font-medium transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${cam.hasAccident ? 'bg-red-500' : 'bg-emerald-500'}`} />
              <span className="font-mono text-xs">{cam.nodeName}</span>
              {cam.hasAccident && (
                <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-700 text-[10px] font-mono font-bold">
                  ALERT
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Main Camera Feed Display Box */}
      <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
        {/* Camera Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 text-xs">
          <div>
            <div className="text-base font-bold font-mono text-slate-900">
              {activeCam.nodeName}
            </div>
            <div className="text-slate-500 text-xs mt-0.5">
              {activeCam.location} · Category: <strong className="text-slate-700 font-semibold">{activeCam.category}</strong>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
              {activeCam.resolution}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-semibold text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{activeCam.status}</span>
            </span>
          </div>
        </div>

        {/* Video / Still Viewfinder Container */}
        <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
          <img
            src={activeCam.feedImage}
            alt={`Camera feed for ${activeCam.nodeName}`}
            className="w-full h-full object-cover"
          />

          {/* Realistic Video HUD Overlays */}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/80 border border-white/20 text-white font-mono text-xs flex items-center gap-2 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>REC · {activeCam.id}</span>
          </div>

          <div className="absolute top-3 right-3 px-2.5 py-1 rounded bg-black/80 font-mono text-[11px] text-slate-200 border border-white/10 backdrop-blur-xs">
            {activeCam.lastSync}
          </div>

          {/* Bounding Box Simulation on Active Crash */}
          {activeCam.hasAccident && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-36 border-2 border-red-500 rounded bg-red-500/10 flex flex-col justify-between p-2">
                <span className="text-[10px] font-mono font-bold text-white bg-red-600 px-1.5 py-0.5 rounded self-start shadow-xs">
                  COLLISION {activeCam.aiConfidence}%
                </span>
                <span className="text-[10px] font-mono text-red-200 self-end bg-black/80 px-1.5 py-0.5 rounded">
                  VEHICLE IMPACT
                </span>
              </div>
            </div>
          )}

          {/* Demonstration Public Feed Tag */}
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-black/85 text-[10px] font-mono text-slate-200 border border-slate-700 flex items-center gap-1.5 backdrop-blur-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>PUBLIC CAMERA DEMONSTRATION STREAM · {activeCam.category?.toUpperCase()} ONLY</span>
          </div>
        </div>

        {/* STATE A: WHEN NO ACCIDENT */}
        {!activeCam.hasAccident && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold text-sm">No incident detected</span>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Optical flow smooth · Regular highway traffic patterns
            </span>
          </div>
        )}

        {/* STATE B: WHEN ACCIDENT IS DETECTED */}
        {activeCam.hasAccident && (
          <div className="p-5 rounded-xl bg-red-50/70 border border-red-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-200/80 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-red-900">
                  Accident detected
                </h3>
              </div>
              <span className="font-mono text-xs text-red-700 font-bold bg-white px-2.5 py-1 rounded border border-red-200 shadow-2xs">
                Incident Ref: {activeCam.activeIncidentId}
              </span>
            </div>

            {/* Details: Time, Location, AI confidence, Scene severity */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-white border border-red-100 shadow-2xs">
                <span className="text-slate-500 text-[10px] block font-sans">Time</span>
                <span className="text-slate-900 font-bold text-xs">14:32:18 IST</span>
              </div>

              <div className="p-3 rounded-lg bg-white border border-red-100 shadow-2xs">
                <span className="text-slate-500 text-[10px] block font-sans">Location</span>
                <span className="text-slate-900 font-bold text-xs truncate block">{activeCam.location}</span>
              </div>

              <div className="p-3 rounded-lg bg-white border border-red-100 shadow-2xs">
                <span className="text-slate-500 text-[10px] block font-sans">AI Confidence</span>
                <span className="text-emerald-700 font-bold text-sm">Confidence {activeCam.aiConfidence}%</span>
              </div>

              <div className="p-3 rounded-lg bg-white border border-red-100 shadow-2xs">
                <span className="text-slate-500 text-[10px] block font-sans">Scene Severity</span>
                <span className="text-red-700 font-bold text-sm">Estimated: {activeCam.estimatedSeverity}</span>
              </div>
            </div>

            {/* Disclaimer Note */}
            <div className="text-xs text-slate-600 leading-relaxed border-t border-red-200/60 pt-3 flex items-start gap-2">
              <span className="text-slate-700 font-semibold shrink-0">Note:</span>
              <span>
                Assessment reflects automated visual detection of vehicle kinetic impact and structural deformation. ResQVision does not claim or infer automated medical diagnosis of casualty injuries.
              </span>
            </div>

            {/* Button: Open incident */}
            <div className="pt-1">
              <button
                onClick={() => handleOpenIncident(activeCam.activeIncidentId)}
                className="w-full sm:w-auto py-2.5 px-5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Open Incident Docket</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

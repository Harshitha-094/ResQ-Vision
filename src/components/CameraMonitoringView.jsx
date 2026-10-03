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
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header as Specified: Camera Monitoring */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-400" />
            <span>Camera Monitoring</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Authorized edge cameras deployed along Highways, Toll Plazas, Petrol Pumps & Traffic Junctions
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
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
              className={`px-3 py-1.5 rounded-lg border font-medium transition-all shrink-0 flex items-center gap-2 ${
                isSelected
                  ? 'bg-slate-800 border-slate-600 text-slate-100 shadow-xs'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${cam.hasAccident ? 'bg-red-500' : 'bg-emerald-500'}`} />
              <span className="font-mono">{cam.nodeName}</span>
              {cam.hasAccident && (
                <span className="px-1.5 py-0.2 rounded bg-red-950 text-red-400 text-[10px] font-mono font-bold">
                  ALERT
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Main Camera Feed Display Box */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-4">
        {/* Camera Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 text-xs">
          <div>
            <div className="text-base font-bold font-mono text-slate-100">
              {activeCam.nodeName}
            </div>
            <div className="text-slate-400 text-[11px] font-sans">
              {activeCam.location} · Category: <strong className="text-slate-300">{activeCam.category}</strong>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-mono">
              {activeCam.resolution}
            </span>
            <span className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono font-bold text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{activeCam.status}</span>
            </span>
          </div>
        </div>

        {/* Video / Still Viewfinder Container */}
        <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-black">
          <img
            src={activeCam.feedImage}
            alt={`Camera feed for ${activeCam.nodeName}`}
            className="w-full h-full object-cover"
          />

          {/* Realistic Video HUD Overlays */}
          <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/80 border border-white/20 text-white font-mono text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            <span>REC · {activeCam.id}</span>
          </div>

          <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/80 font-mono text-[11px] text-slate-300">
            {activeCam.lastSync}
          </div>

          {/* Bounding Box Simulation on Active Crash */}
          {activeCam.hasAccident && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-32 border-2 border-red-500 rounded bg-red-500/10 flex flex-col justify-between p-1.5">
                <span className="text-[10px] font-mono font-bold text-white bg-red-600 px-1 py-0.2 rounded self-start">
                  COLLISION {activeCam.aiConfidence}%
                </span>
                <span className="text-[9px] font-mono text-red-300 self-end bg-black/70 px-1 rounded">
                  VEHICLE IMPACT
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* STATE A: WHEN NO ACCIDENT                                */}
        {/* ======================================================== */}
        {!activeCam.hasAccident && (
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">No incident detected</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Optical flow smooth · Regular highway traffic patterns
            </span>
          </div>
        )}

        {/* ======================================================== */}
        {/* STATE B: WHEN ACCIDENT IS DETECTED (As Specified)        */}
        {/* ======================================================== */}
        {activeCam.hasAccident && (
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/80 space-y-3 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-900/60 pb-2.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-red-300">
                  Accident detected
                </h3>
              </div>
              <span className="font-mono text-xs text-red-400 font-bold">
                Incident Ref: {activeCam.activeIncidentId}
              </span>
            </div>

            {/* Required details: Captured frame, Time, Location, AI confidence, Estimated scene severity */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Time</span>
                <span className="text-slate-200 font-bold">14:32:18 IST</span>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Location</span>
                <span className="text-slate-200 font-bold truncate block">{activeCam.location}</span>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">AI Confidence</span>
                <span className="text-emerald-400 font-bold text-sm">Confidence {activeCam.aiConfidence}%</span>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Scene Severity</span>
                <span className="text-red-400 font-bold text-sm">Estimated scene severity: {activeCam.estimatedSeverity}</span>
              </div>
            </div>

            {/* Crucial Note as Specified: Do NOT claim AI has medically diagnosed injury */}
            <div className="text-[11px] text-slate-400 leading-snug border-t border-red-900/40 pt-2 flex items-start gap-2">
              <span className="text-slate-500 font-bold">Note:</span>
              <span>
                Assessment reflects automated visual detection of vehicle kinetic impact and structural deformation. ResQVision does not claim or infer automated medical diagnosis of casualty injuries.
              </span>
            </div>

            {/* Button: Open incident as Specified */}
            <div className="pt-1">
              <button
                onClick={() => handleOpenIncident(activeCam.activeIncidentId)}
                className="w-full sm:w-auto py-2.5 px-5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors shadow-md shadow-red-950/40 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Open incident</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

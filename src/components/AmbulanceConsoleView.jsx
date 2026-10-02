import React from 'react'
import {
  Radio,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Navigation,
  Shield,
  Zap,
  Activity,
  Compass,
  MapPin,
  Volume2,
  VolumeX,
  Wrench,
  HeartPulse,
  Flame,
  UserCheck,
  Truck,
  CheckSquare,
  Square,
  ExternalLink
} from 'lucide-react'
import VideoReplayBuffer from './VideoReplayBuffer'
import { useEmergencyStore } from '../store/emergencyStore'
import { ZONES } from '../data/mockScenarios'
import { playButtonClick } from '../utils/audio'

export default function AmbulanceConsoleView() {
  const {
    activeIncident,
    selectedZone,
    ambulanceStatus,
    countdown,
    acceptDispatch,
    updateAmbulanceStatus,
    ambulanceEtaSeconds,
    distanceKm,
    paramedicChecklist,
    toggleChecklist,
    soundEnabled,
    setActiveTab,
  } = useEmergencyStore()

  const zone = ZONES[selectedZone]

  const formatEta = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`
  }

  const completedChecklistCount = paramedicChecklist.filter((i) => i.checked).length
  const totalChecklistCount = paramedicChecklist.length
  const checklistPercent = Math.round((completedChecklistCount / totalChecklistCount) * 100)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Mobile / Tablet MDT Frame Wrapper */}
      <div className="p-1 sm:p-2 rounded-xl sm:rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 border-2 sm:border-4 border-slate-700 shadow-2xl">
        {/* Header: PRIORITY 0 DISPATCH — IMMEDIATE ROLLOUT */}
        <div
          className={`py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 text-xs font-mono font-bold transition-all ${
            ambulanceStatus === 'alerted' || ambulanceStatus === 'escalated'
              ? 'bg-red-600 text-white p0-glow-pulse'
              : ambulanceStatus === 'en_route'
              ? 'bg-amber-600 text-white shadow-lg'
              : ambulanceStatus === 'arrived'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'bg-slate-900 border border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="p-1.5 sm:p-2 bg-black/30 rounded-lg flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <div className="text-[9px] sm:text-[10px] tracking-widest uppercase opacity-90">
                108 GVK-EMRI • IN-CAB DRIVER MDT
              </div>
              <div className="text-sm sm:text-base font-black tracking-wide leading-tight">
                {activeIncident
                  ? 'PRIORITY 0 DISPATCH — IMMEDIATE ROLLOUT'
                  : `UNIT ${zone.ambulanceBase.split(' ')[0]} READY • STANDBY`}
              </div>
            </div>
          </div>

          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-white/20">
            <div className="text-left sm:text-right">
              <div className="text-[9px] sm:text-[10px] opacity-80">DISPATCH STATUS</div>
              <div className="text-[11px] sm:text-xs uppercase font-extrabold tracking-wider">
                {ambulanceStatus === 'alerted' && '⚠️ ALERTED - PENDING DRIVER ACK'}
                {ambulanceStatus === 'escalated' && '🚨 TICKET ESCALATED'}
                {ambulanceStatus === 'accepted' && 'CONFIRMED'}
                {ambulanceStatus === 'en_route' && '🚑 EN ROUTE (CODE 3)'}
                {ambulanceStatus === 'arrived' && '✅ ON SCENE'}
                {ambulanceStatus === 'idle' && 'STANDBY'}
              </div>
            </div>

            {/* Quick Status Override Stepper */}
            {activeIncident && (
              <div className="flex items-center bg-black/40 rounded-lg p-0.5 sm:p-1 gap-0.5 sm:gap-1">
                {['alerted', 'en_route', 'arrived'].map((st) => (
                  <button
                    key={st}
                    onClick={() => updateAmbulanceStatus(st)}
                    className={`min-h-[32px] px-2 py-1 rounded text-[9px] sm:text-[10px] font-mono uppercase transition-all ${
                      ambulanceStatus === st
                        ? 'bg-white text-black font-extrabold'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {st === 'en_route' ? 'ROUTE' : st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Inner Cockpit Grid */}
        <div className="p-3 sm:p-6 bg-slate-950 rounded-lg sm:rounded-xl mt-2 space-y-4 sm:space-y-6">
          {/* Audio-Visual Pulsing Alert & 15-Second Driver Acknowledgement Countdown */}
          {ambulanceStatus === 'alerted' && (
            <div className="p-4 sm:p-5 rounded-xl bg-red-950/70 border-2 border-red-500 shadow-2xl p0-glow-pulse flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
                {/* 15s Countdown Ring */}
                <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-red-500 bg-red-950 shadow-inner shrink-0">
                  <div className="text-center font-mono">
                    <span className="text-xl sm:text-2xl font-black text-white">{countdown}</span>
                    <span className="text-[8px] sm:text-[9px] block text-red-300 font-bold uppercase">SEC</span>
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 bg-red-500"></span>
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase">
                      PRIORITY 0
                    </span>
                    <span className="text-[11px] sm:text-xs font-mono text-amber-300 font-bold">
                      Driver Acknowledgement Required ({countdown}s)
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white mt-1 leading-snug">
                    {activeIncident?.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-300 font-mono">
                    Auto-escalating to secondary unit if unacknowledged within 15 seconds.
                  </p>
                </div>
              </div>

              {/* Oversized Green CTA Button: ACCEPT DISPATCH & NAVIGATE (Min 48px height) */}
              <button
                onClick={acceptDispatch}
                className="w-full md:w-auto min-h-[56px] sm:min-h-[64px] px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-2xl shadow-emerald-950/80 border-2 border-emerald-400/50 transform active:scale-95 transition-all flex items-center justify-center gap-2.5 animate-pulse shrink-0"
              >
                <Zap className="w-5 h-5 fill-white" />
                <span>ACCEPT DISPATCH & NAVIGATE</span>
              </button>
            </div>
          )}

          {/* Ticket Escalated to Secondary Unit Banner */}
          {ambulanceStatus === 'escalated' && (
            <div className="p-4 sm:p-5 rounded-xl bg-amber-950/80 border-2 border-amber-500 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-600/30 rounded-xl border border-amber-500 text-amber-400 shrink-0">
                  <AlertTriangle className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded bg-amber-600 text-black font-mono font-black text-[10px] tracking-wider uppercase">
                    TIMEOUT EXPIRED
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-amber-200 mt-1">
                    TICKET ESCALATED TO SECONDARY UNIT
                  </h3>
                  <p className="text-[11px] text-slate-300 font-mono">
                    15s acknowledgement timer lapsed. EMRI CAD routed ticket to dual-responder unit KA-02-ALS-99.
                  </p>
                </div>
              </div>

              {/* Driver Override Button */}
              <button
                onClick={acceptDispatch}
                className="w-full md:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg border border-emerald-400 transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>OVERRIDE & ACCEPT AS PRIMARY UNIT</span>
              </button>
            </div>
          )}

          {/* Active Navigation & Telemetry HUD Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase flex items-center gap-1">
                <Navigation className="w-3 h-3 text-cyan-400" />
                Target Locus
              </span>
              <div className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">
                {activeIncident ? activeIncident.zoneDetails.name : zone.name}
              </div>
              <div className="text-[9px] sm:text-[10px] text-cyan-400 font-bold truncate">
                {activeIncident ? activeIncident.zoneDetails.curveMarker : zone.curveMarker}
              </div>
            </div>

            <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                Ambulance ETA
              </span>
              <div className="text-base sm:text-xl font-black text-amber-400 mt-0.5">
                {ambulanceStatus === 'arrived' ? '00:00 (ON SITE)' : formatEta(ambulanceEtaSeconds)}
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-400">
                Dist: <strong className="text-white">{distanceKm} km</strong>
              </div>
            </div>

            <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase flex items-center gap-1">
                <Truck className="w-3 h-3 text-emerald-400" />
                Speedometer
              </span>
              <div className="text-base sm:text-xl font-black text-white mt-0.5">
                {ambulanceStatus === 'en_route' ? '88 km/h' : ambulanceStatus === 'arrived' ? '0 km/h' : '0 km/h'}
              </div>
              <div className="text-[9px] sm:text-[10px] text-emerald-400 font-bold truncate">
                {ambulanceStatus === 'en_route' ? 'GREEN WAVE (250m)' : 'STANDBY'}
              </div>
            </div>

            <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase flex items-center gap-1">
                <Shield className="w-3 h-3 text-red-400" />
                Crash Severity
              </span>
              <div className="text-base sm:text-xl font-black text-red-400 mt-0.5">
                CSI: {activeIncident ? `${activeIncident.csi} / 5.0` : '0.0'}
              </div>
              <div className="text-[9px] sm:text-[10px] text-red-300 truncate">
                {activeIncident ? `${activeIncident.trappedVictims} TRAPPED` : 'STANDBY'}
              </div>
            </div>
          </div>

          {/* Incident Intelligence Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: 5-Second Simulated Video Replay Buffer & Location Marker */}
            <div className="lg:col-span-7 space-y-4">
              <VideoReplayBuffer scenarioKey={selectedZone} />

              {/* Exact Coordinates, Curve Marker & Direct Google Maps Link */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Location Marker & GIS Coordinates</span>
                  <div className="text-white font-bold text-xs sm:text-sm mt-0.5">
                    {zone.curveMarker}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    GPS: <span className="text-cyan-400">{zone.coordinates.lat.toFixed(4)}° N, {zone.coordinates.lng.toFixed(4)}° E</span>
                  </div>
                </div>

                <a
                  href={zone.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[48px] px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-950/60 transition-all shrink-0 w-full sm:w-auto justify-center active:scale-95"
                >
                  <Navigation className="w-4 h-4" />
                  <span>OPEN GOOGLE MAPS NAVIGATION</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>

              {/* Crash Dynamics Breakdown */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-300 font-bold uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Autonomous Kinematic Crash Reconstruction
                  </span>
                  <span className="text-[10px] text-cyan-400 font-bold">
                    TENSORRT YOLOv10-EDGE
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-500 text-[10px] block">COLLISION ANGLE</span>
                    <span className="text-slate-200 font-bold">
                      {activeIncident ? activeIncident.telemetry.impactAngle : 'Frontal Impact'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">PEAK G-FORCE</span>
                    <span className="text-red-400 font-black">
                      {activeIncident ? activeIncident.telemetry.gForce : '18.4 G'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">HAZMAT / FIRE RISK</span>
                    <span className="text-amber-400 font-bold">
                      {activeIncident ? activeIncident.telemetry.hazmatRisk.split(' ')[0] : 'Low Risk'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-slate-400 text-[11px] leading-relaxed">
                  <strong className="text-slate-200">Clinical Mechanism: </strong>
                  {activeIncident
                    ? activeIncident.clinicalAssessment.mechanism
                    : 'Standard high-speed vehicle impact protocol. Prepare extrication gear.'}
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Paramedic Pre-Arrival Clinical Checklist */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                      <HeartPulse className="w-4 h-4 text-rose-500" />
                      Paramedic Pre-Arrival Clinical Checklist
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Verify critical extrication and life support gear before arrival
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-cyan-300">
                    {completedChecklistCount}/{totalChecklistCount} READY
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300"
                      style={{ width: `${checklistPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Kit Preparation Readiness</span>
                    <span>{checklistPercent}%</span>
                  </div>
                </div>

                {/* Checklist items */}
                <div className="space-y-2">
                  {paramedicChecklist.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleChecklist(item.id)}
                      className={`w-full p-2.5 rounded-lg border text-left flex items-start gap-3 transition-all ${
                        item.checked
                          ? 'bg-emerald-950/30 border-emerald-700/60 text-emerald-200'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="mt-0.5 text-emerald-400 flex-shrink-0">
                        {item.checked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-600" />}
                      </span>
                      <div className="flex-1 text-xs">
                        <span className={item.checked ? 'line-through opacity-70' : 'font-medium'}>
                          {item.label}
                        </span>
                        {item.critical && (
                          <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-red-950 text-red-400 border border-red-800 font-mono">
                            CRITICAL
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Trauma Team Handoff Shortcut */}
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('hospital')}
                    className="w-full py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold font-mono flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>VIEW TRAUMA HOSPITAL ADMISSION TICKET</span>
                    <Activity className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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
  Square
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
      <div className="p-1 sm:p-2 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 border-4 border-slate-700 shadow-2xl">
        {/* Persistent Priority 0 Banner Across Top */}
        <div
          className={`py-3 px-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono font-bold transition-all ${
            ambulanceStatus === 'alerted'
              ? 'bg-red-600 text-white p0-glow-pulse'
              : ambulanceStatus === 'en_route'
              ? 'bg-amber-600 text-white shadow-lg'
              : ambulanceStatus === 'arrived'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'bg-slate-900 border border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="p-1.5 bg-black/30 rounded-lg flex items-center justify-center">
              <Radio className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <div className="text-[10px] tracking-widest uppercase opacity-90">
                108 GVK-EMRI • STATE EMERGENCY AMBULANCE CAD MDT-9000
              </div>
              <div className="text-sm font-black tracking-wide">
                {activeIncident
                  ? `PRIORITY 0: IMMEDIATE ROLLOUT - UNIT ${zone.ambulanceBase.split(' ')[0]}`
                  : `UNIT ${zone.ambulanceBase.split(' ')[0]} READY • STANDBY AT RAMANAGARA BASE`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] opacity-80">DISPATCH STATUS</div>
              <div className="text-xs uppercase font-extrabold tracking-wider">
                {ambulanceStatus === 'alerted' && '⚠️ ALERTED - PENDING DRIVER ACCEPT'}
                {ambulanceStatus === 'accepted' && 'CONFIRMED - PRE-ROUTE'}
                {ambulanceStatus === 'en_route' && '🚑 EN ROUTE (CODE 3 SIREN)'}
                {ambulanceStatus === 'arrived' && '✅ ARRIVED ON SCENE'}
                {ambulanceStatus === 'idle' && 'IDLE STANDBY'}
              </div>
            </div>

            {/* Quick Status Override Stepper */}
            {activeIncident && (
              <div className="flex items-center bg-black/40 rounded-lg p-1 gap-1">
                {['alerted', 'en_route', 'arrived'].map((st) => (
                  <button
                    key={st}
                    onClick={() => updateAmbulanceStatus(st)}
                    className={`px-2 py-1 rounded text-[10px] font-mono uppercase transition-all ${
                      ambulanceStatus === st
                        ? 'bg-white text-black font-extrabold'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Inner Cockpit Grid */}
        <div className="p-4 sm:p-6 bg-slate-950 rounded-xl mt-2 space-y-6">
          {/* Audio-Visual Pulsing Alert & 15-Second Driver Acknowledgement Countdown */}
          {ambulanceStatus === 'alerted' && (
            <div className="p-5 rounded-xl bg-red-950/70 border-2 border-red-500 shadow-2xl p0-glow-pulse flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                {/* 15s Countdown Ring */}
                <div className="relative flex items-center justify-center w-20 h-20 rounded-full border-4 border-red-500 bg-red-950 shadow-inner">
                  <div className="text-center font-mono">
                    <span className="text-2xl font-black text-white">{countdown}</span>
                    <span className="text-[9px] block text-red-300 font-bold uppercase">SEC</span>
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono text-[10px] font-extrabold tracking-wider uppercase">
                      CRITICAL DRIVER TIMEOUT
                    </span>
                    <span className="text-xs font-mono text-red-300">
                      CAD AUTO-ESCALATION IN {countdown}s
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    CRITICAL COLLISION TICKET: {activeIncident?.code}
                  </h3>
                  <p className="text-xs text-slate-300 font-mono">
                    High-energy mechanism confirmed. Automatic dispatch to secondary unit if not accepted within 15 seconds.
                  </p>
                </div>
              </div>

              {/* Big Glowing ACCEPT DISPATCH Button */}
              <button
                onClick={acceptDispatch}
                className="w-full md:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-sm tracking-wider uppercase shadow-2xl shadow-red-950/80 border-2 border-white/30 transform active:scale-95 transition-all flex items-center justify-center gap-3 animate-bounce"
              >
                <Zap className="w-5 h-5 fill-white" />
                <span>ACCEPT DISPATCH & ENGAGE SIREN</span>
              </button>
            </div>
          )}

          {/* Active Navigation & Telemetry HUD Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono">
              <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                Target Locus
              </span>
              <div className="text-sm font-bold text-white mt-1 truncate">
                {activeIncident ? activeIncident.zoneDetails.name : zone.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {activeIncident ? activeIncident.zoneDetails.subTitle : zone.subTitle}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono">
              <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Estimated Arrival (ETA)
              </span>
              <div className="text-xl font-black text-amber-400 mt-1">
                {ambulanceStatus === 'arrived' ? '00:00 (ON SITE)' : formatEta(ambulanceEtaSeconds)}
              </div>
              <div className="text-[10px] text-slate-400">
                Distance: <strong className="text-white">{distanceKm} km</strong>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono">
              <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                In-Cab Speedometer
              </span>
              <div className="text-xl font-black text-white mt-1">
                {ambulanceStatus === 'en_route' ? '88 km/h' : ambulanceStatus === 'arrived' ? '0 km/h' : '0 km/h (PARKED)'}
              </div>
              <div className="text-[10px] text-emerald-400 font-bold">
                {ambulanceStatus === 'en_route' ? 'GREEN WAVE OVERRIDE ENGAGED' : 'STANDBY'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono">
              <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-red-400" />
                Triage / Trauma Severity
              </span>
              <div className="text-xl font-black text-red-400 mt-1">
                CSI: {activeIncident ? activeIncident.csi : '0.0'} <span className="text-xs text-slate-500">/ 5.0</span>
              </div>
              <div className="text-[10px] text-red-300">
                {activeIncident ? `${activeIncident.trappedVictims} VICTIMS TRAPPED` : 'NO ACTIVE INCIDENT'}
              </div>
            </div>
          </div>

          {/* Center Split: 5-Second Video Replay Buffer (Left) + Paramedic Clinical Checklist (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: 5-Second Simulated Video Replay Buffer */}
            <div className="lg:col-span-7 space-y-4">
              <VideoReplayBuffer scenarioKey={selectedZone} />

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

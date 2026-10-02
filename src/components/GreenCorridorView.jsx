import React, { useState } from 'react'
import {
  Navigation,
  Radio,
  Wifi,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Sliders,
  Car,
  Layers
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'
import { ZONES, SCENARIOS } from '../data/mockScenarios'
import { playButtonClick } from '../utils/audio'

export default function GreenCorridorView() {
  const {
    activeIncident,
    selectedZone,
    greenCorridorActive,
    toggleGreenCorridor,
    ambulanceStatus,
    corridorProgress,
    ambulanceEtaSeconds,
    distanceKm,
    soundEnabled,
  } = useEmergencyStore()

  const zone = ZONES[selectedZone]
  const scenario = SCENARIOS[selectedZone]
  const [forceAllGreen, setForceAllGreen] = useState(false)

  const signals = scenario.signals || []

  const handleToggleCorridor = () => {
    if (soundEnabled) playButtonClick()
    toggleGreenCorridor()
  }

  const handleForceAll = () => {
    if (soundEnabled) playButtonClick()
    setForceAllGreen(!forceAllGreen)
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: ATCS / ITMS Preemption Status */}
      <div
        className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all shadow-xl ${
          greenCorridorActive
            ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/70 border-emerald-500/80 shadow-emerald-950/50'
            : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-xl border flex items-center justify-center ${
              greenCorridorActive
                ? 'bg-emerald-600/30 border-emerald-500 text-emerald-400 animate-pulse'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
          >
            <Navigation className="w-8 h-8" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold tracking-wider ${
                  greenCorridorActive ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {greenCorridorActive ? 'GREEN CORRIDOR PREEMPTION ACTIVE' : 'CORRIDOR INACTIVE'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                B-TRAC / NHAI ITMS PROTOCOL
              </span>
            </div>
            <h2 className="text-lg font-black text-white mt-1">
              Dynamic Green Wave Corridor: {zone.name}
            </h2>
            <p className="text-xs text-slate-300 font-mono">
              Vehicle Transponder: <strong className="text-cyan-400">{zone.ambulanceBase.split(' ')[0]}</strong> • Lead Trigger: 250m C-V2X Geo-fence
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleToggleCorridor}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              greenCorridorActive
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/60'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>{greenCorridorActive ? 'CORRIDOR ENGAGED' : 'ENGAGE CORRIDOR'}</span>
          </button>

          <button
            onClick={handleForceAll}
            className={`px-3.5 py-2.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
              forceAllGreen
                ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            {forceAllGreen ? 'ALL SIGNALS HELD GREEN' : 'FORCE FLUSH SIGNALS'}
          </button>
        </div>
      </div>

      {/* Visual Corridor Track Animation */}
      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono">
          <span className="text-slate-300 font-bold uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            C-V2X (Cellular V2X) Preemption Aura Simulation (250m Ahead)
          </span>
          <span className="text-slate-400">
            DSRC 5.9 GHz • SPaT / BSM 10 Hz Telemetry
          </span>
        </div>

        {/* Interactive Road Track Canvas / SVG Visualizer */}
        <div className="relative py-8 px-4 bg-slate-900/60 rounded-xl border border-slate-800/80 overflow-hidden">
          {/* Background grid lines */}
          <div className="absolute inset-0 bg-grid-tactical opacity-40 pointer-events-none" />

          {/* Road Track Line */}
          <div className="relative h-16 flex items-center">
            {/* The Asphalt strip */}
            <div className="absolute w-full h-8 bg-slate-800 rounded-lg border-y border-slate-700 overflow-hidden">
              {/* Center dashed line */}
              <div className="w-full h-full border-b border-dashed border-yellow-500/50 mt-[-1px]" />
            </div>

            {/* Green Corridor Wave Highlight */}
            {greenCorridorActive && (
              <div
                className="absolute h-8 bg-gradient-to-r from-emerald-500/30 via-emerald-400/40 to-transparent rounded-lg border-y border-emerald-400/80 transition-all duration-500"
                style={{ width: `${Math.min(100, corridorProgress + 25)}%` }}
              />
            )}

            {/* Traffic Signal Nodes along the Track */}
            {signals.map((sig, idx) => {
              const leftPercent = 15 + idx * 26
              const isPreempted =
                forceAllGreen || (greenCorridorActive && corridorProgress + 20 >= leftPercent)

              return (
                <div
                  key={sig.id}
                  className="absolute flex flex-col items-center -top-6 transform -translate-x-1/2 cursor-pointer group"
                  style={{ left: `${leftPercent}%` }}
                >
                  {/* Traffic Light Miniature */}
                  <div
                    className={`p-1.5 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                      isPreempted
                        ? 'bg-emerald-950 border-emerald-500 shadow-lg shadow-emerald-500/30'
                        : 'bg-slate-900 border-slate-700'
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full transition-all ${
                        isPreempted ? 'bg-slate-800' : 'bg-red-500 animate-pulse'
                      }`}
                    />
                    <span className="w-3 h-3 rounded-full bg-slate-800" />
                    <span
                      className={`w-3 h-3 rounded-full transition-all ${
                        isPreempted ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400' : 'bg-slate-800'
                      }`}
                    />
                  </div>

                  {/* Signal Node Label */}
                  <div className="mt-2 text-center font-mono">
                    <span
                      className={`text-[10px] font-bold block transition-colors ${
                        isPreempted ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      {sig.id}
                    </span>
                    <span className="text-[9px] text-slate-500 block truncate max-w-[80px]">
                      {sig.name.split(' ')[0]}
                    </span>
                  </div>
                </div>
              )
            })}

            {/* Ambulance Marker Moving Along Track */}
            <div
              className="absolute z-20 flex flex-col items-center -top-5 transform -translate-x-1/2 transition-all duration-700"
              style={{ left: `${Math.max(4, Math.min(94, corridorProgress))}%` }}
            >
              {/* 250m Preemption Radar Aura Wave */}
              {greenCorridorActive && (
                <div className="absolute w-24 h-24 rounded-full bg-emerald-500/15 border border-emerald-400/50 animate-ping pointer-events-none" />
              )}

              {/* Ambulance vehicle chip */}
              <div className="relative p-2 rounded-xl bg-amber-500 text-slate-950 shadow-2xl border-2 border-white flex items-center justify-center font-bold">
                <Car className="w-5 h-5 fill-current" />
              </div>
              <span className="mt-1 px-1.5 py-0.2 rounded bg-amber-950 border border-amber-800 text-amber-300 font-mono text-[9px] font-bold whitespace-nowrap">
                108 ALS ({ambulanceStatus === 'arrived' ? 'ON SCENE' : '88 km/h'})
              </span>
            </div>
          </div>
        </div>

        {/* Signals Status Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {signals.map((sig, idx) => {
            const leftPercent = 15 + idx * 26
            const isPreempted =
              forceAllGreen || (greenCorridorActive && corridorProgress + 20 >= leftPercent)

            return (
              <div
                key={sig.id}
                className={`p-4 rounded-xl border space-y-3 font-mono text-xs transition-all ${
                  isPreempted
                    ? 'bg-emerald-950/20 border-emerald-500/80 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-slate-200">{sig.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isPreempted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isPreempted ? 'GREEN WAVE LOCKED' : 'STANDARD CYCLE'}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-100 text-xs truncate" title={sig.name}>
                    {sig.name}
                  </h4>
                  <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                    <span>Distance: <strong className="text-white">{sig.distance}</strong></span>
                    <span>Hold: <strong className="text-emerald-400">{isPreempted ? sig.timer : '--'}</strong></span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Preemption: <strong>{isPreempted ? '250m V2I Lock' : 'Standby'}</strong></span>
                  <span className={isPreempted ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {isPreempted ? 'CLEAR 0s DELAY' : 'Cycling'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Live C-V2X Packet Log Preview */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <Wifi className="w-3.5 h-3.5" />
              C-V2X (IEEE 1609.2 / SAE J2735) BROADCAST METRICS
            </span>
            <span>RADIO: 5855-5925 MHz (ITS BAND)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
            <div className="p-2 rounded bg-slate-950 border border-slate-850">
              <span className="text-[10px] text-slate-500 block">SPaT PACKETS</span>
              <span className="font-bold text-emerald-400">10.0 Hz (Continuous)</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-850">
              <span className="text-[10px] text-slate-500 block">SECURITY SIGNATURE</span>
              <span className="font-bold text-cyan-400">ECDSA NIST P-256</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-850">
              <span className="text-[10px] text-slate-500 block">PREEMPTION LATENCY</span>
              <span className="font-bold text-white">4.2 ms (URLLC)</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-850">
              <span className="text-[10px] text-slate-500 block">CROSS-TRAFFIC HOLD</span>
              <span className="font-bold text-amber-400">All Red Armed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

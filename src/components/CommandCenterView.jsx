import React from 'react'
import {
  Zap,
  Activity,
  Gauge,
  Volume2,
  Wifi,
  Eye,
  AlertTriangle,
  Car,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  CheckCircle2,
  Flame,
  Radio,
  ExternalLink,
  Camera,
  RotateCcw
} from 'lucide-react'
import TacticalMap from './TacticalMap'
import { useEmergencyStore } from '../store/emergencyStore'
import { ZONES, SCENARIOS } from '../data/mockScenarios'
import { playButtonClick } from '../utils/audio'

export default function CommandCenterView() {
  const {
    activeIncident,
    selectedZone,
    setZone,
    triggerIncident,
    resetSystem,
    ambulanceStatus,
    soundEnabled,
    setActiveTab,
  } = useEmergencyStore()

  const zone = ZONES[selectedZone]
  const scenario = SCENARIOS[selectedZone]

  const handleTrigger = (zoneKey) => {
    if (soundEnabled) playButtonClick()
    triggerIncident(zoneKey)
  }

  const handleReset = () => {
    if (soundEnabled) playButtonClick()
    resetSystem()
  }

  return (
    <div className="space-y-6">
      {/* View 1 Top Bar: System Status, Active Terrain Selector & Network Status */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            ALL SENSOR POLES OPERATIONAL
          </span>

          <span className="text-slate-400 flex items-center gap-1 px-2.5 py-1 rounded bg-slate-950 border border-slate-850">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <span>NETWORK: <strong>{zone.id === 'ghat' ? 'LoRaWAN FAILOVER' : '4G LTE / 5G SA'}</strong></span>
          </span>
        </div>

        {/* Active Terrain Selector */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar">
          <span className="text-slate-500 uppercase text-[10px] font-bold mr-1 shrink-0">TERRAIN:</span>
          {Object.keys(ZONES).map((zKey) => (
            <button
              key={zKey}
              onClick={() => {
                if (soundEnabled) playButtonClick()
                setZone(zKey)
              }}
              className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                selectedZone === zKey
                  ? 'bg-slate-800 text-white border border-slate-650 shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-850'
              }`}
            >
              {zKey === 'highway' ? 'Highways (NH-275)' : zKey === 'urban' ? 'Urban (Silk Board)' : 'Ghats (Charmadi)'}
            </button>
          ))}
        </div>
      </div>

      {/* Incident Alert if Active, else Idle Monitoring Banner */}
      {activeIncident ? (
        <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-red-950/90 via-slate-900 to-red-950/70 border-2 border-red-500/80 p0-glow-pulse shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 sm:p-3 bg-red-600/30 rounded-xl border border-red-500 flex items-center justify-center animate-pulse shrink-0 mt-1 sm:mt-0">
              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono font-extrabold text-[10px] sm:text-xs tracking-wider">
                  P0 ACTIVE CRASH
                </span>
                <span className="text-[11px] sm:text-xs font-mono text-red-300">
                  {activeIncident.incidentId}
                </span>
                <span className="text-[11px] sm:text-xs font-mono text-slate-400">
                  {activeIncident.timestamp}
                </span>
              </div>
              <h2 className="text-sm sm:text-lg font-bold text-white mt-1 leading-snug">
                {activeIncident.title}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300 font-mono mt-0.5">
                <span className="text-white font-semibold">{activeIncident.zoneDetails.name}</span> ({activeIncident.zoneDetails.curveMarker})
              </p>
            </div>
          </div>

          <div className="w-full md:w-auto grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-center">
              <div className="text-[9px] sm:text-[10px] text-slate-400 font-mono uppercase">Severity</div>
              <div className="text-base sm:text-lg font-black text-red-400 font-mono">
                {activeIncident.csi} <span className="text-[10px] text-slate-500">/ 5.0</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-center">
              <div className="text-[9px] sm:text-[10px] text-slate-400 font-mono uppercase">Victims</div>
              <div className="text-base sm:text-lg font-black text-amber-400 font-mono">
                {activeIncident.casualtiesCount} <span className="text-[10px] text-red-400">({activeIncident.trappedVictims} trapped)</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('ambulance')}
              className="col-span-2 sm:col-span-1 min-h-[48px] px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/60 transition-all active:scale-95"
            >
              <span>IN-CAB CONSOLE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs font-mono shadow-lg">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div>
              <span className="text-slate-200 font-bold block sm:inline">
                ICCC IDLE MONITORING: ALL 3 OPERATIONAL ZONES ARMED
              </span>
              <span className="text-slate-500 hidden sm:inline"> • </span>
              <span className="text-slate-400 text-[11px] block sm:inline">
                Optical decel detection, directional acoustic mesh, and LoRaWAN failover live
              </span>
            </div>
          </div>

          <div className="text-slate-400 text-[11px]">
            Selected: <strong className="text-white">{zone.name}</strong>
          </div>
        </div>
      )}

      {/* Main Split Screen: Tactical Map (Left) + Live Stream of Node Metrics (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Interactive Map / Zone Canvas */}
        <div className="lg:col-span-7 space-y-4">
          <TacticalMap />

          {/* Zone Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase block">Terrain Classification</span>
              <span className="text-slate-200 font-semibold">{zone.terrainLabel}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase block">Assigned 108 Base</span>
              <span className="text-cyan-400 font-semibold truncate block" title={zone.ambulanceBase}>
                {zone.ambulanceBase.split(' ')[0]}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase block">Primary Trauma Center</span>
              <span className="text-emerald-400 font-semibold truncate block" title={zone.nearestHospital}>
                {zone.nearestHospital.split(' ')[0]}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase block">Camera / Sensor Node</span>
              <span className="text-amber-400 font-semibold">{zone.sensorNode}</span>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Live Stream of Node Metrics (Exact 4 Metrics) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Live Sensor Node Metrics Stream
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800 text-[10px] font-mono text-cyan-300">
                100 Hz SAMPLING
              </span>
            </div>

            {/* Metric 1: Optical Deceleration Delta (Delta-V) */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  Optical Deceleration Delta (&Delta;v)
                </span>
                <span className="font-mono font-bold text-white text-sm">
                  {activeIncident ? `${activeIncident.telemetry.deltaV} km/h` : '0 km/h (Nominal)'}
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ${
                    activeIncident ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-cyan-500'
                  }`}
                  style={{
                    width: activeIncident ? `${Math.min(100, (activeIncident.telemetry.deltaV / 90) * 100)}%` : '8%',
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Pre-Impact: {activeIncident ? activeIncident.telemetry.preImpactSpeed : `${zone.speedLimit} Free-flow`}</span>
                <span>Peak Decel: {activeIncident ? activeIncident.telemetry.gForce : '0.1 G'}</span>
              </div>
            </div>

            {/* Metric 2: Directional Audio dB Peak */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  Directional Audio dB Peak
                </span>
                <span className="font-mono font-bold text-white text-sm">
                  {activeIncident
                    ? `${activeIncident.telemetry.acousticPeakDb} dB SPL`
                    : `${zone.ambientDb} dB (Ambient)`}
                </span>
              </div>

              {/* Dynamic Sound Frequency Visualizer */}
              <div className="h-6 flex items-end gap-1 px-1 py-0.5 bg-slate-900/60 rounded">
                {[35, 42, 50, 68, activeIncident ? 96 : 30, activeIncident ? 100 : 40, activeIncident ? 88 : 25, 45, 30, 20].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t transition-all duration-300 ${
                      activeIncident && h > 70 ? 'bg-red-500' : 'bg-cyan-500/70'
                    }`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Threshold: 110 dB SPL</span>
                <span>Confidence: {activeIncident ? activeIncident.telemetry.opticalConfidence : '99.8% Nominal'}</span>
              </div>
            </div>

            {/* Metric 3: Road Surface Status */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <Car className="w-3.5 h-3.5 text-emerald-400" />
                  Road Surface Status
                </span>
                <span className="font-mono font-bold text-emerald-400 text-xs">
                  {activeIncident ? activeIncident.telemetry.roadSurface : zone.roadSurface}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Telemetry Pole Sensor: <strong className="text-slate-200">{zone.sensorNode}</strong>
              </div>
            </div>

            {/* Metric 4: Weather Condition */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  Weather Condition
                </span>
                <span className="font-mono font-bold text-cyan-300 text-xs">
                  {activeIncident ? activeIncident.telemetry.weatherCondition : zone.weatherCondition}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Environment: <strong className="text-slate-200">{zone.subTitle}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Simulator Action Bar */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-red-500 fill-red-500" />
              <span>Live Multi-Zone Crash Simulator Action Bar</span>
            </h3>
            <p className="text-xs text-slate-400">
              One-click simulation across three operational zones with instant telemetry spikes and C-V2X dispatch.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="min-h-[48px] px-4 py-2 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-700 text-slate-300 hover:text-white font-mono text-xs font-bold transition-all flex items-center gap-2 active:scale-95 shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All Systems</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {/* Action 1: Highway Multi-Vehicle Pileup */}
          <button
            onClick={() => handleTrigger('highway')}
            className={`min-h-[64px] p-3.5 sm:p-4 rounded-xl text-left border transition-all relative overflow-hidden group flex flex-col justify-between ${
              selectedZone === 'highway' && activeIncident
                ? 'bg-red-950/40 border-red-500 shadow-lg shadow-red-950/50'
                : 'bg-slate-950/90 hover:bg-slate-900 border-slate-800 hover:border-red-500/70'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 font-bold border border-red-800/60 text-[10px]">
                  ZONE 1: HIGHWAY
                </span>
                <span className="text-slate-400 font-bold text-[10px]">&gt;100 km/h</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-red-400 transition-colors leading-snug">
                Trigger Highway Multi-Vehicle Pileup (&gt;100 km/h)
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                NH-275 Ramanagara KM 42.4. Rear-end crash, 4 casualties, 2 trapped.
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>CSI: <strong className="text-white">4.8 / 5.0</strong></span>
              <span className="text-red-400 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                EXECUTE &rarr;
              </span>
            </div>
          </button>

          {/* Action 2: Urban Two-Wheeler Collision */}
          <button
            onClick={() => handleTrigger('urban')}
            className={`min-h-[64px] p-3.5 sm:p-4 rounded-xl text-left border transition-all relative overflow-hidden group flex flex-col justify-between ${
              selectedZone === 'urban' && activeIncident
                ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-950/50'
                : 'bg-slate-950/90 hover:bg-slate-900 border-slate-800 hover:border-amber-500/70'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="px-2 py-0.5 rounded bg-amber-600/20 text-amber-400 font-bold border border-amber-800/60 text-[10px]">
                  ZONE 2: URBAN
                </span>
                <span className="text-slate-400 font-bold text-[10px]">B-TRAC GRID</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors leading-snug">
                Trigger Urban Two-Wheeler / Pedestrian Collision
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                Silk Board Underpass. Pedestrian impact, critical head trauma risk.
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>CSI: <strong className="text-white">3.9 / 5.0</strong></span>
              <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                EXECUTE &rarr;
              </span>
            </div>
          </button>

          {/* Action 3: Ghat Blind-Turn Crash */}
          <button
            onClick={() => handleTrigger('ghat')}
            className={`min-h-[64px] p-3.5 sm:p-4 rounded-xl text-left border transition-all relative overflow-hidden group flex flex-col justify-between ${
              selectedZone === 'ghat' && activeIncident
                ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-950/50'
                : 'bg-slate-950/90 hover:bg-slate-900 border-slate-800 hover:border-blue-500/70'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 font-bold border border-blue-800/60 text-[10px]">
                  ZONE 3: GHAT
                </span>
                <span className="text-slate-400 font-bold text-[10px]">LoRaWAN</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-400 transition-colors leading-snug">
                Trigger Ghat Blind-Turn Crash (Acoustic + LoRaWAN)
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                Charmadi Hairpin #8. Zero 5G/4G, acoustic sensor guardrail breach, ravine.
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>CSI: <strong className="text-white">4.6 / 5.0</strong></span>
              <span className="text-blue-400 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                EXECUTE &rarr;
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

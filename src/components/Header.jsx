import React, { useState, useEffect } from 'react'
import {
  ShieldAlert,
  Radio,
  Volume2,
  VolumeX,
  RotateCcw,
  Zap,
  Activity,
  Layers,
  MapPin,
  Clock,
  ChevronDown,
  AlertTriangle,
  Server,
  Wifi,
  Navigation
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'
import { ZONES, SCENARIOS } from '../data/mockScenarios'
import { playButtonClick } from '../utils/audio'

export default function Header() {
  const {
    activeIncident,
    selectedZone,
    setZone,
    triggerIncident,
    resetSystem,
    soundEnabled,
    toggleSound,
    ambulanceStatus,
    activeTab,
    setActiveTab,
    greenCorridorActive,
  } = useEmergencyStore()

  const [currentTime, setCurrentTime] = useState('')
  const [showTriggerMenu, setShowTriggerMenu] = useState(false)

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      const timeStr = now.toLocaleTimeString('en-IN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      const millis = String(Math.floor(now.getMilliseconds() / 100))
      setCurrentTime(`${timeStr}.${millis} IST`)
    }
    updateClock()
    const timer = setInterval(updateClock, 100)
    return () => clearInterval(timer)
  }, [])

  const handleTabClick = (tab) => {
    if (soundEnabled) playButtonClick()
    setActiveTab(tab)
  }

  const handleTrigger = (scenarioKey) => {
    setShowTriggerMenu(false)
    triggerIncident(scenarioKey)
  }

  const currentZone = ZONES[selectedZone]

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-md sticky top-0 z-40">
      {/* Top Utility Bar: GovTech Brand & Live Telemetry Badge */}
      <div className="px-4 py-2 border-b border-slate-900 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            ALL 3 EDGE NODES OPERATIONAL
          </span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-300 hidden md:inline-flex items-center gap-1">
            <Wifi className="w-3 h-3 text-cyan-400" />
            5.9 GHz C-V2X MESH ACTIVE
          </span>
          <span className="text-slate-700 hidden md:inline">|</span>
          <span className="text-slate-400 hidden lg:inline-flex items-center gap-1">
            <Server className="w-3 h-3 text-amber-400" />
            LoRaWAN 865-867 MHz IN (India Band)
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentTime || '00:00:00.0 IST'}</span>
          </div>

          <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">State Transport Dept.</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
              KARNATAKA / MoRTH
            </span>
            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] font-bold">
              108 GVK-EMRI
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & System Nomenclature */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-amber-700 p-0.5 shadow-lg shadow-red-950/40">
            <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-red-500" />
            </div>
            {activeIncident && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                ResQ-Vision
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                  v2.6 PROTOTYPE
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Autonomous Multi-Modal Accident Triage & Emergency Response System
            </p>
          </div>
        </div>

        {/* Center: Active Zone Quick Switcher */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-1 text-xs">
          <span className="px-2.5 py-1 text-slate-400 text-[11px] font-semibold flex items-center gap-1 uppercase tracking-wider">
            <MapPin className="w-3 h-3 text-red-400" />
            Zone:
          </span>
          {Object.keys(ZONES).map((zKey) => {
            const z = ZONES[zKey]
            const isSelected = selectedZone === zKey
            return (
              <button
                key={zKey}
                onClick={() => {
                  if (soundEnabled) playButtonClick()
                  setZone(zKey)
                }}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-slate-800 text-white font-semibold shadow-inner border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                {zKey === 'highway' ? 'NH-275 Ramanagara' : zKey === 'urban' ? 'Silk Board BLR' : 'Charmadi Ghat'}
              </button>
            )
          })}
        </div>

        {/* Right Actions: Quick Incident Trigger, Reset & Audio */}
        <div className="flex items-center gap-2">
          {/* Quick Trigger Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTriggerMenu(!showTriggerMenu)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-950/50 transition-all border border-red-500 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>SIMULATE CRASH</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {showTriggerMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-2 text-xs">
                <div className="px-3 py-2 border-b border-slate-800 font-bold text-slate-300 flex items-center justify-between">
                  <span>DISPATCH SIMULATION TRIGGER</span>
                  <span className="text-[10px] text-red-400 font-mono">P0 PROTOCOL</span>
                </div>
                <div className="p-1 space-y-1">
                  <button
                    onClick={() => handleTrigger('highway')}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all group"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-200 group-hover:text-red-400">
                      <span>1. Highway Pileup (&gt;100 km/h)</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950/60 border border-red-800 text-red-400">NH-275</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">3 vehicles, trapped victims, high-speed kinetic impact</p>
                  </button>

                  <button
                    onClick={() => handleTrigger('urban')}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all group"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-200 group-hover:text-amber-400">
                      <span>2. Urban Two-Wheeler / Pedestrian</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-amber-400">Silk Board</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Critical head trauma, high pedestrian congestion grid</p>
                  </button>

                  <button
                    onClick={() => handleTrigger('ghat')}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all group"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-200 group-hover:text-blue-400">
                      <span>3. Ghat Fog Crash (LoRaWAN Trigger)</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-800 text-blue-400">Charmadi</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Zero cellular signal, acoustic spike & guardrail breach</p>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              if (!soundEnabled) playButtonClick()
              toggleSound()
            }}
            title={soundEnabled ? 'Mute Alert Audio' : 'Unmute Alert Audio'}
            className={`p-2 rounded-lg border text-xs transition-colors ${
              soundEnabled
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                : 'bg-red-950/40 border-red-800/60 text-red-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Reset System */}
          <button
            onClick={() => {
              if (soundEnabled) playButtonClick()
              resetSystem()
            }}
            title="Reset system to idle state"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="px-4 bg-slate-950 border-t border-slate-900 flex overflow-x-auto no-scrollbar gap-1 text-xs">
        <button
          onClick={() => handleTabClick('command')}
          className={`flex items-center gap-2 py-2.5 px-4 font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'command'
              ? 'border-red-500 text-red-400 bg-red-950/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>ICCC Command Center</span>
        </button>

        <button
          onClick={() => handleTabClick('ambulance')}
          className={`flex items-center gap-2 py-2.5 px-4 font-semibold border-b-2 transition-all relative whitespace-nowrap ${
            activeTab === 'ambulance'
              ? 'border-red-500 text-red-400 bg-red-950/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>P0 Ambulance In-Cab Console</span>
          {ambulanceStatus === 'alerted' && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabClick('hospital')}
          className={`flex items-center gap-2 py-2.5 px-4 font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'hospital'
              ? 'border-red-500 text-red-400 bg-red-950/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Trauma Hospital Bay Intake</span>
          {activeIncident && (
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-red-900/60 text-red-300 font-mono">
              P0 ACTIVE
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabClick('corridor')}
          className={`flex items-center gap-2 py-2.5 px-4 font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'corridor'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-950/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Dynamic Green Corridor</span>
          {greenCorridorActive && (
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-900/60 text-emerald-300 font-mono">
              PREEMPTION ON
            </span>
          )}
        </button>
      </div>
    </header>
  )
}

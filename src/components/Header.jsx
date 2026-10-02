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
import { ZONES } from '../data/mockScenarios'
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

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-md sticky top-0 z-40">
      {/* Top Utility Bar: GovTech Brand & Live Telemetry Badge */}
      <div className="px-3 sm:px-4 py-1.5 sm:py-2 border-b border-slate-900 flex items-center justify-between text-[11px] sm:text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2 sm:gap-3 truncate">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold tracking-wider shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline">ALL 3 EDGE NODES OPERATIONAL</span>
            <span className="sm:hidden">3 NODES ONLINE</span>
          </span>
          <span className="text-slate-700 hidden md:inline">|</span>
          <span className="text-slate-300 hidden md:inline-flex items-center gap-1">
            <Wifi className="w-3 h-3 text-cyan-400" />
            5.9 GHz C-V2X MESH ACTIVE
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="flex items-center gap-1 text-slate-300">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
            <span>{currentTime || '00:00:00.0 IST'}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 border-l border-slate-800 pl-3">
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
      <div className="px-3 sm:px-4 py-2 sm:py-3 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        {/* Logo & System Nomenclature */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-red-600 to-amber-700 p-0.5 shadow-lg shadow-red-950/40 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
            </div>
            {activeIncident && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80"></span>
                <span className="relative inline-flex rounded-full h-full w-full bg-red-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                ResQ-Vision
                <span className="text-[9px] sm:text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-300">
                  v2.6
                </span>
              </h1>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate max-w-[200px] sm:max-w-none">
              Autonomous Accident Triage & Response
            </p>
          </div>
        </div>

        {/* Desktop Active Zone Quick Switcher */}
        <div className="hidden lg:flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-1 text-xs">
          <span className="px-2 py-1 text-slate-400 text-[11px] font-semibold flex items-center gap-1 uppercase tracking-wider">
            <MapPin className="w-3 h-3 text-red-400" />
            Zone:
          </span>
          {Object.keys(ZONES).map((zKey) => {
            const isSelected = selectedZone === zKey
            return (
              <button
                key={zKey}
                onClick={() => {
                  if (soundEnabled) playButtonClick()
                  setZone(zKey)
                }}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-slate-800 text-white font-semibold shadow-inner border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {zKey === 'highway' ? 'NH-275 Ramanagara' : zKey === 'urban' ? 'Silk Board BLR' : 'Charmadi Ghat'}
              </button>
            )
          })}
        </div>

        {/* Right Actions: Quick Incident Trigger, Reset & Audio */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Trigger Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTriggerMenu(!showTriggerMenu)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-950/50 transition-all border border-red-500 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>SIMULATE</span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>

            {showTriggerMenu && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-2 text-xs">
                <div className="px-3 py-2 border-b border-slate-800 font-bold text-slate-300 flex items-center justify-between">
                  <span>DISPATCH SIMULATION TRIGGER</span>
                  <span className="text-[10px] text-red-400 font-mono">P0 PROTOCOL</span>
                </div>
                <div className="p-1 space-y-1">
                  <button
                    onClick={() => handleTrigger('highway')}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all group"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-200 group-hover:text-red-400">
                      <span>1. Highway Pileup (&gt;100 km/h)</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950/60 border border-red-800 text-red-400">NH-275</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">3 vehicles, trapped victims, high-speed impact</p>
                  </button>

                  <button
                    onClick={() => handleTrigger('urban')}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all group"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-200 group-hover:text-amber-400">
                      <span>2. Urban Two-Wheeler / Pedestrian</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950/60 border border-amber-800 text-amber-400">Silk Board</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Critical head trauma, high congestion grid</p>
                  </button>

                  <button
                    onClick={() => handleTrigger('ghat')}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all group"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-200 group-hover:text-blue-400">
                      <span>3. Ghat Fog Crash (LoRaWAN)</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-950/60 border border-blue-800 text-blue-400">Charmadi</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Zero cellular signal, acoustic guardrail breach</p>
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
            className={`p-1.5 sm:p-2 rounded-lg border text-xs transition-colors ${
              soundEnabled
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                : 'bg-red-950/40 border-red-800/60 text-red-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* Reset System */}
          <button
            onClick={() => {
              if (soundEnabled) playButtonClick()
              resetSystem()
            }}
            title="Reset system to idle state"
            className="p-1.5 sm:px-3 sm:py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Mobile-Friendly Active Zone Scroll Strip (Visible on Mobile & Tablets) */}
      <div className="lg:hidden px-3 py-1.5 bg-slate-900/60 border-t border-slate-900 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
        <span className="text-slate-500 text-[10px] uppercase font-bold shrink-0 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-red-400" /> Zone:
        </span>
        {Object.keys(ZONES).map((zKey) => {
          const isSelected = selectedZone === zKey
          return (
            <button
              key={zKey}
              onClick={() => {
                if (soundEnabled) playButtonClick()
                setZone(zKey)
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-slate-800 text-white font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {zKey === 'highway' ? 'NH-275 Ramanagara' : zKey === 'urban' ? 'Silk Board BLR' : 'Charmadi Ghat'}
            </button>
          )
        })}
      </div>

      {/* Responsive Navigation Tabs Bar */}
      <div className="px-2 sm:px-4 bg-slate-950 border-t border-slate-900 flex overflow-x-auto no-scrollbar gap-1 text-xs">
        <button
          onClick={() => handleTabClick('command')}
          className={`flex items-center gap-1.5 sm:gap-2 py-2.5 px-3 sm:px-4 font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'command'
              ? 'border-red-500 text-red-400 bg-red-950/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>
            <span className="sm:hidden">Command</span>
            <span className="hidden sm:inline">ICCC Command Center</span>
          </span>
        </button>

        <button
          onClick={() => handleTabClick('ambulance')}
          className={`flex items-center gap-1.5 sm:gap-2 py-2.5 px-3 sm:px-4 font-semibold border-b-2 transition-all relative whitespace-nowrap ${
            activeTab === 'ambulance'
              ? 'border-red-500 text-red-400 bg-red-950/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>
            <span className="sm:hidden">Ambulance</span>
            <span className="hidden sm:inline">P0 Ambulance Console</span>
          </span>
          {ambulanceStatus === 'alerted' && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabClick('hospital')}
          className={`flex items-center gap-1.5 sm:gap-2 py-2.5 px-3 sm:px-4 font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'hospital'
              ? 'border-red-500 text-red-400 bg-red-950/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>
            <span className="sm:hidden">Hospital</span>
            <span className="hidden sm:inline">Trauma Hospital Bay</span>
          </span>
          {activeIncident && (
            <span className="px-1 py-0.2 rounded text-[9px] bg-red-900/60 text-red-300 font-mono">
              P0
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabClick('corridor')}
          className={`flex items-center gap-1.5 sm:gap-2 py-2.5 px-3 sm:px-4 font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'corridor'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-950/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>
            <span className="sm:hidden">Corridor</span>
            <span className="hidden sm:inline">Dynamic Green Corridor</span>
          </span>
          {greenCorridorActive && (
            <span className="px-1 py-0.2 rounded text-[9px] bg-emerald-900/60 text-emerald-300 font-mono">
              ACTIVE
            </span>
          )}
        </button>
      </div>
    </header>
  )
}

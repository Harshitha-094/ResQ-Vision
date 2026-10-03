import React, { useEffect } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  Clock,
  Info,
  Ambulance,
  Shield,
  Building2,
  Activity,
  CreditCard
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'
import { SIMULATION_STAGES } from '../data/mockScenarios'

export default function DemoModePanel() {
  const {
    demoPanelOpen,
    setDemoPanelOpen,
    simulationStage,
    setSimulationStage,
    nextSimulationStage,
    prevSimulationStage,
    isAutoPlaying,
    toggleAutoPlay,
    incidents,
    policeState,
    hospitalState,
    trafficState,
    tollState
  } = useEmergencyStore()

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!demoPanelOpen) return
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return

      if (e.code === 'ArrowRight' || e.code === 'Space') {
        e.preventDefault()
        nextSimulationStage()
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault()
        prevSimulationStage()
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        setSimulationStage(1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [demoPanelOpen, nextSimulationStage, prevSimulationStage, setSimulationStage])

  if (!demoPanelOpen) return null

  const activeStageInfo = SIMULATION_STAGES.find(s => s.stage === simulationStage) || SIMULATION_STAGES[0]

  return (
    <div className="bg-slate-900 border-b border-amber-900/50 p-3 sm:p-4 text-xs text-slate-200 select-none shadow-md">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300 font-mono text-[11px] font-bold">
              DEMO SIMULATION
            </span>
            <span className="font-semibold text-slate-200">
              Emergency Workflow Lifecycle (12 Stages)
            </span>
            <span className="text-slate-400 text-[11px] hidden sm:inline">
              · For Academic & Product Demonstration
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Step Controls */}
            <div className="flex items-center rounded border border-slate-700 bg-slate-950 overflow-hidden text-xs">
              <button
                onClick={prevSimulationStage}
                disabled={simulationStage <= 1}
                className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent flex items-center gap-1 border-r border-slate-800"
                title="Previous Stage"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>
              <button
                onClick={toggleAutoPlay}
                className={`px-2.5 py-1 flex items-center gap-1 transition-colors ${
                  isAutoPlaying ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title={isAutoPlaying ? 'Pause Simulation' : 'Auto-Play Simulation (5s/stage)'}
              >
                {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isAutoPlaying ? 'Pause' : 'Auto-Play'}</span>
              </button>
              <button
                onClick={nextSimulationStage}
                disabled={simulationStage >= 12}
                className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent flex items-center gap-1 border-l border-slate-800"
                title="Next Stage"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setSimulationStage(1)}
              className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"
              title="Reset to Stage 1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setDemoPanelOpen(false)}
              className="p-1 rounded text-slate-400 hover:text-slate-200"
              title="Close Demo Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Active Stage Summary */}
        <div className="bg-slate-950/80 border border-slate-800 rounded p-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-amber-400 text-sm">
              Stage {activeStageInfo.stage}/12:
            </span>
            <span className="font-semibold text-slate-100">
              {activeStageInfo.title}
            </span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {activeStageInfo.description}
          </p>
        </div>

        {/* 5-Agency Live Response Status Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] font-mono">
          <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center gap-2">
            <Ambulance className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 uppercase block">Ambulance</span>
              <span className="text-slate-200 font-semibold truncate block">
                {simulationStage >= 12 ? 'Completed' : simulationStage >= 9 ? 'Transporting' : simulationStage >= 7 ? 'Arrived' : simulationStage >= 6 ? 'En route' : simulationStage >= 3 ? 'Accepted' : simulationStage >= 2 ? 'Alerted' : 'Searching'}
              </span>
            </div>
          </div>

          <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 uppercase block">Hospital</span>
              <span className="text-slate-200 font-semibold truncate block">
                {simulationStage >= 11 ? 'Ready for Arrival' : simulationStage >= 10 ? 'Preparing Bay' : simulationStage >= 9 ? "St. John's Selected" : 'Standby'}
              </span>
            </div>
          </div>

          <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 uppercase block">Police</span>
              <span className="text-slate-200 font-semibold truncate block">
                {policeState.status || (simulationStage >= 7 ? 'Arrived' : simulationStage >= 5 ? 'Dispatched' : 'Alerted')}
              </span>
            </div>
          </div>

          <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 uppercase block">Traffic</span>
              <span className="text-slate-200 font-semibold truncate block">
                {simulationStage >= 6 ? 'Green Wave Priority' : 'Advisory Active'}
              </span>
            </div>
          </div>

          <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center gap-2 col-span-2 sm:col-span-1">
            <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 uppercase block">Toll</span>
              <span className="text-slate-200 font-semibold truncate block">
                {tollState.emergencyLaneOpen ? 'Lane #1 Fast-Lift' : 'Standby'}
              </span>
            </div>
          </div>
        </div>

        {/* 12-Stage Stepper Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1.5">
          {SIMULATION_STAGES.map((s) => {
            const isCurrent = s.stage === simulationStage
            const isCompleted = s.stage < simulationStage

            return (
              <button
                key={s.stage}
                onClick={() => setSimulationStage(s.stage)}
                className={`p-1.5 rounded text-left transition-all border ${
                  isCurrent
                    ? 'bg-amber-950/80 border-amber-500 text-white shadow-xs font-semibold'
                    : isCompleted
                    ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    : 'bg-slate-950/30 border-slate-900 text-slate-400 hover:border-slate-800'
                }`}
                title={`Jump to Stage ${s.stage}: ${s.title}`}
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="font-mono text-[10px] text-slate-400">#{s.stage}</span>
                  {isCompleted && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />}
                </div>
                <div className="text-[10px] truncate leading-tight">
                  {s.title}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

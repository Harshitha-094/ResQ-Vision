import React, { useEffect } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
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
    policeState,
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
    <div className="bg-white border-b border-slate-200 p-3 sm:p-4 text-xs text-slate-800 select-none shadow-xs">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-mono text-[11px] font-bold">
              DEMO SIMULATION
            </span>
            <span className="font-semibold text-slate-900">
              Emergency Workflow Lifecycle (12 Stages)
            </span>
            <span className="text-slate-500 text-xs hidden sm:inline">
              · For Academic & Product Demonstration
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Step Controls */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden text-xs shadow-2xs">
              <button
                onClick={prevSimulationStage}
                disabled={simulationStage <= 1}
                className="px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent flex items-center gap-1 border-r border-slate-200 cursor-pointer font-medium"
                title="Previous Stage"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>
              <button
                onClick={toggleAutoPlay}
                className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer font-medium ${
                  isAutoPlaying ? 'bg-amber-500 text-white' : 'text-slate-700 hover:bg-slate-50'
                }`}
                title={isAutoPlaying ? 'Pause Simulation' : 'Auto-Play Simulation (5s/stage)'}
              >
                {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isAutoPlaying ? 'Pause' : 'Auto-Play'}</span>
              </button>
              <button
                onClick={nextSimulationStage}
                disabled={simulationStage >= 12}
                className="px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent flex items-center gap-1 border-l border-slate-200 cursor-pointer font-medium"
                title="Next Stage"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setSimulationStage(1)}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer transition-colors shadow-2xs"
              title="Reset to Stage 1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setDemoPanelOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
              title="Close Demo Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Active Stage Summary */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-blue-700 text-xs px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
              Stage {activeStageInfo.stage}/12
            </span>
            <span className="font-semibold text-slate-900">
              {activeStageInfo.title}
            </span>
          </div>
          <p className="text-slate-600 text-xs leading-relaxed max-w-2xl">
            {activeStageInfo.description}
          </p>
        </div>

        {/* 5-Agency Live Response Status Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center gap-2 shadow-2xs">
            <Ambulance className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Ambulance</span>
              <span className="text-slate-900 font-semibold truncate block">
                {simulationStage >= 12 ? 'Completed' : simulationStage >= 9 ? 'Transporting' : simulationStage >= 7 ? 'Arrived' : simulationStage >= 6 ? 'En route' : simulationStage >= 3 ? 'Accepted' : simulationStage >= 2 ? 'Alerted' : 'Searching'}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center gap-2 shadow-2xs">
            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Hospital</span>
              <span className="text-slate-900 font-semibold truncate block">
                {simulationStage >= 11 ? 'Ready for Arrival' : simulationStage >= 10 ? 'Preparing Bay' : simulationStage >= 9 ? "St. John's Selected" : 'Standby'}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center gap-2 shadow-2xs">
            <Shield className="w-4 h-4 text-slate-700 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Police</span>
              <span className="text-slate-900 font-semibold truncate block">
                {policeState.status || (simulationStage >= 7 ? 'Arrived' : simulationStage >= 5 ? 'Dispatched' : 'Alerted')}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center gap-2 shadow-2xs">
            <Activity className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Traffic</span>
              <span className="text-slate-900 font-semibold truncate block">
                {simulationStage >= 6 ? 'Green Priority' : 'Advisory Active'}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center gap-2 col-span-2 sm:col-span-1 shadow-2xs">
            <CreditCard className="w-4 h-4 text-slate-600 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Toll</span>
              <span className="text-slate-900 font-semibold truncate block">
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
                className={`p-2 rounded-lg text-left transition-all border cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-600 border-blue-600 text-white font-semibold shadow-2xs'
                    : isCompleted
                    ? 'bg-blue-50/60 border-blue-200 text-slate-800 hover:border-blue-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
                title={`Jump to Stage ${s.stage}: ${s.title}`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className={`font-mono text-[10px] ${isCurrent ? 'text-blue-100' : 'text-slate-500'}`}>
                    #{s.stage}
                  </span>
                  {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                </div>
                <div className="text-[11px] truncate leading-tight font-medium">
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

import React from 'react'
import {
  Activity,
  HeartPulse,
  Clock,
  Bed,
  Droplet,
  Scan,
  Users,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Server,
  Stethoscope,
  Wind
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'
import { ZONES } from '../data/mockScenarios'
import { playButtonClick } from '../utils/audio'

export default function HospitalBayView() {
  const {
    activeIncident,
    selectedZone,
    ambulanceStatus,
    ambulanceEtaSeconds,
    hospitalStatus,
    toggleHospitalResource,
    soundEnabled,
  } = useEmergencyStore()

  const zone = ZONES[selectedZone]

  const formatEta = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`
  }

  const handleToggle = (key) => {
    if (soundEnabled) playButtonClick()
    toggleHospitalResource(key)
  }

  const resources = [
    {
      key: 'bayReserved',
      title: 'Trauma Bay 1 Reserved',
      subtitle: 'Critical Resuscitation Red Zone Suite',
      description: 'Dedicated negative-pressure suite with crash cart, defibrillator, & arterial line monitor.',
      icon: Bed,
      color: 'text-rose-400',
    },
    {
      key: 'bloodCrossMatched',
      title: 'O-Negative Blood Units Cross-Matched',
      subtitle: 'Emergency Blood Bank Rapid Release',
      description: '4 units PRBC cross-matched and loaded into blood warmer for incoming polytrauma.',
      icon: Droplet,
      color: 'text-red-400',
    },
    {
      key: 'surgicalTeamNotified',
      title: 'Surgical Team Notified',
      subtitle: 'On-Call Trauma & Neurotrauma Surgeons',
      description: 'Trauma surgery chief, orthopedic surgeon, and anesthesiologist mobilized to trauma bay.',
      icon: Users,
      color: 'text-blue-400',
    },
  ]

  const securedCount = Object.values(hospitalStatus).filter(Boolean).length
  const totalCount = resources.length
  const readinessPercent = Math.round((securedCount / totalCount) * 100)

  // Color-coded CSI meter helper
  const getCsiColor = (csi) => {
    if (!csi || csi < 3.0) return { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500' }
    if (csi < 4.0) return { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500' }
    return { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500' }
  }

  const csiColors = getCsiColor(activeIncident?.csi)

  return (
    <div className="space-y-6">
      {/* Top Header: Hospital Identification & Regional Hub Banner */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono">
            <span className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800 text-blue-400 font-bold">
              REGIONAL TRAUMA CENTER (ER INTAKE DESK)
            </span>
            <span className="text-slate-400 truncate">
              GOVERNMENT OF KARNATAKA HEALTH SYSTEM
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-white mt-1 flex flex-wrap items-center gap-2">
            <span>{zone.nearestHospital}</span>
            <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-normal">
              LEVEL-II EMERGENCY HUB
            </span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 font-mono truncate">
            Receiving Unit: <span className="text-cyan-400 font-bold">{zone.ambulanceBase}</span> • Channel: 108 GVK-EMRI EHR Hook
          </p>
        </div>

        {/* Live ETA Sync & Readiness Badges */}
        <div className="w-full md:w-auto grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3">
          <div className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 sm:px-4 py-2 sm:py-2.5 text-center font-mono">
            <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              Ambulance ETA
            </div>
            <div className="text-base sm:text-2xl font-black text-amber-400 truncate">
              {ambulanceStatus === 'arrived' ? 'ON SITE' : formatEta(ambulanceEtaSeconds)}
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-400 truncate">
              Status: <strong className="text-white uppercase">{ambulanceStatus.replace('_', ' ')}</strong>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 sm:px-4 py-2 sm:py-2.5 text-center font-mono">
            <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase">Readiness</div>
            <div className={`text-base sm:text-2xl font-black ${readinessPercent === 100 ? 'text-emerald-400' : 'text-blue-400'}`}>
              {readinessPercent}%
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-400 truncate">
              {securedCount}/{totalCount} Reserved
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Triage Ticket Card (Left) + One-Click Readiness Toggles (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Triage Ticket Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-500" />
                <h3 className="font-bold text-white uppercase tracking-wider">
                  Trauma Triage Ticket Card
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-red-600 text-white font-extrabold text-[10px]">
                PRIORITY 0 (P0)
              </span>
            </div>

            {/* CSI Color-Coded Risk Meter */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">Crash Severity Index (CSI 1-5):</span>
                <span className={`text-sm font-black ${csiColors.text}`}>
                  {activeIncident ? `${activeIncident.csi} / 5.0` : '1.0 / 5.0'}
                </span>
              </div>

              {/* Color-Coded Risk Meter Bar */}
              <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-700 ${csiColors.bg}`}
                  style={{ width: `${Math.min(100, ((activeIncident?.csi || 1.0) / 5) * 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span className="text-emerald-400">Low (1-2.9)</span>
                <span className="text-amber-400">Moderate (3.0-3.9)</span>
                <span className="text-red-400 font-bold">Critical (4.0-5.0)</span>
              </div>
            </div>

            {/* Casualty Count & Injury Risk Profile */}
            <div className="space-y-3 bg-slate-950 p-3.5 rounded-lg border border-slate-800/80">
              <div className="flex justify-between">
                <span className="text-slate-500">Incident Reference:</span>
                <span className="text-white font-bold">{activeIncident ? activeIncident.code : 'STANDBY'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Casualties:</span>
                <span className="text-white font-bold text-sm">
                  {activeIncident ? `${activeIncident.casualtiesCount} Casualties` : '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Casualty Breakdown:</span>
                <span className="text-red-300 font-semibold">
                  {activeIncident
                    ? `${activeIncident.casualtyBreakdown.criticalP0} Critical P0, ${activeIncident.casualtyBreakdown.seriousP1} Serious P1`
                    : 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Entrapment / Extrication:</span>
                <span className={activeIncident?.trappedVictims > 0 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                  {activeIncident ? `${activeIncident.trappedVictims} Victims Trapped (Hydraulics Active)` : 'No entrapment'}
                </span>
              </div>
            </div>

            {/* Primary Injury Risk Profile */}
            <div className="space-y-2 pt-1">
              <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Primary Injury Risk Profile
              </h4>
              <div className="space-y-1.5 text-[11px]">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-850 flex justify-between items-center">
                  <span className="text-slate-400">Head Trauma / TBI:</span>
                  <span className="text-red-400 font-bold">{activeIncident?.clinicalAssessment.headTraumaRisk || 'Nominal'}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-850 flex justify-between items-center">
                  <span className="text-slate-400">Polytrauma & C-Spine:</span>
                  <span className="text-amber-400 font-bold">{activeIncident?.clinicalAssessment.cervicalSpineRisk || 'Nominal'}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-850 flex justify-between items-center">
                  <span className="text-slate-400">Fractures & Internal Trauma:</span>
                  <span className="text-yellow-400 font-bold">{activeIncident?.clinicalAssessment.chestAbdomenRisk || 'Nominal'}</span>
                </div>
              </div>
            </div>

            {/* Golden Hour Countdown */}
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-red-300 uppercase font-bold block">Golden Hour Critical Window</span>
                <span className="text-xs text-slate-300">Target definitive surgical care</span>
              </div>
              <span className="text-lg font-black text-red-400">
                {activeIncident ? `${activeIncident.goldenHourMinutes} MINS` : '60 MINS'}
              </span>
            </div>
          </div>
        </div>

        {/* Right 7 Cols: One-Click Hospital Readiness Toggles */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-blue-400" />
                  One-Click Hospital Readiness Toggles
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pre-allocate critical hospital resources prior to ambulance touchdown. Client-side FHIR/HL7 dispatch.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-slate-950 text-cyan-300 font-mono text-xs border border-slate-800">
                FHIR / HL7 v2.5.1
              </span>
            </div>

            {/* 3 Explicit Readiness Toggles */}
            <div className="space-y-3">
              {resources.map((res) => {
                const Icon = res.icon
                const isSecured = hospitalStatus[res.key]

                return (
                  <div
                    key={res.key}
                    onClick={() => handleToggle(res.key)}
                    className={`min-h-[56px] p-4 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 active:scale-[0.99] ${
                      isSecured
                        ? 'bg-blue-950/30 border-blue-500 shadow-lg shadow-blue-950/40'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Checkbox / Toggle Icon */}
                      <div
                        className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          isSecured
                            ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                            : 'bg-slate-900 border-slate-700 text-transparent'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-white">
                            {res.title}
                          </h4>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                            isSecured
                              ? 'bg-blue-900/80 text-blue-200 border border-blue-700'
                              : 'bg-slate-900 text-slate-400 border border-slate-800'
                          }`}>
                            {isSecured ? 'READY' : 'STANDBY'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-snug">
                          {res.description}
                        </p>
                      </div>
                    </div>

                    <button
                      className={`min-h-[48px] px-4 py-2 rounded-lg text-xs font-mono font-bold shrink-0 transition-all text-center flex items-center justify-center gap-1.5 ${
                        isSecured
                          ? 'bg-blue-600 text-white shadow-md border border-blue-400'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {isSecured ? 'CONFIRMED' : 'RESERVE NOW'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

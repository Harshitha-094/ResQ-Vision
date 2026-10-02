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
      key: 'bedReserved',
      title: 'Reserve Trauma Resuscitation Bay 1 (Red Zone)',
      description: 'Dedicated negative-pressure critical resuscitation suite with crash cart & multi-parameter monitor.',
      icon: Bed,
      urgent: true,
    },
    {
      key: 'bloodCrossMatched',
      title: 'O-Negative Blood Cross-Matched (4 Units PRBC)',
      description: 'Massive Transfusion Protocol (MTP) level 1 standby at Central Blood Bank with rapid blood warmer.',
      icon: Droplet,
      urgent: true,
    },
    {
      key: 'ctScanReady',
      title: 'Emergency Whole-Body Pan-Scan CT Primed',
      description: '128-slice CT scanner cleared of elective cases; contrast injector & radiologist on trauma standby.',
      icon: Scan,
      urgent: true,
    },
    {
      key: 'traumaTeamMobilized',
      title: 'Trauma Surgery & Neurotrauma On-Call Team',
      description: 'Trauma Team Leader, Neurosurgeon, Orthopedic On-Call, and Anesthesiologist mobilized via pager.',
      icon: Users,
      urgent: true,
    },
    {
      key: 'otStandby',
      title: 'Emergency Surgical OT Suite 2 On Standby',
      description: 'Laparotomy and thoracotomy surgical trays prepped with cell-saver autotransfusion.',
      icon: Stethoscope,
      urgent: false,
    },
    {
      key: 'ventilatorPrimed',
      title: 'Mechanical Ventilator #4 Calibrated & In-Line',
      description: 'Hamilton-G5 ventilator primed with lung-protective ARDS trauma parameters.',
      icon: Wind,
      urgent: false,
    },
  ]

  const securedCount = Object.values(hospitalStatus).filter(Boolean).length
  const totalCount = resources.length
  const readinessPercent = Math.round((securedCount / totalCount) * 100)

  return (
    <div className="space-y-6">
      {/* Top Header: Hospital Identification & Golden Hour Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800 text-rose-400 font-bold">
              TRAUMA INTAKE DESK
            </span>
            <span className="text-slate-400">
              HEALTH & FAMILY WELFARE DEPT, GOVT OF KARNATAKA
            </span>
          </div>
          <h2 className="text-lg font-black text-white mt-1 flex items-center gap-2">
            <span>{zone.nearestHospital}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-normal">
              LEVEL-II EMERGENCY HUB
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Receiving Unit: <span className="text-cyan-400 font-bold">{zone.ambulanceBase}</span> • Channel: 108 EMRI Electronic EHR Sync
          </p>
        </div>

        {/* Live ETA Sync */}
        <div className="flex items-center gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-center font-mono">
            <div className="text-[10px] text-slate-500 uppercase flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              Incoming Patient ETA
            </div>
            <div className="text-2xl font-black text-amber-400">
              {ambulanceStatus === 'arrived' ? 'ON SITE (EXTRICATING)' : formatEta(ambulanceEtaSeconds)}
            </div>
            <div className="text-[10px] text-slate-400">
              Status: <strong className="text-white uppercase">{ambulanceStatus.replace('_', ' ')}</strong>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-center font-mono">
            <div className="text-[10px] text-slate-500 uppercase">Hospital Readiness</div>
            <div className={`text-2xl font-black ${readinessPercent >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {readinessPercent}%
            </div>
            <div className="text-[10px] text-slate-400">
              {securedCount}/{totalCount} Resources Secured
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Triage Ticket (Left) + Interactive Resource Toggles (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Electronic Trauma Admission Ticket */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-500" />
                <h3 className="font-bold text-white uppercase tracking-wider">
                  Emergency Bay Triage Ticket
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-red-600 text-white font-extrabold text-[10px]">
                TRIAGE: RED (P0)
              </span>
            </div>

            {/* Incident & Patient Metrics */}
            <div className="space-y-3 bg-slate-950 p-3.5 rounded-lg border border-slate-800/80">
              <div className="flex justify-between">
                <span className="text-slate-500">Incident Code:</span>
                <span className="text-white font-bold">{activeIncident ? activeIncident.code : 'STANDBY'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Crash Severity Index:</span>
                <span className="text-red-400 font-extrabold">{activeIncident ? `${activeIncident.csi} / 5.0` : '0.0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Injury Severity Score (ISS):</span>
                <span className="text-amber-400 font-bold">{activeIncident ? activeIncident.issEstimate : '--'} (Polytrauma)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Expected Incoming Casualties:</span>
                <span className="text-white font-bold">{activeIncident ? `${activeIncident.casualtiesCount} Victims` : 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Casualty Breakdown:</span>
                <span className="text-red-300">
                  {activeIncident
                    ? `${activeIncident.casualtyBreakdown.criticalP0} Critical P0, ${activeIncident.casualtyBreakdown.seriousP1} P1`
                    : 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Trapped / Extrication:</span>
                <span className={activeIncident?.trappedVictims > 0 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                  {activeIncident ? `${activeIncident.trappedVictims} Victims (Hydraulic Jaws In Use)` : 'No'}
                </span>
              </div>
            </div>

            {/* Trauma Mechanism & Organ System Risk */}
            <div className="space-y-2 pt-1">
              <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Predicted Organ System Trauma Risks
              </h4>
              <div className="space-y-1.5 text-[11px]">
                <div className="p-2 rounded bg-slate-950 border border-slate-850 flex justify-between">
                  <span className="text-slate-400">Head / TBI:</span>
                  <span className="text-red-400 font-semibold">{activeIncident?.clinicalAssessment.headTraumaRisk || 'Nominal'}</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-850 flex justify-between">
                  <span className="text-slate-400">C-Spine / Spinal:</span>
                  <span className="text-amber-400 font-semibold">{activeIncident?.clinicalAssessment.cervicalSpineRisk || 'Nominal'}</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-850 flex justify-between">
                  <span className="text-slate-400">Thoracic / Hemothorax:</span>
                  <span className="text-yellow-400 font-semibold">{activeIncident?.clinicalAssessment.chestAbdomenRisk || 'Nominal'}</span>
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

        {/* Right 7 Cols: Interactive Resource Readiness Toggles */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-emerald-400" />
                  Trauma Bay Resource Reservation & Checklist
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click to pre-allocate hospital resources before ambulance touchdown. Syncs via HL7 / FHIR.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-slate-950 text-cyan-300 font-mono text-xs border border-slate-800">
                FHIR v4 / HL7 v2.5.1
              </span>
            </div>

            {/* Resource Cards */}
            <div className="space-y-3">
              {resources.map((res) => {
                const Icon = res.icon
                const isSecured = hospitalStatus[res.key]

                return (
                  <div
                    key={res.key}
                    onClick={() => handleToggle(res.key)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-4 ${
                      isSecured
                        ? 'bg-emerald-950/30 border-emerald-500/80 shadow-md shadow-emerald-950/40'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2.5 rounded-lg transition-colors ${
                          isSecured ? 'bg-emerald-600/30 text-emerald-400' : 'bg-slate-900 text-slate-500'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-200">
                            {res.title}
                          </h4>
                          {res.urgent && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950 text-red-400 border border-red-800 font-mono">
                              PRIORITY
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          {res.description}
                        </p>
                      </div>
                    </div>

                    <button
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex-shrink-0 transition-all ${
                        isSecured
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {isSecured ? 'SECURED' : 'RESERVE'}
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

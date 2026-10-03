import React, { useState } from 'react'
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileCheck2,
  UserCheck,
  Check,
  X,
  Stethoscope,
  HeartPulse,
  Printer,
  Copy,
  ArrowRight,
  Activity,
  BedDouble
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'

export default function HospitalHandoverModal({ isOpen, onClose }) {
  const {
    incidents,
    hospitalState,
    ambulanceConfirmHandoverAndCloseCase,
    simulationStage,
    hospitals
  } = useEmergencyStore()

  const incident = incidents.find(i => i.id === 'RQ-1048') || incidents[0]
  const isAlreadyCompleted = simulationStage >= 12 || hospitalState.handoverCompleted
  const selectedHospital = hospitals.find(h => h.id === hospitalState.selectedHospitalId) || hospitals[0]

  // Handover form state
  const [receivingDoctor, setReceivingDoctor] = useState(
    hospitalState.receivingDoctor || 'Dr. A. Mathew, MD (Chief Medical Officer / Trauma Lead)'
  )
  const [selectedBay, setSelectedBay] = useState(
    hospitalState.selectedBay || 'Trauma Bay 1 (Red Zone)'
  )
  const [paramedicName, setParamedicName] = useState('Paramedic S. Nair (ALS Badge #9021)')
  const [notes, setNotes] = useState(
    `Both casualties transported safely via emergency corridor. Deceleration trauma stabilized in-transit. Blood bank notified for 4 units O-Negative. Full clinical custody transferred to ${selectedHospital.name} Trauma Team.`
  )

  // Handover checklist verification
  const [checklist, setChecklist] = useState({
    gurneyTransfer: true,
    sbarDebrief: true,
    telemetrySync: true,
    propertyInventory: true
  })

  const [copiedReceipt, setCopiedReceipt] = useState(false)

  if (!isOpen) return null

  const allChecklistItemsVerified = Object.values(checklist).every(Boolean)

  const handleToggleCheck = (key) => {
    if (isAlreadyCompleted) return
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleConfirmAndClose = () => {
    ambulanceConfirmHandoverAndCloseCase({
      receivingDoctor,
      traumaBay: selectedBay,
      paramedic: paramedicName,
      casualtiesCount: 2,
      notes
    })
    onClose()
  }

  const handleCopyReceipt = () => {
    const receiptText = `
=== RESQVISION EMERGENCY MEDICAL SERVICES (EMS) ===
OFFICIAL CLINICAL HANDOVER DOCKET & CASE CLOSURE
--------------------------------------------------
Docket Number:       REC-2026-RQ1048-SJ
Incident Reference:  RQ-1048 (NH-44 KM 42.4)
Responding Unit:     Ambulance 07 (KA 01 AB 1234 - ALS)
Paramedic In Charge: ${paramedicName}
Receiving Hospital:  ${selectedHospital.name}
Hospital GPS:        ${selectedHospital.coordinates.lat.toFixed(5)}° N, ${selectedHospital.coordinates.lng.toFixed(5)}° E
Designated Facility: Trauma Care Center - ${selectedBay}
Attending Physician: ${receivingDoctor}
Handover Timestamp:  ${hospitalState.handoverTime || '14:48:30 IST'}
Casualties Transferred: 2 Patients (1 Critical, 1 Urgent)
Status:              CASE CLOSED & ARCHIVED
--------------------------------------------------
Clinical Notes:
${notes}
--------------------------------------------------
Verified via 108 Emergency Medical CAD Network.
    `.trim()

    navigator.clipboard?.writeText(receiptText)
    setCopiedReceipt(true)
    setTimeout(() => setCopiedReceipt(false), 3000)
  }

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                isAlreadyCompleted
                  ? 'bg-slate-800 text-slate-300 border-slate-700'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-800'
              }`}>
                {isAlreadyCompleted ? 'OFFICIAL DOCKET ARCHIVE' : 'EMS CLINICAL HANDOVER FORM'}
              </span>
              <span className="font-mono text-xs text-slate-400 font-bold">
                INCIDENT {incident.id}
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                · Ambulance 07 (KA 01 AB 1234)
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                {isAlreadyCompleted
                  ? 'Handover Completed & Case Closed'
                  : 'Confirm Hospital Arrival & Close Case'}
              </span>
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="overflow-y-auto space-y-4 pr-1 text-xs">
          {/* Notification / Completion Banner */}
          {isAlreadyCompleted ? (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-emerald-300 text-sm">
                    Case RQ-1048 Officially Closed & Archived
                  </div>
                  <div className="text-slate-300 text-[11px] mt-0.5 font-mono">
                    Receipt ID: REC-2026-RQ1048-SJ · Total Handover Duration: 15m 44s
                  </div>
                </div>
              </div>
              <button
                onClick={handleCopyReceipt}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700 text-emerald-200 font-medium text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
              >
                {copiedReceipt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReceipt ? 'Copied' : 'Copy Receipt'}</span>
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/70 text-slate-300 space-y-1">
              <div className="flex items-center gap-2 font-semibold text-blue-300 text-xs">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span>Ambulance 07 arrived at emergency bay entrance</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Please verify the receiving physician, allocate the designated resuscitation trauma bay, and confirm physical transfer of all patients to formally close this emergency response docket.
              </p>
            </div>
          )}

          {/* Receiving Hospital Facility & Bay Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                Destination Trauma Facility
              </span>
              <div className="font-bold text-slate-100 text-sm">
                {selectedHospital.name}
              </div>
              <div className="text-[11px] text-emerald-400 font-mono">
                {selectedHospital.traumaLevel?.split('&')[0]} · GPS: {selectedHospital.coordinates.lat.toFixed(4)}° N, {selectedHospital.coordinates.lng.toFixed(4)}° E
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                Allocated Emergency Bed
              </span>
              {isAlreadyCompleted ? (
                <div className="font-bold text-amber-400 text-sm">
                  {selectedBay}
                </div>
              ) : (
                <select
                  value={selectedBay}
                  onChange={(e) => setSelectedBay(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 font-semibold text-xs focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="Trauma Bay 1 (Red Zone)">Trauma Bay 1 (Red Zone - Critical)</option>
                  <option value="Trauma Bay 2 (Red Zone)">Trauma Bay 2 (Red Zone)</option>
                  <option value="Resuscitation Unit A">Resuscitation Unit A</option>
                  <option value="Surgical ICU Step-down">Surgical ICU Step-down</option>
                </select>
              )}
              <div className="text-[11px] text-slate-400 font-mono">
                Rapid Infuser & Surgical Team On Standby
              </div>
            </div>
          </div>

          {/* Casualties / Patient Handover Summary */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <div className="flex items-center gap-2 font-mono font-bold text-slate-200">
                <HeartPulse className="w-4 h-4 text-red-400" />
                <span>Casualties Handed Over (2 Patients)</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Triage SBAR Sheet Attached
              </span>
            </div>

            <div className="space-y-2">
              {/* Patient 1 */}
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-red-950 border border-red-800 text-red-400 font-mono text-[10px] font-bold">
                      RED TAG #RQ-01
                    </span>
                    <span className="font-semibold text-slate-200 text-xs">
                      Male, 34 yrs (Driver · Silver Sedan)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                    SpO2 93% · BP 108/68
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  <strong className="text-slate-200">Condition:</strong> Severe blunt thoracic trauma, deceleration impact. 18G IV cannula left arm with Ringer's Lactate flowing. Rigid cervical collar secured. High-flow O2 via non-rebreather mask.
                </p>
              </div>

              {/* Patient 2 */}
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-400 font-mono text-[10px] font-bold">
                      YELLOW TAG #RQ-02
                    </span>
                    <span className="font-semibold text-slate-200 text-xs">
                      Female, 29 yrs (Passenger · Blue Hatchback)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                    SpO2 99% · BP 122/80
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  <strong className="text-slate-200">Condition:</strong> Whiplash injury, cervical spine strain, bilateral knee abrasions. Semi-rigid collar in situ. Conscious, oriented (GCS 15). Analgesic administered at scene.
                </p>
              </div>
            </div>
          </div>

          {/* Receiving Medical Team & Paramedic Verification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px] uppercase font-semibold">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Receiving Doctor / CMO</span>
              </div>
              {isAlreadyCompleted ? (
                <div className="font-bold text-slate-200 text-xs">
                  {receivingDoctor}
                </div>
              ) : (
                <select
                  value={receivingDoctor}
                  onChange={(e) => setReceivingDoctor(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 font-semibold text-xs focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="Dr. A. Mathew, MD (Chief Medical Officer / Trauma Lead)">
                    Dr. A. Mathew, MD (Chief Medical Officer)
                  </option>
                  <option value="Dr. Priya Sundaram (Senior Trauma Surgeon)">
                    Dr. Priya Sundaram (Senior Trauma Surgeon)
                  </option>
                  <option value="Dr. Kiran Raj (Emergency Medicine Registrar)">
                    Dr. Kiran Raj (Emergency Medicine Registrar)
                  </option>
                </select>
              )}
              <span className="text-[10px] text-slate-400 block font-mono">
                Department of Emergency Medicine & Trauma
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px] uppercase font-semibold">
                <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
                <span>Paramedic Handover Lead</span>
              </div>
              <div className="font-bold text-slate-200 text-xs font-mono">
                {paramedicName}
              </div>
              <span className="text-[10px] text-slate-400 block font-mono">
                ALS Crew · Ambulance 07 (KA 01 AB 1234)
              </span>
            </div>
          </div>

          {/* Clinical Handover Checklist */}
          <div className="p-3 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between font-mono font-bold text-slate-200 border-b border-slate-850 pb-2">
              <span className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span>Handover Verification Checklist</span>
              </span>
              <span className="text-[11px] text-emerald-400 font-normal">
                {allChecklistItemsVerified ? 'All 4 verified ✓' : 'Verification required'}
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              <label
                onClick={() => handleToggleCheck('gurneyTransfer')}
                className={`flex items-start gap-2.5 p-2 rounded-lg border transition-colors cursor-pointer ${
                  checklist.gurneyTransfer
                    ? 'bg-emerald-950/20 border-emerald-900/60 text-slate-200'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checklist.gurneyTransfer}
                  onChange={() => {}}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-0"
                />
                <div className="leading-snug">
                  <span className="font-semibold block text-slate-200">
                    Physical patient transfer to Trauma Bay 1 resuscitation gurney complete
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Casualties safely transferred from vehicle stretcher onto hospital bed with spinal precautions.
                  </span>
                </div>
              </label>

              <label
                onClick={() => handleToggleCheck('sbarDebrief')}
                className={`flex items-start gap-2.5 p-2 rounded-lg border transition-colors cursor-pointer ${
                  checklist.sbarDebrief
                    ? 'bg-emerald-950/20 border-emerald-900/60 text-slate-200'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checklist.sbarDebrief}
                  onChange={() => {}}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-0"
                />
                <div className="leading-snug">
                  <span className="font-semibold block text-slate-200">
                    Verbal SBAR debriefing delivered directly to attending physician
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Situation, crash background, physical assessment, and in-transit medications communicated.
                  </span>
                </div>
              </label>

              <label
                onClick={() => handleToggleCheck('telemetrySync')}
                className={`flex items-start gap-2.5 p-2 rounded-lg border transition-colors cursor-pointer ${
                  checklist.telemetrySync
                    ? 'bg-emerald-950/20 border-emerald-900/60 text-slate-200'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checklist.telemetrySync}
                  onChange={() => {}}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-0"
                />
                <div className="leading-snug">
                  <span className="font-semibold block text-slate-200">
                    Vital telemetry & ECG records synchronized with Hospital EHR
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Pre-hospital vitals log transferred to hospital digital trauma registry.
                  </span>
                </div>
              </label>

              <label
                onClick={() => handleToggleCheck('propertyInventory')}
                className={`flex items-start gap-2.5 p-2 rounded-lg border transition-colors cursor-pointer ${
                  checklist.propertyInventory
                    ? 'bg-emerald-950/20 border-emerald-900/60 text-slate-200'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checklist.propertyInventory}
                  onChange={() => {}}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-0"
                />
                <div className="leading-snug">
                  <span className="font-semibold block text-slate-200">
                    Casualty personal property & incident inventory receipt signed
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Belongings from the vehicle retrieved and handed over to triage nurse in accordance with protocol.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Paramedic Handover Clinical Notes */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">
              Paramedic Handover Summary & Observations
            </span>
            {isAlreadyCompleted ? (
              <p className="text-slate-300 font-mono text-[11px] leading-relaxed bg-slate-900/50 p-2.5 rounded border border-slate-800">
                {incident.handoverDetails?.notes || notes}
              </p>
            ) : (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono text-xs focus:outline-hidden focus:border-emerald-500 leading-relaxed"
                placeholder="Enter clinical notes, drugs given, or scene observations..."
              />
            )}
          </div>

          {/* Legal / Protocol Certification Notice */}
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              By confirming handover, clinical custody of all casualties is legally transferred to St. John's Medical College Hospital. Ambulance 07 is returned to <strong className="text-emerald-300 font-mono">AVAILABLE</strong> status and incident RQ-1048 is archived.
            </p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="border-t border-slate-800 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-400 font-mono">
            {isAlreadyCompleted ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Case Concluded & Archived in Response Log</span>
              </span>
            ) : (
              <span>National Highway Emergency Response Grid · Karnataka 108</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {isAlreadyCompleted ? (
              <>
                <button
                  onClick={handleCopyReceipt}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedReceipt ? 'Copied' : 'Copy Receipt'}</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-950/40 cursor-pointer"
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAndClose}
                  disabled={!allChecklistItemsVerified}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Handover & Close Case</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

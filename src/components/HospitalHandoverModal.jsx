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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3.5 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${
                isAlreadyCompleted
                  ? 'bg-slate-100 text-slate-700 border-slate-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                {isAlreadyCompleted ? 'OFFICIAL DOCKET ARCHIVE' : 'EMS CLINICAL HANDOVER FORM'}
              </span>
              <span className="font-mono text-xs text-slate-600 font-bold">
                INCIDENT {incident.id}
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                · Ambulance 07 (KA 01 AB 1234)
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600 shrink-0" />
              <span>
                {isAlreadyCompleted
                  ? 'Handover Completed & Case Closed'
                  : 'Confirm Hospital Arrival & Close Case'}
              </span>
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="overflow-y-auto space-y-4 pr-1 text-xs">
          {/* Notification / Completion Banner */}
          {isAlreadyCompleted ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-emerald-900 text-sm">
                    Case RQ-1048 Officially Closed & Archived
                  </div>
                  <div className="text-emerald-700 text-xs mt-0.5 font-mono">
                    Receipt ID: REC-2026-RQ1048-SJ · Total Handover Duration: 15m 44s
                  </div>
                </div>
              </div>
              <button
                onClick={handleCopyReceipt}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 font-medium text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-2xs"
              >
                {copiedReceipt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReceipt ? 'Copied' : 'Copy Receipt'}</span>
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-slate-700 space-y-1">
              <div className="flex items-center gap-2 font-semibold text-blue-900 text-xs">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>Ambulance 07 arrived at emergency bay entrance</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-600">
                Please verify the receiving physician, allocate the designated resuscitation trauma bay, and confirm physical transfer of all patients to formally close this emergency response docket.
              </p>
            </div>
          )}

          {/* Receiving Hospital Facility & Bay Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono font-semibold block">
                Destination Trauma Facility
              </span>
              <div className="font-bold text-slate-900 text-sm">
                {selectedHospital.name}
              </div>
              <div className="text-xs text-emerald-700 font-mono font-medium">
                {selectedHospital.traumaLevel?.split('&')[0]} · GPS: {selectedHospital.coordinates.lat.toFixed(4)}° N, {selectedHospital.coordinates.lng.toFixed(4)}° E
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-mono font-semibold block">
                Allocated Emergency Bed
              </span>
              {isAlreadyCompleted ? (
                <div className="font-bold text-amber-800 text-sm">
                  {selectedBay}
                </div>
              ) : (
                <select
                  value={selectedBay}
                  onChange={(e) => setSelectedBay(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 font-semibold text-xs focus:outline-hidden focus:border-blue-600 shadow-2xs"
                >
                  <option value="Trauma Bay 1 (Red Zone)">Trauma Bay 1 (Red Zone - Critical)</option>
                  <option value="Trauma Bay 2 (Red Zone)">Trauma Bay 2 (Red Zone)</option>
                  <option value="Resuscitation Unit A">Resuscitation Unit A</option>
                  <option value="Surgical ICU Step-down">Surgical ICU Step-down</option>
                </select>
              )}
              <div className="text-xs text-slate-500 font-mono">
                Rapid Infuser & Surgical Team On Standby
              </div>
            </div>
          </div>

          {/* Casualties / Patient Handover Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2 font-mono font-bold text-slate-800 text-xs">
                <HeartPulse className="w-4 h-4 text-red-600" />
                <span>Casualties Handed Over (2 Patients)</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Triage SBAR Sheet Attached
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Patient 1 */}
              <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 font-mono text-[10px] font-bold">
                      RED TAG #RQ-01
                    </span>
                    <span className="font-semibold text-slate-900 text-xs">
                      Male, 34 yrs (Driver · Silver Sedan)
                    </span>
                  </div>
                  <span className="text-xs font-mono text-emerald-700 font-bold">
                    SpO2 93% · BP 108/68
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-800 font-medium">Condition:</strong> Severe blunt thoracic trauma, deceleration impact. 18G IV cannula left arm with Ringer's Lactate flowing. Rigid cervical collar secured. High-flow O2 via non-rebreather mask.
                </p>
              </div>

              {/* Patient 2 */}
              <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-mono text-[10px] font-bold">
                      YELLOW TAG #RQ-02
                    </span>
                    <span className="font-semibold text-slate-900 text-xs">
                      Female, 29 yrs (Passenger · Blue Hatchback)
                    </span>
                  </div>
                  <span className="text-xs font-mono text-emerald-700 font-bold">
                    SpO2 99% · BP 122/80
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-800 font-medium">Condition:</strong> Whiplash injury, cervical spine strain, bilateral knee abrasions. Semi-rigid collar in situ. Conscious, oriented (GCS 15). Analgesic administered at scene.
                </p>
              </div>
            </div>
          </div>

          {/* Receiving Medical Team & Paramedic Verification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px] uppercase font-semibold">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Receiving Doctor / CMO</span>
              </div>
              {isAlreadyCompleted ? (
                <div className="font-bold text-slate-800 text-xs">
                  {receivingDoctor}
                </div>
              ) : (
                <select
                  value={receivingDoctor}
                  onChange={(e) => setReceivingDoctor(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 font-semibold text-xs focus:outline-hidden focus:border-blue-600 shadow-2xs"
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
              <span className="text-xs text-slate-500 block">
                Department of Emergency Medicine & Trauma
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px] uppercase font-semibold">
                <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                <span>Paramedic Handover Lead</span>
              </div>
              <div className="font-bold text-slate-800 text-xs font-mono">
                {paramedicName}
              </div>
              <span className="text-xs text-slate-500 block font-mono">
                ALS Crew · Ambulance 07 (KA 01 AB 1234)
              </span>
            </div>
          </div>

          {/* Clinical Handover Checklist */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between font-mono font-bold text-slate-800 border-b border-slate-200 pb-2">
              <span className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span>Handover Verification Checklist</span>
              </span>
              <span className="text-xs text-emerald-700 font-normal">
                {allChecklistItemsVerified ? 'All 4 verified ✓' : 'Verification required'}
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <label
                onClick={() => handleToggleCheck('gurneyTransfer')}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                  checklist.gurneyTransfer
                    ? 'bg-white border-emerald-300 text-slate-800 shadow-2xs'
                    : 'bg-white/60 border-slate-200 text-slate-500'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checklist.gurneyTransfer}
                  onChange={() => {}}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-0"
                />
                <div className="leading-snug">
                  <span className="font-semibold block text-slate-900 text-xs">
                    Physical patient transfer to Trauma Bay 1 resuscitation gurney complete
                  </span>
                  <span className="text-xs text-slate-500">
                    Casualties safely transferred from vehicle stretcher onto hospital bed with spinal precautions.
                  </span>
                </div>
              </label>

              <label
                onClick={() => handleToggleCheck('sbarDebrief')}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                  checklist.sbarDebrief
                    ? 'bg-white border-emerald-300 text-slate-800 shadow-2xs'
                    : 'bg-white/60 border-slate-200 text-slate-500'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checklist.sbarDebrief}
                  onChange={() => {}}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-0"
                />
                <div className="leading-snug">
                  <span className="font-semibold block text-slate-900 text-xs">
                    Verbal SBAR debriefing delivered directly to attending physician
                  </span>
                  <span className="text-xs text-slate-500">
                    Situation, crash background, physical assessment, and in-transit medications communicated.
                  </span>
                </div>
              </label>

              <label
                onClick={() => handleToggleCheck('telemetrySync')}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                  checklist.telemetrySync
                    ? 'bg-white border-emerald-300 text-slate-800 shadow-2xs'
                    : 'bg-white/60 border-slate-200 text-slate-500'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checklist.telemetrySync}
                  onChange={() => {}}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-0"
                />
                <div className="leading-snug">
                  <span className="font-semibold block text-slate-900 text-xs">
                    Vital telemetry & ECG records synchronized with Hospital EHR
                  </span>
                  <span className="text-xs text-slate-500">
                    Pre-hospital vitals log transferred to hospital digital trauma registry.
                  </span>
                </div>
              </label>

              <label
                onClick={() => handleToggleCheck('propertyInventory')}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                  checklist.propertyInventory
                    ? 'bg-white border-emerald-300 text-slate-800 shadow-2xs'
                    : 'bg-white/60 border-slate-200 text-slate-500'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checklist.propertyInventory}
                  onChange={() => {}}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-0"
                />
                <div className="leading-snug">
                  <span className="font-semibold block text-slate-900 text-xs">
                    Casualty personal property & incident inventory receipt signed
                  </span>
                  <span className="text-xs text-slate-500">
                    Belongings from the vehicle retrieved and handed over to triage nurse in accordance with protocol.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Paramedic Handover Clinical Notes */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="text-[10px] text-slate-500 uppercase font-mono font-semibold block">
              Paramedic Handover Summary & Observations
            </span>
            {isAlreadyCompleted ? (
              <p className="text-slate-800 font-mono text-xs leading-relaxed bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                {incident.handoverDetails?.notes || notes}
              </p>
            ) : (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-800 font-mono text-xs focus:outline-hidden focus:border-blue-600 leading-relaxed shadow-2xs"
                placeholder="Enter clinical notes, drugs given, or scene observations..."
              />
            )}
          </div>

          {/* Legal / Protocol Certification Notice */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              By confirming handover, clinical custody of all casualties is legally transferred to St. John's Medical College Hospital. Ambulance 07 is returned to <strong className="text-emerald-700 font-mono">AVAILABLE</strong> status and incident RQ-1048 is archived.
            </p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="border-t border-slate-100 pt-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-mono">
            {isAlreadyCompleted ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
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
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedReceipt ? 'Copied' : 'Copy Receipt'}</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 sm:flex-initial px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAndClose}
                  disabled={!allChecklistItemsVerified}
                  className="flex-1 sm:flex-initial px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-semibold text-xs transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
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

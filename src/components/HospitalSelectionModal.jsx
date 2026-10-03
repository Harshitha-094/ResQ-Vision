import React from 'react'
import { Building2, Check, ArrowRight, X, Clock, MapPin } from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'

export default function HospitalSelectionModal({ isOpen, onClose }) {
  const {
    hospitals,
    ambulanceSelectHospital,
    hospitalState
  } = useEmergencyStore()

  if (!isOpen) return null

  const handleSelect = (hospId) => {
    ambulanceSelectHospital(hospId)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-4 sm:p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Choose destination
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select verified trauma facility for casualty transport.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nearby Hospitals as Simple Rows as Specified */}
        <div className="space-y-2.5">
          {hospitals.map((hosp) => {
            const isCurrentlySelected = hospitalState.selectedHospitalId === hosp.id

            return (
              <div
                key={hosp.id}
                className="p-3 rounded-lg border border-slate-800 bg-slate-950 hover:border-slate-700 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-100 text-sm">
                    {hosp.name}
                  </div>
                  <div className="text-slate-400 text-xs font-mono">
                    {hosp.distanceKm} km · ETA {hosp.etaMinutes} min
                  </div>
                  <div className="text-[11px] text-emerald-400 font-medium">
                    {hosp.emergencyStatus}
                  </div>
                </div>

                <button
                  onClick={() => handleSelect(hosp.id)}
                  className={`px-3 py-1.5 rounded font-medium text-xs transition-colors shrink-0 ${
                    isCurrentlySelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  {isCurrentlySelected ? 'Selected' : 'Select'}
                </button>
              </div>
            )
          })}
        </div>

        {/* Footnote as Specified */}
        <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2.5 flex items-center justify-between">
          <span>Live facility telemetry (Demo Data)</span>
          <span className="font-mono">108 Emergency Grid</span>
        </div>
      </div>
    </div>
  )
}

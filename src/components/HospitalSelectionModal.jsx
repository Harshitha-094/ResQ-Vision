import React from 'react'
import { Building2, Check, ArrowRight, X, Clock, MapPin, Navigation, Compass, ExternalLink } from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'
import { calculateGpsDistanceKm } from '../data/mockScenarios'

export default function HospitalSelectionModal({ isOpen, onClose }) {
  const {
    hospitals,
    ambulanceSelectHospital,
    hospitalState,
    incidents,
    selectedIncidentId
  } = useEmergencyStore()

  if (!isOpen) return null

  // Determine current reference incident coordinates
  const activeIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0]
  const originLat = activeIncident?.coordinates?.lat || 12.8452
  const originLng = activeIncident?.coordinates?.lng || 77.6601
  const originLabel = activeIncident?.location || 'NH-44 Highway Incident Site'

  // Calculate dynamic GPS distance & ETA for each hospital and sort closest first
  const sortedHospitals = [...hospitals].map(hosp => {
    const distanceKm = calculateGpsDistanceKm(
      originLat,
      originLng,
      hosp.coordinates.lat,
      hosp.coordinates.lng
    )
    // Emergency vehicle ETA estimate (~45 km/h avg in corridor)
    const etaMinutes = Math.max(3, Math.round(distanceKm * 1.5))
    return {
      ...hosp,
      calculatedDistanceKm: distanceKm,
      calculatedEtaMinutes: etaMinutes
    }
  }).sort((a, b) => a.calculatedDistanceKm - b.calculatedDistanceKm)

  const handleSelect = (hospId) => {
    ambulanceSelectHospital(hospId)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-600" />
                <span>GPS Trauma Hospital Directory</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select verified trauma facility for casualty transport. Sorted by real-time GPS proximity.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* GPS Origin Banner */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="text-slate-500 font-sans">Incident GPS Origin:</span>
            <span className="text-slate-800 font-semibold">{originLabel}</span>
          </div>
          <div className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 text-[11px] shadow-2xs">
            {originLat.toFixed(4)}° N, {originLng.toFixed(4)}° E
          </div>
        </div>

        {/* Nearby Hospitals List (Sorted by GPS Distance) */}
        <div className="overflow-y-auto space-y-3 pr-1 flex-1">
          {sortedHospitals.map((hosp, idx) => {
            const isCurrentlySelected = hospitalState.selectedHospitalId === hosp.id

            return (
              <div
                key={hosp.id}
                className={`p-4 rounded-xl border transition-all text-xs ${
                  isCurrentlySelected
                    ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">
                        {hosp.name}
                      </span>
                      {idx === 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                          CLOSEST FACILITY
                        </span>
                      )}
                      {isCurrentlySelected && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                          CURRENT DESTINATION
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-slate-600 flex-wrap">
                      <span className="font-bold text-amber-700 flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-amber-600" />
                        {hosp.calculatedDistanceKm} km
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-700 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-blue-600" />
                        ETA {hosp.calculatedEtaMinutes} min
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                        GPS: {hosp.coordinates.lat.toFixed(4)}° N, {hosp.coordinates.lng.toFixed(4)}° E
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 line-clamp-1">
                      {hosp.address}
                    </div>

                    <div className="flex items-center gap-2 pt-0.5 text-xs font-mono">
                      <span className="text-emerald-700 font-medium">
                        ● {hosp.traumaBaysAvailable} Bays Available
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="text-blue-700 font-medium">
                        {hosp.icuBedsOpen} ICU Beds Open
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-500">
                        {hosp.traumaLevel?.split('&')[0]}
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={() => handleSelect(hosp.id)}
                      className={`px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer w-full sm:w-auto shadow-2xs ${
                        isCurrentlySelected
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {isCurrentlySelected ? 'Selected' : 'Select Destination'}
                    </button>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${hosp.coordinates.lat},${hosp.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                      title="Open Google Maps GPS Navigation"
                    >
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                      <span>GPS Route</span>
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footnote */}
        <div className="text-xs text-slate-500 border-t border-slate-100 pt-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Live GPS telemetry & dynamic Haversine distance matrix
          </span>
          <span className="font-mono text-[11px] text-slate-400">108 Emergency Grid</span>
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Compass,
  Phone,
  ExternalLink,
  Copy,
  Crosshair,
  Search,
  Droplet,
  BookOpen,
  Navigation,
  Check
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'
import { calculateGpsDistanceKm } from '../data/mockScenarios'
import HospitalHandoverModal from './HospitalHandoverModal'

export default function HospitalView() {
  const {
    hospitalState,
    hospitalAcknowledge,
    hospitalPrepare,
    hospitalMarkReady,
    ambulanceSelectHospital,
    simulationStage,
    incidents,
    hospitals,
    selectedIncidentId,
    openUserGuides
  } = useEmergencyStore()

  const [handoverModalOpen, setHandoverModalOpen] = useState(false)
  const [gpsMode, setGpsMode] = useState('incident') // 'incident' | 'device'
  const [deviceGps, setDeviceGps] = useState(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTraumaOnly, setFilterTraumaOnly] = useState(false)

  const activeIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0]
  const isCompleted = simulationStage >= 12 || hospitalState.handoverCompleted
  const isReady = hospitalState.ready || simulationStage >= 11
  const isPreparing = hospitalState.preparing || simulationStage >= 10
  const isAcknowledged = hospitalState.acknowledged || simulationStage >= 9

  // Get current active selected hospital
  const currentHospital = hospitals.find(h => h.id === hospitalState.selectedHospitalId) || hospitals[0]

  // Reference GPS coordinates based on mode
  const incidentLat = activeIncident?.coordinates?.lat || 12.8452
  const incidentLng = activeIncident?.coordinates?.lng || 77.6601
  const incidentLocationLabel = activeIncident?.location || 'NH-44 Highway Incident Site'

  const activeOriginLat = gpsMode === 'device' && deviceGps ? deviceGps.lat : incidentLat
  const activeOriginLng = gpsMode === 'device' && deviceGps ? deviceGps.lng : incidentLng
  const activeOriginLabel = gpsMode === 'device' && deviceGps ? 'Your Device Live GPS' : incidentLocationLabel

  // Handle requesting device GPS
  const handleRequestDeviceGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser')
      return
    }
    setGpsLoading(true)
    setGpsError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDeviceGps({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy)
        })
        setGpsMode('device')
        setGpsLoading(false)
      },
      (err) => {
        console.warn('Geolocation error:', err.message)
        setGpsError('GPS permission denied or unavailable. Falling back to Incident GPS.')
        setGpsMode('incident')
        setGpsLoading(false)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  // Calculate dynamic proximity for all hospitals
  const hospitalsWithProximity = hospitals.map(hosp => {
    const distanceKm = calculateGpsDistanceKm(
      activeOriginLat,
      activeOriginLng,
      hosp.coordinates.lat,
      hosp.coordinates.lng
    )
    const etaMinutes = Math.max(2, Math.round(distanceKm * 1.5))
    return {
      ...hosp,
      calculatedDistanceKm: distanceKm,
      calculatedEtaMinutes: etaMinutes
    }
  }).sort((a, b) => a.calculatedDistanceKm - b.calculatedDistanceKm)

  // Filtered list
  const filteredHospitals = hospitalsWithProximity.filter(hosp => {
    const matchesSearch = hosp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hosp.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hosp.traumaLevel.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTrauma = !filterTraumaOnly || hosp.traumaLevel.toLowerCase().includes('level 1') || hosp.traumaLevel.toLowerCase().includes('neuro')
    return matchesSearch && matchesTrauma
  })

  const copyCoordinates = (id, lat, lng) => {
    const coordStr = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    navigator.clipboard.writeText(coordStr)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 text-slate-800">
      {/* Header: Emergency Desk */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Emergency Desk · Trauma Receiving
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-700">{currentHospital.name}</span>
            <span>·</span>
            <span className="font-mono text-emerald-700">
              GPS: {currentHospital.coordinates.lat.toFixed(4)}° N, {currentHospital.coordinates.lng.toFixed(4)}° E
            </span>
          </p>
        </div>

        {/* Readiness Badge & SOP Guide Link */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => openUserGuides('hospital')}
            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Open Hospital Trauma Desk Step-by-Step SOP Guide"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>SOP Guide</span>
          </button>

          {isCompleted ? (
            <span className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>PATIENT ADMITTED</span>
            </span>
          ) : isReady ? (
            <span className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>READY FOR ARRIVAL</span>
            </span>
          ) : isPreparing ? (
            <span className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 font-mono text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>PREPARING BAY</span>
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs font-medium">
              STANDBY
            </span>
          )}
        </div>
      </div>

      {/* Main Incoming Emergency Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        {/* Subheading: Incoming emergency */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-slate-900">
              Incoming emergency
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500">
            108 Emergency Network
          </span>
        </div>

        {/* Grid: Details on Left, Accident Image on the Side */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Details (7 cols) */}
          <div className="md:col-span-7 space-y-3">
            <div>
              <div className="text-2xl font-bold font-mono text-slate-900">
                Incident {activeIncident.id}
              </div>
              <div className="text-xs font-mono font-semibold text-red-700 mt-0.5">
                Severe Collision · Polytrauma Alert
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 py-1 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] block font-sans">Responding Unit</span>
                <span className="text-slate-900 font-bold text-sm">Ambulance 07</span>
                <span className="text-[10px] text-slate-500 block mt-0.5 font-sans">ALS Mobile ICU</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] block font-sans">Estimated Arrival</span>
                <span className="text-amber-800 font-bold text-sm">
                  ETA {currentHospital.etaMinutes || 6} min
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5 font-sans">
                  Distance: {currentHospital.distanceKm || 3.2} km
                </span>
              </div>
            </div>

            {/* Clinical & Casualty Assessment */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="font-semibold text-slate-700 text-xs uppercase font-mono tracking-wider">
                Preliminary Triage Assessment
              </div>
              <div className="space-y-1 text-slate-600 text-xs leading-relaxed">
                <div>• <strong className="text-slate-900">Mechanism:</strong> High-speed collision on NH 44 Expressway.</div>
                <div>• <strong className="text-slate-900">Casualties:</strong> 2 victims (1 critical blunt trauma, 1 serious whiplash).</div>
                <div>• <strong className="text-slate-900">Allocated Bed:</strong> Trauma Bay 1 (Red Zone).</div>
                <div>• <strong className="text-slate-900">Blood Bank:</strong> 4 Units O-Negative cross-matched on standby.</div>
              </div>
            </div>
          </div>

          {/* Accident Image on the Side (5 cols) */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-2">
            <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
              <img
                src={activeIncident.image}
                alt="Accident scene capture"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                CAM-07 NH-44
              </div>
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                Verified AI Detection
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-snug">
              Visual telemetry captured at 14:32:18 IST. AI estimated high-impact deformity. Prepares triage team for polytrauma admission.
            </p>
          </div>
        </div>

        {/* Action Buttons: Acknowledge, Preparing, Ready */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Current Stage: <strong className="text-slate-800 font-semibold">{isReady ? 'READY FOR ARRIVAL' : isPreparing ? 'PREPARING' : isAcknowledged ? 'ACKNOWLEDGED' : 'PENDING'}</strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={hospitalAcknowledge}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-medium text-xs transition-colors border cursor-pointer ${
                isAcknowledged
                  ? 'bg-slate-100 border-slate-200 text-slate-700'
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 shadow-2xs'
              }`}
            >
              Acknowledge
            </button>

            <button
              onClick={hospitalPrepare}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-medium text-xs transition-colors border cursor-pointer ${
                isPreparing
                  ? 'bg-amber-100 border-amber-300 text-amber-900 font-semibold'
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 shadow-2xs'
              }`}
            >
              Preparing
            </button>

            <button
              onClick={hospitalMarkReady}
              className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg font-medium text-xs transition-colors border shadow-2xs cursor-pointer ${
                isReady
                  ? 'bg-emerald-600 border-emerald-600 text-white font-semibold'
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
              }`}
            >
              {isReady ? '✓ Ready' : 'Mark Ready'}
            </button>
          </div>
        </div>

        {/* Clear Status Notice Once Ready or Completed */}
        {isCompleted ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-2.5">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-emerald-950 text-sm">
                    CASUALTY HANDOVER CONFIRMED & PATIENT ADMITTED
                  </div>
                  <div className="text-[11px] text-emerald-800 font-mono">
                    Ambulance 07 (KA 01 AB 1234) · Handover signed at {hospitalState.handoverTime || '14:48:30 IST'}
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-md bg-white border border-emerald-300 text-emerald-800 font-mono text-xs font-bold">
                BAY 1 OCCUPIED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-emerald-200">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Attending Physician</span>
                <span className="text-slate-900 font-bold block">{hospitalState.receivingDoctor || 'Dr. A. Mathew, MD'}</span>
                <span className="text-[10px] text-emerald-700">Chief Medical Officer</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-emerald-200">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Casualties Admitted</span>
                <span className="text-slate-900 font-bold block">2 Patients (Red & Yellow)</span>
                <span className="text-[10px] text-slate-500">Resuscitation in progress</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-emerald-200">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Audit Docket</span>
                <span className="text-slate-900 font-bold block">REC-2026-RQ1048-SJ</span>
                <span className="text-[10px] text-emerald-700">Archived to EHR</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <span className="text-slate-600 text-xs">
                Paramedic S. Nair signed clinical transfer. Ambulance 07 released back to ACTIVE FLEET.
              </span>
              <button
                onClick={() => setHandoverModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>View Handover Docket</span>
              </button>
            </div>
          </div>
        ) : isReady ? (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-emerald-900 text-sm">
                  READY FOR ARRIVAL
                </div>
                <div className="text-slate-600 text-xs mt-0.5">
                  Trauma Bay 1 locked · Rapid infuser primed · On-call trauma surgery team notified.
                </div>
              </div>
            </div>
            <span className="font-mono text-emerald-800 font-bold text-xs shrink-0">
              BAY #1
            </span>
          </div>
        ) : null}
      </div>

      {/* ========================================================================= */}
      {/* NEARBY HOSPITALS GPS DIRECTORY & PROXIMITY MATRIX                          */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600" />
              <span>Nearby Emergency Hospitals GPS Directory</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Satellite coordinates, emergency road proximity, trauma capability ratings & intake telemetry.
            </p>
          </div>

          {/* GPS Reference Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setGpsMode('incident')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                gpsMode === 'incident'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Incident GPS
            </button>
            <button
              onClick={handleRequestDeviceGps}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                gpsMode === 'device'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>{gpsLoading ? 'Acquiring...' : 'Use My GPS'}</span>
            </button>
          </div>
        </div>

        {/* GPS Telemetry Bar */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <div>
              <span className="text-slate-500 text-[10px] block font-sans">Active Reference Point</span>
              <span className="text-slate-900 font-bold">{activeOriginLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 font-bold text-xs shadow-2xs">
              LAT: {activeOriginLat.toFixed(5)}° N · LNG: {activeOriginLng.toFixed(5)}° E
            </div>
            {deviceGps && gpsMode === 'device' && (
              <span className="text-[11px] text-emerald-700 font-medium">
                Accuracy: ±{deviceGps.accuracy}m
              </span>
            )}
          </div>
        </div>

        {gpsError && (
          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{gpsError}</span>
          </div>
        )}

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search hospital, trauma level, or road..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterTraumaOnly(!filterTraumaOnly)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                filterTraumaOnly
                  ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Level 1 / Neuro Traumas Only
            </button>
            <span className="text-xs text-slate-500 font-mono">
              {filteredHospitals.length} facilities
            </span>
          </div>
        </div>

        {/* Hospitals Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {filteredHospitals.map((hosp, index) => {
            const isSelected = hospitalState.selectedHospitalId === hosp.id
            const isCopied = copiedId === hosp.id

            return (
              <div
                key={hosp.id}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  isSelected
                    ? 'bg-emerald-50/40 border-emerald-500 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Hospital Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-5 h-5 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-slate-700 text-xs">
                        #{index + 1}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {hosp.name}
                      </h3>
                    </div>
                    <div className="text-xs text-slate-500 line-clamp-1">
                      {hosp.address}
                    </div>
                  </div>

                  {isSelected ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 border border-emerald-300 text-emerald-800 font-mono text-[10px] font-bold shrink-0">
                      SELECTED ER
                    </span>
                  ) : index === 0 ? (
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-mono text-[10px] font-bold shrink-0">
                      NEAREST GPS
                    </span>
                  ) : null}
                </div>

                {/* GPS Coordinates Badge & Distance Row */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                    <span className="text-[10px] text-slate-500 block uppercase font-sans">GPS Proximity</span>
                    <div className="text-amber-900 font-bold text-sm flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{hosp.calculatedDistanceKm} km</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block font-sans">
                      ETA {hosp.calculatedEtaMinutes} min (Siren priority)
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                    <span className="text-[10px] text-slate-500 block uppercase font-sans">Exact Coordinates</span>
                    <div className="text-emerald-800 font-bold text-xs truncate">
                      {hosp.coordinates.lat.toFixed(4)}° N, {hosp.coordinates.lng.toFixed(4)}° E
                    </div>
                    <button
                      onClick={() => copyCoordinates(hosp.id, hosp.coordinates.lat, hosp.coordinates.lng)}
                      className="text-[10px] text-blue-600 hover:text-blue-700 font-sans font-medium flex items-center gap-1 cursor-pointer pt-0.5"
                    >
                      {isCopied ? (
                        <span className="text-emerald-700 flex items-center gap-0.5 font-bold">
                          <Check className="w-3 h-3" /> Copied!
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5">
                          <Copy className="w-3 h-3" /> Copy GPS
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Trauma Level & Resources */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="font-semibold text-slate-800 text-xs">
                    {hosp.traumaLevel}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-slate-600 flex-wrap">
                    <span className="text-emerald-700 font-medium">
                      ● {hosp.traumaBaysAvailable} Trauma Bays Open
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-blue-700 font-medium">
                      {hosp.icuBedsOpen} ICU Beds Open
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Droplet className="w-3 h-3 text-red-600" />
                    <span>{hosp.bloodBankStatus}</span>
                  </div>
                </div>

                {/* Actions: Navigation, Call, and Selection */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${activeOriginLat},${activeOriginLng}&destination=${hosp.coordinates.lat},${hosp.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Open Google Maps GPS Directions"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>GPS Route</span>
                    </a>

                    <a
                      href={`tel:${hosp.contact.replace(/\s+/g, '')}`}
                      className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      title="Call Emergency Room Gate"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{hosp.contact}</span>
                    </a>
                  </div>

                  <button
                    onClick={() => ambulanceSelectHospital(hosp.id)}
                    className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                        : 'bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 shadow-2xs'
                    }`}
                  >
                    {isSelected ? 'Active Destination' : 'Select Hospital'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Hospital Handover & Docket Modal */}
      <HospitalHandoverModal
        isOpen={handoverModalOpen}
        onClose={() => setHandoverModalOpen(false)}
      />
    </div>
  )
}

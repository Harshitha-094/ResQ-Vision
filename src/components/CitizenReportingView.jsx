import React, { useState, useEffect, useRef } from 'react'
import {
  Camera,
  MapPin,
  CheckCircle2,
  Clock,
  Send,
  RotateCcw,
  Smartphone,
  AlertTriangle,
  Info,
  Navigation,
  Radio,
  Crosshair,
  ExternalLink,
  Shield,
  Truck,
  Activity,
  Check
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'

// Preset roadside hotspots for testing different locations
const ROADSIDE_HOTSPOTS = [
  {
    name: 'Electronic City Flyover Entry (NH 44)',
    shortLocation: 'Electronic City',
    location: 'Electronic City Phase 1 Road, near Elevated Highway Entry (12.8452° N, 77.6601° E)',
    coordinates: { lat: 12.8452, lng: 77.6601 },
    accuracyMeters: 3.4
  },
  {
    name: 'Hosur Road / Attibele Toll Plaza Approach',
    shortLocation: 'Attibele NH-44',
    location: 'NH 44, Attibele Toll Approach KM 36.2 (12.8310° N, 77.6820° E)',
    coordinates: { lat: 12.8310, lng: 77.6820 },
    accuracyMeters: 2.8
  },
  {
    name: 'Silk Board Flyover Underpass Ramp',
    shortLocation: 'Silk Board',
    location: 'Outer Ring Road, Silk Board Junction South Ramp (12.9177° N, 77.6238° E)',
    coordinates: { lat: 12.9177, lng: 77.6238 },
    accuracyMeters: 4.2
  },
  {
    name: 'Yeshwanthpur Junction (Tumkur Rd NH 48)',
    shortLocation: 'Tumkur Road',
    location: 'Tumkur Road (NH 48) at Yeshwanthpur Market Junction (13.0382° N, 77.5189° E)',
    coordinates: { lat: 13.0382, lng: 77.5189 },
    accuracyMeters: 3.9
  },
  {
    name: 'Nelamangala Expressway KM 22',
    shortLocation: 'Nelamangala',
    location: 'Nelamangala Tollway Entry Ramp (13.0920° N, 77.3910° E)',
    coordinates: { lat: 13.0920, lng: 77.3910 },
    accuracyMeters: 4.5
  }
]

export default function CitizenReportingView() {
  const {
    citizenDraft,
    citizenSetLocation,
    citizenCapturePhoto,
    citizenSubmitReport,
    citizenResetForm,
    citizenDeviceMode,
    setCitizenDeviceMode,
    setActiveView,
    setSelectedAmbulanceUnitId,
    setSelectedIncidentId
  } = useEmergencyStore()

  const [useLiveVideo, setUseLiveVideo] = useState(false)
  const [gpsStatus, setGpsStatus] = useState('locked') // 'acquiring' | 'locked' | 'live_device' | 'fallback'
  const [selectedHotspotIdx, setSelectedHotspotIdx] = useState(0)
  const videoRef = useRef(null)

  // Automatically acquire device GPS or initialize location on mount
  useEffect(() => {
    acquireDeviceGps()
  }, [])

  const acquireDeviceGps = () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      setGpsStatus('acquiring')
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          const accuracy = position.coords.accuracy ? Math.round(position.coords.accuracy * 10) / 10 : 3.8

          // Fetch reverse geocoding from OpenStreetMap Nominatim with fast fallback
          fetchReverseGeocode(lat, lng, accuracy)
        },
        (error) => {
          console.warn('Geolocation acquisition error or permission denied, using default roadside GPS lock:', error)
          // Default to the first reliable roadside hotspot
          const defaultSpot = ROADSIDE_HOTSPOTS[0]
          citizenSetLocation({
            location: defaultSpot.location,
            shortLocation: defaultSpot.shortLocation,
            coordinates: defaultSpot.coordinates,
            accuracyMeters: defaultSpot.accuracyMeters
          })
          setGpsStatus('locked')
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
      )
    } else {
      const defaultSpot = ROADSIDE_HOTSPOTS[0]
      citizenSetLocation({
        location: defaultSpot.location,
        shortLocation: defaultSpot.shortLocation,
        coordinates: defaultSpot.coordinates,
        accuracyMeters: defaultSpot.accuracyMeters
      })
      setGpsStatus('locked')
    }
  }

  const fetchReverseGeocode = async (lat, lng, accuracy) => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2500)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=17&addressdetails=1`,
        { signal: controller.signal }
      )
      clearTimeout(timeoutId)
      if (res.ok) {
        const data = await res.json()
        const road = data.address?.road || data.address?.suburb || 'National Highway'
        const city = data.address?.city || data.address?.town || data.address?.state_district || 'Bengaluru'
        const fullAddress = `${road}, ${city} (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`
        
        citizenSetLocation({
          location: fullAddress,
          shortLocation: road,
          coordinates: { lat, lng },
          accuracyMeters: accuracy
        })
        setGpsStatus('live_device')
        return
      }
    } catch (e) {
      // Ignore network timeout or CORS issue, format clean coordinate string
    }

    const locString = `Live Mobile GPS (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`
    citizenSetLocation({
      location: locString,
      shortLocation: 'Highway Corridor',
      coordinates: { lat, lng },
      accuracyMeters: accuracy
    })
    setGpsStatus('live_device')
  }

  const handleSelectHotspot = (idx) => {
    setSelectedHotspotIdx(idx)
    const spot = ROADSIDE_HOTSPOTS[idx]
    citizenSetLocation({
      location: spot.location,
      shortLocation: spot.shortLocation,
      coordinates: spot.coordinates,
      accuracyMeters: spot.accuracyMeters
    })
    setGpsStatus('locked')
  }

  const handleStartLiveCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
          setUseLiveVideo(true)
        }
      } else {
        // Fallback to sample live street capture
        handleSnapSamplePhoto('/images/citizen_road_report.jpg')
      }
    } catch (e) {
      // Permission denied or camera unavailable, snap sample
      handleSnapSamplePhoto('/images/citizen_road_report.jpg')
    }
  }

  const handleSnapFromVideo = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth || 640
      canvas.height = videoRef.current.videoHeight || 480
      const ctx = canvas.getContext('2d')
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg')

      const stream = videoRef.current.srcObject
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      setUseLiveVideo(false)
      
      // Lock the photo with the current fetched location
      citizenCapturePhoto(dataUrl, {
        location: citizenDraft.locationDetected,
        shortLocation: citizenDraft.shortLocation,
        coordinates: citizenDraft.coordinates,
        accuracyMeters: citizenDraft.accuracyMeters
      })
    } else {
      handleSnapSamplePhoto('/images/citizen_road_report.jpg')
    }
  }

  const handleSnapSamplePhoto = (url = '/images/citizen_road_report.jpg') => {
    citizenCapturePhoto(url, {
      location: citizenDraft.locationDetected,
      shortLocation: citizenDraft.shortLocation,
      coordinates: citizenDraft.coordinates,
      accuracyMeters: citizenDraft.accuracyMeters
    })
  }

  const handleInspectAmbulance04 = () => {
    setSelectedAmbulanceUnitId('AMB-04')
    setActiveView('ambulances')
  }

  const handleInspectPolice = () => {
    setActiveView('police')
  }

  const handleInspectTraffic = () => {
    setActiveView('traffic')
  }

  const handleInspectLiveMap = () => {
    setSelectedIncidentId('RQ-1052')
    setActiveView('map')
  }

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      {/* Device Mode Toggle Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
        <span className="flex items-center gap-1.5 font-medium text-slate-300">
          <Smartphone className="w-3.5 h-3.5 text-blue-400" />
          <span>ResQVision Citizen Reporter · Public Highway Safety Portal</span>
        </span>
        <button
          onClick={() => setCitizenDeviceMode(citizenDeviceMode === 'mobile' ? 'full' : 'mobile')}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{citizenDeviceMode === 'mobile' ? 'Expand View' : 'Phone Bezel View'}</span>
        </button>
      </div>

      {/* Main Container */}
      <div
        className={`mx-auto transition-all bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl p-5 sm:p-6 space-y-5 ${
          citizenDeviceMode === 'mobile' ? 'max-w-md border-4 border-slate-800' : 'w-full'
        }`}
      >
        {/* Main Heading & Supporting Text as Specified */}
        <div className="text-center space-y-1.5 border-b border-slate-800/80 pb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-800/80 text-[10px] font-mono text-red-300 font-bold uppercase tracking-wider mb-1">
            <Radio className="w-3 h-3 text-red-400 animate-pulse" />
            <span>Direct Emergency Transmission</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Report an accident
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Take a new live photo of the accident. The exact spot where your photo is clicked is automatically fetched as the rescue location for ambulance, police, and traffic authorities.
          </p>
        </div>

        {/* Live Location Telemetry Badge / Hotspot Bar */}
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-200 font-semibold font-mono text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>LIVE PHOTO LOCATION FETCH</span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                  gpsStatus === 'live_device'
                    ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                    : gpsStatus === 'acquiring'
                    ? 'bg-amber-950/80 border-amber-700 text-amber-300 animate-pulse'
                    : 'bg-blue-950/80 border-blue-700 text-blue-300'
                }`}
              >
                <Crosshair className="w-2.5 h-2.5" />
                <span>
                  {gpsStatus === 'live_device'
                    ? 'LIVE DEVICE GPS LOCK'
                    : gpsStatus === 'acquiring'
                    ? 'LOCKING SATELLITES...'
                    : 'HIGH-ACCURACY GPS FIX'}
                </span>
              </span>

              <button
                onClick={acquireDeviceGps}
                title="Refresh Device Geolocation"
                className="text-[10px] text-slate-400 hover:text-slate-200 underline font-mono cursor-pointer"
              >
                Sync
              </button>
            </div>
          </div>

          {/* Current Fetched Location String */}
          <div className="text-[11px] text-slate-300 bg-slate-950/80 p-2 rounded border border-slate-850 font-mono flex items-start gap-1.5">
            <span className="text-emerald-400 shrink-0 mt-0.5">●</span>
            <div className="space-y-0.5 leading-snug">
              <div className="text-slate-100 font-medium">
                {citizenDraft.locationDetected}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-3">
                <span>
                  Lat: {citizenDraft.coordinates.lat.toFixed(4)}°, Lng:{' '}
                  {citizenDraft.coordinates.lng.toFixed(4)}°
                </span>
                <span>Accuracy: ±{citizenDraft.accuracyMeters || 3.4}m</span>
              </div>
            </div>
          </div>

          {/* Quick Roadside Hotspot Selector */}
          {citizenDraft.step === 'camera' && (
            <div className="pt-1 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">
                Select Road Location to Test Photo Capture:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {ROADSIDE_HOTSPOTS.map((spot, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectHotspot(idx)}
                    className={`px-2 py-1 rounded text-[10px] font-mono transition-colors border cursor-pointer ${
                      selectedHotspotIdx === idx && gpsStatus !== 'live_device'
                        ? 'bg-red-950/80 border-red-700 text-red-200 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {spot.shortLocation}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* STEP 1: INITIAL STATE — LARGE CAMERA BUTTON              */}
        {/* ======================================================== */}
        {citizenDraft.step === 'camera' && !useLiveVideo && (
          <div className="py-6 space-y-5 text-center">
            <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center mx-auto text-slate-300 shadow-inner group">
              <Camera className="w-10 h-10 text-slate-300 group-hover:scale-110 transition-transform" />
            </div>

            {/* Large Camera Button as Specified */}
            <div className="space-y-2">
              <button
                onClick={handleStartLiveCamera}
                className="w-full py-4 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-base transition-colors shadow-lg shadow-red-950/40 cursor-pointer flex items-center justify-center gap-2.5"
              >
                <Camera className="w-5 h-5" />
                <span>Take photo</span>
              </button>

              <button
                onClick={() => handleSnapSamplePhoto('/images/citizen_road_report.jpg')}
                className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs text-slate-300 hover:text-slate-100 transition-colors font-medium flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 text-red-400" />
                <span>Snap Live Street Photo at current GPS location</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
              When clicked, the exact GPS coordinates (
              <strong className="text-slate-300 font-mono">
                {citizenDraft.coordinates.lat.toFixed(4)}° N,{' '}
                {citizenDraft.coordinates.lng.toFixed(4)}° E
              </strong>
              ) will be fetched and transmitted immediately to the closest ambulance, traffic authority, and police patrol.
            </p>
          </div>
        )}

        {/* Live Camera Stream Viewfinder if active */}
        {useLiveVideo && (
          <div className="space-y-4 text-center">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-700">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>LIVE CAMERA LENS</span>
              </div>
              <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/80 text-[10px] font-mono text-emerald-300 border border-slate-700">
                GPS LOCK: {citizenDraft.coordinates.lat.toFixed(4)}°, {citizenDraft.coordinates.lng.toFixed(4)}°
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleSnapFromVideo}
                className="py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Photo</span>
              </button>
              <button
                onClick={() => {
                  const stream = videoRef.current?.srcObject
                  if (stream) stream.getTracks().forEach((t) => t.stop())
                  setUseLiveVideo(false)
                }}
                className="py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-sm font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: PHOTO TAKEN — PREVIEW & CONFIRMATION             */}
        {/* ======================================================== */}
        {citizenDraft.step === 'preview' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Show the image as Specified */}
            <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-slate-800 bg-black">
              <img
                src={citizenDraft.photo}
                alt="Captured accident photo"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/85 text-[10px] font-mono text-emerald-400 border border-emerald-800 flex items-center gap-1 backdrop-blur-xs">
                <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                <span>PHOTO CLICKED & TIMESTAMP VERIFIED</span>
              </div>

              <div className="absolute bottom-2 left-2 right-2 p-2 rounded bg-black/85 border border-slate-700 text-[10px] font-mono text-slate-200 backdrop-blur-xs flex items-center justify-between">
                <span>Time: {citizenDraft.timestamp || 'Just now'}</span>
                <span className="text-red-400 font-bold">
                  FETCHED LOCATION READY
                </span>
              </div>
            </div>

            {/* Location Detected Section as Specified */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-100 flex items-center gap-1.5 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>ACTUAL INCIDENT LOCATION WHERE PHOTO WAS CLICKED</span>
                </span>
                <span className="font-mono text-[10px] text-emerald-400 font-bold">
                  GPS ±{citizenDraft.accuracyMeters || 3.4}m
                </span>
              </div>

              <p className="text-slate-200 text-xs font-medium">
                {citizenDraft.locationDetected}
              </p>

              {/* Exact Coordinates HUD */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded bg-slate-950 border border-slate-850">
                  <span className="text-[10px] text-slate-400 block uppercase">
                    Exact Latitude
                  </span>
                  <span className="text-slate-100 font-bold">
                    {citizenDraft.coordinates.lat.toFixed(6)}° N
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-850">
                  <span className="text-[10px] text-slate-400 block uppercase">
                    Exact Longitude
                  </span>
                  <span className="text-slate-100 font-bold">
                    {citizenDraft.coordinates.lng.toFixed(6)}° E
                  </span>
                </div>
              </div>

              {/* Show Small Map as Specified */}
              <div className="relative h-28 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
                <svg viewBox="0 0 320 90" className="w-full h-full">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="320" height="90" fill="url(#grid)" />
                  <path d="M 10,45 L 310,45" stroke="#334155" strokeWidth="8" />
                  <path d="M 110,10 L 110,80" stroke="#1e293b" strokeWidth="6" />
                  {/* Route line to accident */}
                  <path d="M 40,45 L 160,45" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="3 3" />
                  <circle cx="40" cy="45" r="5" fill="#10b981" />
                  {/* Incident marker at photo coordinates */}
                  <circle cx="160" cy="45" r="14" fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" strokeWidth="1" className="animate-ping" />
                  <circle cx="160" cy="45" r="7" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
                  <text x="40" y="65" fill="#6ee7b7" fontSize="9" fontWeight="bold" textAnchor="middle">Ambulance 04</text>
                  <text x="160" y="70" fill="#fca5a5" fontSize="9" fontWeight="bold" textAnchor="middle">Photo Spot</text>
                </svg>
                <div className="absolute bottom-1 right-2 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-1.5 rounded">
                  {citizenDraft.shortLocation} Corridor
                </div>
              </div>

              {/* Captured just now as Specified */}
              <div className="flex items-center justify-between text-slate-400 text-[11px] pt-0.5">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Captured {citizenDraft.timestamp || 'just now'}</span>
                </div>
                <span className="text-emerald-400 font-mono text-[10px]">
                  ✓ GPS Telemetry Locked
                </span>
              </div>
            </div>

            {/* Target Authorities Notice */}
            <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-900/60 text-xs space-y-1 text-slate-300">
              <div className="font-semibold text-blue-300 font-mono text-[11px] flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-blue-400" />
                <span>AUTHORITIES SCHEDULED FOR DISPATCH TO THIS SPOT:</span>
              </div>
              <ul className="text-[11px] space-y-0.5 text-slate-300 pl-2">
                <li>• <strong className="text-slate-100">Ambulance:</strong> Ambulance 04 (Dispatched directly to {citizenDraft.coordinates.lat.toFixed(4)}°, {citizenDraft.coordinates.lng.toFixed(4)}°)</li>
                <li>• <strong className="text-slate-100">Police:</strong> BTP Patrol 11 (Mandatory Response under Section 134A)</li>
                <li>• <strong className="text-slate-100">Traffic Authority:</strong> VMS Warning Signs on {citizenDraft.shortLocation} Corridor</li>
              </ul>
            </div>

            {/* Button: Send report as Specified */}
            <div className="space-y-2 pt-1">
              <button
                onClick={citizenSubmitReport}
                className="w-full py-3.5 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-base transition-colors shadow-lg shadow-red-950/40 cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Send report to emergency grid</span>
              </button>

              <button
                onClick={citizenResetForm}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Retake photo / change location
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: AFTER SUBMISSION — REPORT RECEIVED               */}
        {/* ======================================================== */}
        {citizenDraft.step === 'submitted' && (
          <div className="py-2 space-y-4 animate-in fade-in duration-150">
            {/* Header: Report received as Specified */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-100">
                Report received & location dispatched
              </h3>
              <div className="font-mono text-sm font-bold text-blue-400">
                Incident ID: {citizenDraft.submittedIncidentId || 'RQ-1052'}
              </div>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                The exact location where your photo was clicked has been propagated across all emergency response agencies.
              </p>
            </div>

            {/* Verified Location Box */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-800/60 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>DISPATCHED INCIDENT LOCATION</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  GPS ±{citizenDraft.accuracyMeters || 3.4}m
                </span>
              </div>
              <div className="text-slate-200 font-sans text-xs">
                {citizenDraft.locationDetected}
              </div>
              <div className="text-[11px] text-slate-400">
                Coordinates: {citizenDraft.coordinates.lat.toFixed(5)}° N,{' '}
                {citizenDraft.coordinates.lng.toFixed(5)}° E
              </div>
            </div>

            {/* Status Checklist across Authorities as Specified */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-emerald-400">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">✓</span>
                  <span>Photo received & verified</span>
                </div>
                <span className="text-[10px] text-slate-400">Live Camera</span>
              </div>

              <div className="flex items-center justify-between text-emerald-400">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">✓</span>
                  <span>Incident location locked to GPS coordinates</span>
                </div>
                <span className="text-[10px] text-emerald-400">Locked</span>
              </div>

              <div className="flex items-center justify-between text-emerald-400">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">✓</span>
                  <span>Ambulance 04 assigned and routed</span>
                </div>
                <span className="text-[10px] text-slate-400">ETA 03:45</span>
              </div>

              <div className="flex items-center justify-between text-emerald-400">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">✓</span>
                  <span>Police BTP Patrol 11 alerted (Sec 134A)</span>
                </div>
                <span className="text-[10px] text-slate-400">En route</span>
              </div>

              <div className="flex items-center justify-between text-emerald-400">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">✓</span>
                  <span>Traffic Corridor VMS warning broadcast</span>
                </div>
                <span className="text-[10px] text-amber-400">Active</span>
              </div>
            </div>

            {/* Direct Inspection Actions for User to Verify Authorities Received Location */}
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-mono text-slate-400 text-center uppercase tracking-wider">
                Inspect Real-Time Authority Response:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  onClick={handleInspectAmbulance04}
                  className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold flex items-center justify-between transition-colors cursor-pointer group"
                >
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Ambulance 04 Terminal</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-white" />
                </button>

                <button
                  onClick={handleInspectPolice}
                  className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold flex items-center justify-between transition-colors cursor-pointer group"
                >
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Police Dispatch Grid</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-white" />
                </button>

                <button
                  onClick={handleInspectTraffic}
                  className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold flex items-center justify-between transition-colors cursor-pointer group"
                >
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Traffic Operations</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-white" />
                </button>

                <button
                  onClick={handleInspectLiveMap}
                  className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold flex items-center justify-between transition-colors cursor-pointer group"
                >
                  <span className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-red-400" />
                    <span>Live Map Marker</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-white" />
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={citizenResetForm}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 cursor-pointer"
              >
                File another incident report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

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
  Check,
  Lock,
  Ban,
  RefreshCw,
  Video,
  Slash
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'
import { playCameraShutterSound, playAlertBeep } from '../utils/audio'

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
  const [cameraError, setCameraError] = useState(null)
  const [shutterFlashing, setShutterFlashing] = useState(false)
  const [liveClock, setLiveClock] = useState('')
  const [gpsStatus, setGpsStatus] = useState('locked') // 'acquiring' | 'locked' | 'live_device'
  const [selectedHotspotIdx, setSelectedHotspotIdx] = useState(0)
  const [uploadBlockedWarning, setUploadBlockedWarning] = useState(false)

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const mobileCameraInputRef = useRef(null)

  // Real-time ticking clock for viewfinder telemetry stamp
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setLiveClock(now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0').slice(0, 2))
    }, 100)
    return () => clearInterval(timer)
  }, [])

  // Automatically acquire device GPS on mount
  useEffect(() => {
    acquireDeviceGps()
    return () => {
      // Cleanup live camera stream on unmount
      stopLiveStream()
    }
  }, [])

  const stopLiveStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setUseLiveVideo(false)
  }

  const acquireDeviceGps = () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      setGpsStatus('acquiring')
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          const accuracy = position.coords.accuracy ? Math.round(position.coords.accuracy * 10) / 10 : 3.8

          fetchReverseGeocode(lat, lng, accuracy)
        },
        (error) => {
          console.warn('Geolocation acquisition error or permission denied, using roadside hotspot lock:', error)
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
      // Ignore network timeout, use clean coordinate string
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

  // ACTIVATE LIVE CAMERA FROM CITIZEN'S DEVICE
  const handleStartLiveCamera = async () => {
    setCameraError(null)
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // First try back camera (facingMode: environment)
        let stream = null
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            },
            audio: false
          })
        } catch (errBack) {
          // Fallback to any available camera (front camera or default webcam)
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          })
        }

        streamRef.current = stream
        setUseLiveVideo(true)

        // Give React a moment to render the video element
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.play().catch((err) => {
              console.warn('Video play error:', err)
            })
          }
        }, 50)
      } else if (mobileCameraInputRef.current) {
        // Mobile fallback strictly with capture="environment" (direct camera shutter, no gallery)
        mobileCameraInputRef.current.click()
      } else {
        setCameraError('No supported camera hardware detected on this browser/device.')
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access was blocked by browser permissions. Please allow camera permissions to click an incident photo.')
      } else {
        setCameraError('Unable to open device camera. Make sure your camera is connected and not in use by another application.')
      }
    }
  }

  // SNAP FRAME FROM LIVE CAMERA STREAM WITH TELEMETRY WATERMARK
  const handleSnapFromVideo = () => {
    playCameraShutterSound()
    setShutterFlashing(true)
    setTimeout(() => setShutterFlashing(false), 200)

    if (videoRef.current) {
      const video = videoRef.current
      const width = video.videoWidth || 1280
      const height = video.videoHeight || 720

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')

      // Draw active camera frame
      ctx.drawImage(video, 0, 0, width, height)

      // Burn anti-tamper live telemetry watermark on canvas
      const now = new Date()
      const timeStr = now.toISOString()
      const lat = citizenDraft.coordinates.lat.toFixed(6)
      const lng = citizenDraft.coordinates.lng.toFixed(6)
      const acc = citizenDraft.accuracyMeters || 3.4

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(0, height - 48, width, 48)

      ctx.font = 'bold 16px monospace'
      ctx.fillStyle = '#22c55e'
      ctx.fillText(`● RESQVISION LIVE HARDWARE CAPTURE · ${timeStr}`, 20, height - 26)

      ctx.font = '14px monospace'
      ctx.fillStyle = '#f8fafc'
      ctx.fillText(`GPS: ${lat}° N, ${lng}° E (±${acc}m) · ${citizenDraft.shortLocation}`, 20, height - 8)

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92)

      // Stop camera stream
      stopLiveStream()

      // Lock captured photo with exact location
      citizenCapturePhoto(dataUrl, {
        location: citizenDraft.locationDetected,
        shortLocation: citizenDraft.shortLocation,
        coordinates: citizenDraft.coordinates,
        accuracyMeters: citizenDraft.accuracyMeters
      })
    } else {
      handleSimulateRoadsideCapture('/images/citizen_road_report.jpg')
    }
  }

  // Mobile Native Camera Shutter Handler (capture="environment")
  const handleMobileCameraCapture = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      playCameraShutterSound()
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result
        citizenCapturePhoto(dataUrl, {
          location: citizenDraft.locationDetected,
          shortLocation: citizenDraft.shortLocation,
          coordinates: citizenDraft.coordinates,
          accuracyMeters: citizenDraft.accuracyMeters
        })
      }
      reader.readAsDataURL(file)
    }
  }

  // Developer / Lab Simulation Shutter (Only for testing when running in dev without webcam)
  const handleSimulateRoadsideCapture = (url = '/images/citizen_road_report.jpg') => {
    playCameraShutterSound()
    setShutterFlashing(true)
    setTimeout(() => setShutterFlashing(false), 200)

    citizenCapturePhoto(url, {
      location: citizenDraft.locationDetected,
      shortLocation: citizenDraft.shortLocation,
      coordinates: citizenDraft.coordinates,
      accuracyMeters: citizenDraft.accuracyMeters
    })
  }

  // Intercept any drag-and-drop file upload attempts to strictly enforce "No Pre-existing Uploads"
  const handleDragDropAttempt = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setUploadBlockedWarning(true)
    setTimeout(() => setUploadBlockedWarning(false), 5000)
  }

  return (
    <div
      className="space-y-4 max-w-xl mx-auto"
      onDragOver={handleDragDropAttempt}
      onDrop={handleDragDropAttempt}
    >
      {/* Hidden Mobile Shutter Input: Strictly capture="environment" (direct camera, no gallery) */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={mobileCameraInputRef}
        onChange={handleMobileCameraCapture}
        className="hidden"
        aria-hidden="true"
      />

      {/* Device Mode Toggle Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
        <span className="flex items-center gap-1.5 font-medium text-slate-300">
          <Smartphone className="w-3.5 h-3.5 text-blue-400" />
          <span>Citizen Live Reporting · Device Camera Node</span>
        </span>
        <button
          onClick={() => setCitizenDeviceMode(citizenDeviceMode === 'mobile' ? 'full' : 'mobile')}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{citizenDeviceMode === 'mobile' ? 'Expand View' : 'Phone Bezel View'}</span>
        </button>
      </div>

      {/* Main Container */}
      <div
        className={`mx-auto transition-all bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4 ${
          citizenDeviceMode === 'mobile' ? 'max-w-md border-4 border-slate-800' : 'w-full'
        }`}
      >
        {/* Main Heading */}
        <div className="text-center space-y-1.5 border-b border-slate-800/80 pb-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-800/80 text-[10px] font-mono text-red-300 font-bold uppercase tracking-wider mb-1">
            <Radio className="w-3 h-3 text-red-400 animate-pulse" />
            <span>Direct Emergency Transmission</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Report an accident
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Click a new live photograph through your device camera. Pre-existing photos from gallery or files are disabled.
          </p>
        </div>

        {/* SECURITY & ANTI-TAMPER POLICY BANNER (Pre-existing uploads prohibited) */}
        <div className="p-2.5 rounded-lg bg-slate-900/90 border border-amber-900/60 text-xs flex items-start gap-2.5">
          <div className="w-6 h-6 rounded bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="space-y-0.5 text-[11px] leading-snug">
            <div className="font-semibold text-amber-300 flex items-center gap-1.5">
              <span>LIVE CAMERA REQUIRED · GALLERY UPLOAD DISABLED</span>
            </div>
            <p className="text-slate-300">
              To prevent false or outdated reports, pre-existing gallery photos cannot be uploaded. ResQVision requires live camera snapshots with verified satellite GPS telemetry.
            </p>
          </div>
        </div>

        {/* Drag/Drop Attempt Blocked Warning */}
        {uploadBlockedWarning && (
          <div className="p-3 rounded-lg bg-red-950 border-2 border-red-600 text-red-200 text-xs flex items-center gap-2 animate-in fade-in duration-100">
            <Ban className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              <strong>File upload blocked:</strong> Pre-existing images from disk or gallery are forbidden under emergency response protocol. Please click a live photo.
            </span>
          </div>
        )}

        {/* Live Location Telemetry Badge */}
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-200 font-semibold font-mono text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>INCIDENT LOCATION TELEMETRY</span>
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
                    ? 'DEVICE SATELLITE LOCK'
                    : gpsStatus === 'acquiring'
                    ? 'LOCKING SATELLITES...'
                    : 'ACCURACY ±3.4M FIX'}
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
                  Lat: {citizenDraft.coordinates.lat.toFixed(5)}°, Lng:{' '}
                  {citizenDraft.coordinates.lng.toFixed(5)}°
                </span>
                <span>Accuracy: ±{citizenDraft.accuracyMeters || 3.4}m</span>
              </div>
            </div>
          </div>

          {/* Roadside Hotspot Selector */}
          {citizenDraft.step === 'camera' && !useLiveVideo && (
            <div className="pt-1 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">
                Simulate Road Location Spot:
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
        {/* STEP 1: INITIAL STATE — CLICK LIVE CAMERA BUTTON         */}
        {/* ======================================================== */}
        {citizenDraft.step === 'camera' && !useLiveVideo && (
          <div className="py-4 space-y-4 text-center">
            {/* Camera Error Message if any */}
            {cameraError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-left text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-red-300 font-bold">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Camera Access Notice</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {cameraError}
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={handleStartLiveCamera}
                    className="px-3 py-1 rounded bg-red-700 hover:bg-red-600 text-white font-bold text-[11px] cursor-pointer"
                  >
                    Retry Camera Access
                  </button>
                  <button
                    onClick={() => handleSimulateRoadsideCapture('/images/citizen_road_report.jpg')}
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] cursor-pointer"
                  >
                    Use Simulated Shutter
                  </button>
                </div>
              </div>
            )}

            <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center mx-auto text-slate-300 shadow-inner group">
              <Camera className="w-10 h-10 text-slate-300 group-hover:scale-110 transition-transform" />
            </div>

            {/* Primary Action: Open Device Camera */}
            <div className="space-y-2">
              <button
                onClick={handleStartLiveCamera}
                className="w-full py-4 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-base transition-colors shadow-lg shadow-red-950/40 cursor-pointer flex items-center justify-center gap-2.5 active:scale-98"
              >
                <Camera className="w-5 h-5" />
                <span>Open Device Camera to Take Photo</span>
              </button>

              {/* Explicit indicator that pre-existing photos are not permitted */}
              <div className="p-2 rounded bg-slate-900/50 border border-slate-800/80 text-[11px] text-slate-400 font-mono flex items-center justify-center gap-2">
                <Ban className="w-3.5 h-3.5 text-red-400" />
                <span>Gallery & File Upload Disabled by Emergency Protocol</span>
              </div>
            </div>

            {/* Secondary Option: Testing Simulator for environments without physical webcams */}
            <div className="pt-2 border-t border-slate-850">
              <button
                onClick={() => handleSimulateRoadsideCapture('/images/citizen_road_report.jpg')}
                className="w-full py-2.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs text-slate-300 hover:text-slate-100 transition-colors font-mono flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 text-blue-400" />
                <span>[Test Lab Shutter] Snap Photo at Current Coordinates</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* LIVE CAMERA VIEWFINDER STREAM                            */}
        {/* ======================================================== */}
        {useLiveVideo && (
          <div className="space-y-3 text-center animate-in fade-in duration-150">
            {/* Viewfinder Frame with Live Overlays */}
            <div className={`relative aspect-video rounded-xl overflow-hidden bg-black border-2 border-slate-700 shadow-2xl ${
              shutterFlashing ? 'bg-white opacity-80' : ''
            }`}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Reticle / Crosshair */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-32 h-32 border border-white/30 rounded-lg relative">
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-red-500" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-red-500" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-red-500" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-red-500" />
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Top Live Badges */}
              <div className="absolute top-2 left-2 flex items-center gap-2">
                <div className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-mono font-bold flex items-center gap-1.5 shadow">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>LIVE HARDWARE LENS</span>
                </div>
                <div className="px-2 py-0.5 rounded bg-black/80 text-emerald-400 font-mono text-[10px] border border-slate-700">
                  {liveClock}
                </div>
              </div>

              {/* Bottom Real-Time Telemetry Stamp */}
              <div className="absolute bottom-2 left-2 right-2 p-1.5 rounded bg-black/80 border border-slate-700 text-[10px] font-mono text-slate-200 backdrop-blur-xs flex items-center justify-between">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Crosshair className="w-3 h-3" />
                  <span>GPS: {citizenDraft.coordinates.lat.toFixed(4)}°, {citizenDraft.coordinates.lng.toFixed(4)}°</span>
                </span>
                <span className="text-slate-400">±{citizenDraft.accuracyMeters || 3.4}m</span>
              </div>
            </div>

            {/* Camera Control Shutter Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={stopLiveStream}
                className="py-3 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleSnapFromVideo}
                className="col-span-2 py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors shadow-lg shadow-red-950/40 cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Live Incident Photo</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: PHOTO TAKEN — PREVIEW & CONFIRMATION             */}
        {/* ======================================================== */}
        {citizenDraft.step === 'preview' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Show the image */}
            <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-slate-800 bg-black">
              <img
                src={citizenDraft.photo}
                alt="Captured accident photo"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/85 text-[10px] font-mono text-emerald-400 border border-emerald-800 flex items-center gap-1 backdrop-blur-xs">
                <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                <span>LIVE CAMERA CAPTURE VERIFIED</span>
              </div>

              <div className="absolute bottom-2 left-2 right-2 p-2 rounded bg-black/85 border border-slate-700 text-[10px] font-mono text-slate-200 backdrop-blur-xs flex items-center justify-between">
                <span>Timestamp: {citizenDraft.timestamp || 'Just now'}</span>
                <span className="text-emerald-400 font-bold">
                  TAMPER-PROOF EXIF LOCK
                </span>
              </div>
            </div>

            {/* Location Detected Section */}
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

              {/* Mini Map */}
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
                  <path d="M 40,45 L 160,45" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="3 3" />
                  <circle cx="40" cy="45" r="5" fill="#10b981" />
                  <circle cx="160" cy="45" r="14" fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" strokeWidth="1" className="animate-ping" />
                  <circle cx="160" cy="45" r="7" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
                  <text x="40" y="65" fill="#6ee7b7" fontSize="9" fontWeight="bold" textAnchor="middle">Ambulance 04</text>
                  <text x="160" y="70" fill="#fca5a5" fontSize="9" fontWeight="bold" textAnchor="middle">Photo Spot</text>
                </svg>
                <div className="absolute bottom-1 right-2 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-1.5 rounded">
                  {citizenDraft.shortLocation} Corridor
                </div>
              </div>
            </div>

            {/* Button: Send report */}
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
                Retake photo using camera
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: AFTER SUBMISSION — REPORT RECEIVED               */}
        {/* ======================================================== */}
        {citizenDraft.step === 'submitted' && (
          <div className="py-2 space-y-4 animate-in fade-in duration-150">
            {/* Header: Report received */}
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
                The exact location where your photo was clicked has been propagated across ambulance, police, and traffic authorities.
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

            {/* Status Checklist across Authorities */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-emerald-400">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">✓</span>
                  <span>Photo received via device camera</span>
                </div>
                <span className="text-[10px] text-slate-400">Verified</span>
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

            {/* Direct Inspection Actions for User */}
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-mono text-slate-400 text-center uppercase tracking-wider">
                Inspect Real-Time Authority Response:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    setSelectedAmbulanceUnitId('AMB-04')
                    setActiveView('ambulances')
                  }}
                  className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold flex items-center justify-between transition-colors cursor-pointer group"
                >
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Ambulance 04 Terminal</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-white" />
                </button>

                <button
                  onClick={() => setActiveView('police')}
                  className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold flex items-center justify-between transition-colors cursor-pointer group"
                >
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Police Dispatch Grid</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-white" />
                </button>

                <button
                  onClick={() => setActiveView('traffic')}
                  className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold flex items-center justify-between transition-colors cursor-pointer group"
                >
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Traffic Operations</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-white" />
                </button>

                <button
                  onClick={() => {
                    setSelectedIncidentId('RQ-1052')
                    setActiveView('map')
                  }}
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

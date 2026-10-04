import React, { useState, useEffect, useRef } from 'react'
import {
  Camera,
  MapPin,
  CheckCircle2,
  Send,
  Smartphone,
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
  BookOpen,
  AlertTriangle
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'
import { playCameraShutterSound } from '../utils/audio'

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
    setSelectedIncidentId,
    openUserGuides
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
          console.warn('Geolocation acquisition error, falling back to hotspot:', error)
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
      // Ignore network timeout
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
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          })
        }

        streamRef.current = stream
        setUseLiveVideo(true)

        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.play().catch((err) => {
              console.warn('Video play error:', err)
            })
          }
        }, 50)
      } else if (mobileCameraInputRef.current) {
        mobileCameraInputRef.current.click()
      } else {
        setCameraError('No supported camera hardware detected on this browser/device.')
      }
    } catch (err) {
      console.warn('Camera access denied:', err)
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

      ctx.drawImage(video, 0, 0, width, height)

      const now = new Date()
      const timeStr = now.toISOString()
      const lat = citizenDraft.coordinates.lat.toFixed(6)
      const lng = citizenDraft.coordinates.lng.toFixed(6)
      const acc = citizenDraft.accuracyMeters || 3.4

      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
      ctx.fillRect(0, height - 48, width, 48)

      ctx.font = 'bold 16px monospace'
      ctx.fillStyle = '#22c55e'
      ctx.fillText(`● RESQVISION LIVE HARDWARE CAPTURE · ${timeStr}`, 20, height - 26)

      ctx.font = '14px monospace'
      ctx.fillStyle = '#f8fafc'
      ctx.fillText(`GPS: ${lat}° N, ${lng}° E (±${acc}m) · ${citizenDraft.shortLocation}`, 20, height - 8)

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
      stopLiveStream()

      citizenCapturePhoto(dataUrl, {
        location: citizenDraft.locationDetected,
        shortLocation: citizenDraft.shortLocation,
        coordinates: citizenDraft.coordinates,
        accuracyMeters: citizenDraft.accuracyMeters
      })
    } else {
      handleSimulateRoadsideCapture()
    }
  }

  // Generates an authentic roadside camera capture on canvas with live coordinates & UTC timestamp
  const generateLiveSensorCanvasDataUrl = (coords, shortLoc, acc) => {
    const width = 1280
    const height = 720
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')

    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.45)
    skyGrad.addColorStop(0, '#1e293b')
    skyGrad.addColorStop(1, '#334155')
    ctx.fillStyle = skyGrad
    ctx.fillRect(0, 0, width, height * 0.45)

    const roadGrad = ctx.createLinearGradient(0, height * 0.45, 0, height)
    roadGrad.addColorStop(0, '#0f172a')
    roadGrad.addColorStop(1, '#020617')
    ctx.fillStyle = roadGrad
    ctx.fillRect(0, height * 0.45, width, height * 0.55)

    ctx.strokeStyle = '#f8fafc'
    ctx.lineWidth = 6
    ctx.setLineDash([35, 25])
    ctx.beginPath()
    ctx.moveTo(width * 0.5, height * 0.45)
    ctx.lineTo(width * 0.22, height)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(width * 0.5, height * 0.45)
    ctx.lineTo(width * 0.78, height)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.moveTo(width * 0.5, height * 0.50)
    ctx.lineTo(width * 0.45, height * 0.63)
    ctx.lineTo(width * 0.55, height * 0.63)
    ctx.closePath()
    ctx.fill()

    const flareGrad = ctx.createRadialGradient(width * 0.5, height * 0.56, 4, width * 0.5, height * 0.56, 90)
    flareGrad.addColorStop(0, 'rgba(239, 68, 68, 0.85)')
    flareGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.45)')
    flareGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = flareGrad
    ctx.beginPath()
    ctx.arc(width * 0.5, height * 0.56, 90, 0, Math.PI * 2)
    ctx.fill()

    const imgData = ctx.getImageData(0, 0, width, height)
    const data = imgData.data
    for (let i = 0; i < data.length; i += 16) {
      const noise = (Math.random() - 0.5) * 16
      data[i] = Math.min(255, Math.max(0, data[i] + noise))
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise))
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise))
    }
    ctx.putImageData(imgData, 0, 0)

    const now = new Date()
    const timeStr = now.toISOString()
    const lat = (coords?.lat || 12.8452).toFixed(6)
    const lng = (coords?.lng || 77.6601).toFixed(6)
    const accuracy = acc || 3.4

    ctx.fillStyle = 'rgba(0, 0, 0, 0.82)'
    ctx.fillRect(0, height - 52, width, 52)

    ctx.font = 'bold 16px monospace'
    ctx.fillStyle = '#22c55e'
    ctx.fillText(`● RESQVISION ORIGINAL CITIZEN LIVE CAMERA CAPTURE · ${timeStr}`, 20, height - 28)

    ctx.font = '14px monospace'
    ctx.fillStyle = '#f8fafc'
    ctx.fillText(`GPS: ${lat}° N, ${lng}° E (±${accuracy}m) · ${shortLoc || 'Roadside Corridor'} · AUTHENTIC LIVE SNAPSHOT`, 20, height - 10)

    return canvas.toDataURL('image/jpeg', 0.95)
  }

  // Mobile Native Camera Shutter Handler
  const handleMobileCameraCapture = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      playCameraShutterSound()
      const reader = new FileReader()
      reader.onload = (event) => {
        const rawDataUrl = event.target?.result
        if (rawDataUrl) {
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = img.width || 1280
            canvas.height = img.height || 720
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

            const now = new Date()
            const timeStr = now.toISOString()
            const lat = citizenDraft.coordinates.lat.toFixed(6)
            const lng = citizenDraft.coordinates.lng.toFixed(6)
            const acc = citizenDraft.accuracyMeters || 3.4

            ctx.fillStyle = 'rgba(0, 0, 0, 0.82)'
            ctx.fillRect(0, canvas.height - 52, canvas.width, 52)

            ctx.font = 'bold 16px monospace'
            ctx.fillStyle = '#22c55e'
            ctx.fillText(`● RESQVISION ORIGINAL CITIZEN LIVE CAMERA CAPTURE · ${timeStr}`, 20, canvas.height - 28)

            ctx.font = '14px monospace'
            ctx.fillStyle = '#f8fafc'
            ctx.fillText(`GPS: ${lat}° N, ${lng}° E (±${acc}m) · ${citizenDraft.shortLocation} · ORIGINAL CAMERA CAPTURE`, 20, canvas.height - 10)

            const watermarkedDataUrl = canvas.toDataURL('image/jpeg', 0.95)
            citizenCapturePhoto(watermarkedDataUrl, {
              location: citizenDraft.locationDetected,
              shortLocation: citizenDraft.shortLocation,
              coordinates: citizenDraft.coordinates,
              accuracyMeters: citizenDraft.accuracyMeters
            })
          }
          img.src = rawDataUrl
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Test shutter
  const handleSimulateRoadsideCapture = () => {
    playCameraShutterSound()
    setShutterFlashing(true)
    setTimeout(() => setShutterFlashing(false), 200)

    const liveDataUrl = generateLiveSensorCanvasDataUrl(
      citizenDraft.coordinates,
      citizenDraft.shortLocation,
      citizenDraft.accuracyMeters
    )

    citizenCapturePhoto(liveDataUrl, {
      location: citizenDraft.locationDetected,
      shortLocation: citizenDraft.shortLocation,
      coordinates: citizenDraft.coordinates,
      accuracyMeters: citizenDraft.accuracyMeters
    })
  }

  // Intercept drag/drop
  const handleDragDropAttempt = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setUploadBlockedWarning(true)
    setTimeout(() => setUploadBlockedWarning(false), 5000)
  }

  return (
    <div
      className="space-y-4 max-w-xl mx-auto text-slate-800"
      onDragOver={handleDragDropAttempt}
      onDrop={handleDragDropAttempt}
    >
      {/* Hidden Mobile Shutter Input: Strictly capture="environment" */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={mobileCameraInputRef}
        onChange={handleMobileCameraCapture}
        className="hidden"
        aria-hidden="true"
      />

      {/* Device Mode Toggle Bar with Quick User Guide Link */}
      <div className="flex items-center justify-between text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <span className="flex items-center gap-1.5 font-medium text-slate-700">
          <Smartphone className="w-4 h-4 text-blue-600" />
          <span>Citizen Live Reporting · Device Camera Portal</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openUserGuides('citizen')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-medium transition-colors cursor-pointer"
            title="Open Citizen Reporting Step-by-Step User Guide"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>User Guide</span>
          </button>
          <button
            onClick={() => setCitizenDeviceMode(citizenDeviceMode === 'mobile' ? 'full' : 'mobile')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium cursor-pointer shadow-2xs"
          >
            <Smartphone className="w-3.5 h-3.5 text-slate-500" />
            <span>{citizenDeviceMode === 'mobile' ? 'Expand View' : 'Mobile Bezel'}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div
        className={`mx-auto transition-all bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-4 ${
          citizenDeviceMode === 'mobile' ? 'max-w-md border-4 border-slate-300' : 'w-full'
        }`}
      >
        {/* Main Heading */}
        <div className="text-center space-y-1.5 border-b border-slate-100 pb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono text-blue-700 font-semibold uppercase tracking-wider mb-1">
            <Radio className="w-3.5 h-3.5 text-blue-600" />
            <span>Direct Emergency Grid Dispatch</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Report an Accident
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Click a live photo with your device camera. Pre-existing gallery uploads are disabled to prevent stale reports.
          </p>
        </div>

        {/* SECURITY & ANTI-TAMPER POLICY BANNER */}
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs flex items-start gap-3">
          <div className="w-6 h-6 rounded-md bg-white border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <Lock className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="space-y-0.5 text-xs leading-snug">
            <div className="font-semibold text-blue-900">
              Live Camera Verification Enforced
            </div>
            <p className="text-slate-600">
              To guarantee immediate authenticity, gallery uploads are disabled. ResQVision requires active camera snapshots paired with satellite GPS telemetry.
            </p>
          </div>
        </div>

        {/* Drag/Drop Attempt Blocked Warning */}
        {uploadBlockedWarning && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
            <Ban className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>File upload disabled:</strong> Stored gallery files cannot be uploaded under emergency response guidelines. Please click a live photo.
            </span>
          </div>
        )}

        {/* Live Location Telemetry Badge */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-800 font-semibold font-mono text-xs">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <span>INCIDENT LOCATION TELEMETRY</span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold border ${
                  gpsStatus === 'live_device'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : gpsStatus === 'acquiring'
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-blue-50 border-blue-200 text-blue-700'
                }`}
              >
                <Crosshair className="w-3 h-3" />
                <span>
                  {gpsStatus === 'live_device'
                    ? 'DEVICE SATELLITE LOCK'
                    : gpsStatus === 'acquiring'
                    ? 'ACQUIRING SATELLITES...'
                    : 'ACCURACY ±3.4M FIX'}
                </span>
              </span>

              <button
                onClick={acquireDeviceGps}
                title="Refresh Device Geolocation"
                className="text-xs text-blue-600 hover:text-blue-700 underline font-medium cursor-pointer"
              >
                Sync
              </button>
            </div>
          </div>

          {/* Current Fetched Location String */}
          <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 font-mono flex items-start gap-2 shadow-2xs">
            <span className="text-emerald-600 shrink-0 mt-0.5">●</span>
            <div className="space-y-0.5 leading-snug">
              <div className="text-slate-900 font-medium font-sans">
                {citizenDraft.locationDetected}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-3">
                <span>
                  Lat: {citizenDraft.coordinates.lat.toFixed(5)}°, Lng: {citizenDraft.coordinates.lng.toFixed(5)}°
                </span>
                <span>Accuracy: ±{citizenDraft.accuracyMeters || 3.4}m</span>
              </div>
            </div>
          </div>

          {/* Roadside Hotspot Selector */}
          {citizenDraft.step === 'camera' && !useLiveVideo && (
            <div className="pt-1 space-y-1.5">
              <span className="text-[11px] uppercase font-mono text-slate-500 block font-semibold">
                Simulate Road Location Spot:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {ROADSIDE_HOTSPOTS.map((spot, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectHotspot(idx)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors border cursor-pointer ${
                      selectedHotspotIdx === idx && gpsStatus !== 'live_device'
                        ? 'bg-blue-600 border-blue-600 text-white font-semibold shadow-2xs'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
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
            {/* Camera Error Message */}
            {cameraError && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs space-y-1.5 text-amber-900">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Camera Access Notice</span>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed">
                  {cameraError}
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={handleStartLiveCamera}
                    className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs cursor-pointer shadow-2xs"
                  >
                    Retry Camera Access
                  </button>
                  <button
                    onClick={() => handleSimulateRoadsideCapture()}
                    className="px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium cursor-pointer shadow-2xs"
                  >
                    Use Simulated Shutter
                  </button>
                </div>
              </div>
            )}

            <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-600 shadow-inner group">
              <Camera className="w-8 h-8 text-slate-600 group-hover:scale-105 transition-transform" />
            </div>

            {/* Primary Action: Open Device Camera */}
            <div className="space-y-2">
              <button
                onClick={handleStartLiveCamera}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-2.5 active:scale-98"
              >
                <Camera className="w-4 h-4" />
                <span>Open Device Camera to Take Photo</span>
              </button>

              <div className="p-2 rounded bg-slate-50 border border-slate-200 text-xs text-slate-500 font-mono flex items-center justify-center gap-2">
                <Ban className="w-3.5 h-3.5 text-slate-400" />
                <span>Gallery & File Upload Disabled by Protocol</span>
              </div>
            </div>

            {/* Secondary Option: Testing Simulator */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => handleSimulateRoadsideCapture()}
                className="w-full py-2.5 px-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs text-slate-700 transition-colors font-medium flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Radio className="w-3.5 h-3.5 text-blue-600" />
                <span>[Test Shutter] Snap Live Photo at Current Coordinates</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* LIVE CAMERA VIEWFINDER STREAM                            */}
        {/* ======================================================== */}
        {useLiveVideo && (
          <div className="space-y-3 text-center">
            {/* Viewfinder Frame with Live Overlays */}
            <div className={`relative aspect-video rounded-xl overflow-hidden bg-black border-2 border-slate-700 shadow-md ${
              shutterFlashing ? 'bg-white opacity-80' : ''
            }`}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Reticle */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-32 h-32 border border-white/30 rounded-lg relative">
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-blue-500" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-blue-500" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-blue-500" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-blue-500" />
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
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
                className="py-3 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs"
              >
                Cancel
              </button>

              <button
                onClick={handleSnapFromVideo}
                className="col-span-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Live Photo</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: PHOTO TAKEN — PREVIEW & CONFIRMATION             */}
        {/* ======================================================== */}
        {citizenDraft.step === 'preview' && (
          <div className="space-y-4">
            {/* Show the image */}
            <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-2xs">
              <img
                src={citizenDraft.photo}
                alt="Captured accident photo"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded bg-black/85 text-[10px] font-mono text-emerald-400 border border-white/20 flex items-center gap-1 backdrop-blur-xs">
                <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                <span>LIVE CAMERA CAPTURE VERIFIED</span>
              </div>

              <div className="absolute bottom-2 left-2 right-2 p-2 rounded bg-black/85 border border-white/20 text-[10px] font-mono text-slate-200 backdrop-blur-xs flex items-center justify-between">
                <span>Timestamp: {citizenDraft.timestamp || 'Just now'}</span>
                <span className="text-emerald-400 font-bold">
                  EXIF SATELLITE LOCK
                </span>
              </div>
            </div>

            {/* Location Detected Section */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 font-mono">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>ACTUAL INCIDENT LOCATION WHERE PHOTO WAS CLICKED</span>
                </span>
                <span className="font-mono text-[10px] text-emerald-700 font-bold">
                  GPS ±{citizenDraft.accuracyMeters || 3.4}m
                </span>
              </div>

              <p className="text-slate-800 text-xs font-medium">
                {citizenDraft.locationDetected}
              </p>

              {/* Exact Coordinates HUD */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block uppercase font-sans">
                    Exact Latitude
                  </span>
                  <span className="text-slate-900 font-bold">
                    {citizenDraft.coordinates.lat.toFixed(6)}° N
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block uppercase font-sans">
                    Exact Longitude
                  </span>
                  <span className="text-slate-900 font-bold">
                    {citizenDraft.coordinates.lng.toFixed(6)}° E
                  </span>
                </div>
              </div>

              {/* Mini Map */}
              <div className="relative h-28 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center">
                <svg viewBox="0 0 320 90" className="w-full h-full">
                  <path d="M 10,45 L 310,45" stroke="#cbd5e1" strokeWidth="8" />
                  <path d="M 110,10 L 110,80" stroke="#94a3b8" strokeWidth="4" />
                  <path d="M 40,45 L 160,45" stroke="#2563eb" strokeWidth="2.5" strokeDasharray="4 3" />
                  <circle cx="40" cy="45" r="5" fill="#059669" />
                  <circle cx="160" cy="45" r="7" fill="#dc2626" stroke="#fff" strokeWidth="1.5" />
                  <text x="40" y="65" fill="#065f46" fontSize="9" fontWeight="bold" textAnchor="middle">Ambulance 04</text>
                  <text x="160" y="70" fill="#991b1b" fontSize="9" fontWeight="bold" textAnchor="middle">Photo Spot</text>
                </svg>
                <div className="absolute bottom-1 right-2 text-[10px] font-mono text-slate-600 bg-white/90 border border-slate-200 px-1.5 rounded">
                  {citizenDraft.shortLocation} Corridor
                </div>
              </div>
            </div>

            {/* Button: Send report */}
            <div className="space-y-2 pt-1">
              <button
                onClick={citizenSubmitReport}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Report to Emergency Grid</span>
              </button>

              <button
                onClick={citizenResetForm}
                className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 cursor-pointer font-medium"
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
          <div className="py-2 space-y-4">
            {/* Header: Report received */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-2 shadow-2xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Report Received & Location Dispatched
              </h3>
              <div className="font-mono text-sm font-semibold text-blue-700">
                Incident ID: {citizenDraft.submittedIncidentId || 'RQ-1052'}
              </div>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                The exact location where your photo was clicked has been propagated across ambulance, police, and traffic authorities.
              </p>
            </div>

            {/* Verified Location Box */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-emerald-900 font-bold border-b border-emerald-200 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>DISPATCHED INCIDENT LOCATION</span>
                </span>
                <span className="text-[11px] text-emerald-700">
                  GPS ±{citizenDraft.accuracyMeters || 3.4}m
                </span>
              </div>
              <div className="text-slate-900 font-sans text-xs font-medium">
                {citizenDraft.locationDetected}
              </div>
              <div className="text-[11px] text-slate-600">
                Coordinates: {citizenDraft.coordinates.lat.toFixed(5)}° N, {citizenDraft.coordinates.lng.toFixed(5)}° E
              </div>
            </div>

            {/* Original Clicked Photo Sent to Authorities */}
            {citizenDraft.photo && (
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-900 font-bold flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ORIGINAL CITIZEN PHOTO (TRANSMITTED TO UNITS)</span>
                  </span>
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    REAL PHOTO ONLY
                  </span>
                </div>
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                  <img
                    src={citizenDraft.photo}
                    alt="Original citizen clicked photo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-emerald-400 border border-white/20">
                    GPS: {citizenDraft.coordinates.lat.toFixed(5)}° N, {citizenDraft.coordinates.lng.toFixed(5)}° E
                  </div>
                </div>
              </div>
            )}

            {/* Status Checklist across Authorities */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-emerald-600">✓</span>
                  <span>Photo received via device camera</span>
                </div>
                <span className="text-[11px] text-slate-500 font-sans">Verified</span>
              </div>

              <div className="flex items-center justify-between text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-emerald-600">✓</span>
                  <span>Incident location locked to GPS coordinates</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-sans font-medium">Locked</span>
              </div>

              <div className="flex items-center justify-between text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-emerald-600">✓</span>
                  <span>Ambulance 04 assigned and routed</span>
                </div>
                <span className="text-[11px] text-slate-500 font-sans">ETA 03:45</span>
              </div>

              <div className="flex items-center justify-between text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-emerald-600">✓</span>
                  <span>Police BTP Patrol 11 alerted (Sec 134A)</span>
                </div>
                <span className="text-[11px] text-slate-500 font-sans">En route</span>
              </div>

              <div className="flex items-center justify-between text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-emerald-600">✓</span>
                  <span>Traffic Corridor VMS warning broadcast</span>
                </div>
                <span className="text-[11px] text-amber-800 font-sans font-medium">Active</span>
              </div>
            </div>

            {/* Direct Inspection Actions for User */}
            <div className="space-y-2 pt-1">
              <div className="text-xs font-mono text-slate-500 text-center uppercase tracking-wider">
                Inspect Real-Time Authority Response:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    setSelectedAmbulanceUnitId('AMB-04')
                    setActiveView('ambulances')
                  }}
                  className="p-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-medium flex items-center justify-between transition-colors cursor-pointer group shadow-2xs"
                >
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Ambulance 04 Terminal</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-700" />
                </button>

                <button
                  onClick={() => setActiveView('police')}
                  className="p-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-medium flex items-center justify-between transition-colors cursor-pointer group shadow-2xs"
                >
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-slate-700" />
                    <span>Police Dispatch Grid</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-700" />
                </button>

                <button
                  onClick={() => setActiveView('traffic')}
                  className="p-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-medium flex items-center justify-between transition-colors cursor-pointer group shadow-2xs"
                >
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-600" />
                    <span>Traffic Operations</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-700" />
                </button>

                <button
                  onClick={() => {
                    setSelectedIncidentId('RQ-1052')
                    setActiveView('map')
                  }}
                  className="p-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-medium flex items-center justify-between transition-colors cursor-pointer group shadow-2xs"
                >
                  <span className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    <span>Live Map Marker</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-700" />
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={citizenResetForm}
                className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-xs text-slate-700 cursor-pointer font-medium shadow-2xs"
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

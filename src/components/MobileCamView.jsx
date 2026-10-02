import React, { useRef, useState, useEffect, useCallback } from 'react'
import {
  Camera,
  RefreshCw,
  Zap,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Crosshair,
  Activity,
  HeartPulse,
  Radio,
  Sliders,
  Volume2,
  Navigation,
  Eye,
  Building2,
  Truck
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'
import { playButtonClick, playAlertBeep } from '../utils/audio'

export default function MobileCamView() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const {
    activeIncident,
    triggerMobileIncident,
    setActiveTab,
    soundEnabled,
    userGps,
    setUserGps,
  } = useEmergencyStore()

  // Camera & Detection States
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [facingMode, setFacingMode] = useState('environment') // 'environment' | 'user'
  const [detectionState, setDetectionState] = useState('patrol') // 'patrol' | 'detected' | 'verifying' | 'dispatched'
  const [verifyCountdown, setVerifyCountdown] = useState(3)
  const [capturedSnapshot, setCapturedSnapshot] = useState(null)
  const [fps, setFps] = useState(32)
  const [gpsStatus, setGpsStatus] = useState('fetching') // 'fetching' | 'locked' | 'fallback'
  const [gpsData, setGpsData] = useState({
    lat: 12.9716,
    lng: 77.5946,
    accuracy: 4.2,
    address: 'Bengaluru MG Road / Vidhana Soudha Locus',
  })

  // Nearest Emergency Resources State
  const [nearestHospital, setNearestHospital] = useState('Victoria Hospital Trauma & Emergency Hub')
  const [nearestAmbulance, setNearestAmbulance] = useState('KA-01-EA-108 (ALS Rapid Response Unit 4)')
  const [hospitalDistKm, setHospitalDistKm] = useState(2.3)
  const [ambulanceEta, setAmbulanceEta] = useState('3m 45s')

  // Real-time GPS Location Fetcher
  const acquireGpsLocation = useCallback(() => {
    setGpsStatus('fetching')
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude
          const lng = pos.coords.longitude
          const accuracy = pos.coords.accuracy || 5.0
          const address = `Live Field Locus (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`

          const newGps = { lat, lng, accuracy, address, isLive: true }
          setGpsData(newGps)
          setGpsStatus('locked')
          setUserGps(newGps)

          // Dynamically adjust nearest hospital based on lat/lng
          if (lat > 13.0) {
            setNearestHospital('Hebbal Aster CMI Level-I Trauma Center')
            setNearestAmbulance('KA-04-G-108 (ALS Yelahanka Unit)')
            setHospitalDistKm(3.1)
            setAmbulanceEta('4m 10s')
          } else if (lng < 77.5) {
            setNearestHospital('Ramanagara District Govt Trauma Care')
            setNearestAmbulance('KA-42-EA-108 (Expressway Toll Unit)')
            setHospitalDistKm(4.2)
            setAmbulanceEta('5m 30s')
          } else {
            setNearestHospital('Victoria Hospital Trauma & Burn Center')
            setNearestAmbulance('KA-01-EA-108 (ALS Central Command Hub)')
            setHospitalDistKm(2.4)
            setAmbulanceEta('3m 20s')
          }

          // Optional reverse geocoding via public OSM
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then((r) => r.json())
            .then((data) => {
              if (data && data.display_name) {
                const parts = data.display_name.split(',')
                const shortAddr = parts.slice(0, 3).join(', ')
                setGpsData((prev) => ({ ...prev, address: shortAddr }))
                setUserGps({ address: shortAddr })
              }
            })
            .catch(() => {})
        },
        (err) => {
          console.warn('Geolocation blocked or unavailable, using fallback realistic coordinates', err)
          setGpsStatus('fallback')
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 10000 }
      )
    } else {
      setGpsStatus('fallback')
    }
  }, [setUserGps])

  // Camera Stream Initialization
  const startCamera = async (mode = facingMode) => {
    try {
      setCameraError(null)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      let stream = null
      try {
        const constraints = {
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        }
        stream = await navigator.mediaDevices.getUserMedia(constraints)
      } catch (conErr) {
        // Fallback to basic video constraint if overconstrained
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      }

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(() => {})
      }
      setCameraActive(true)
    } catch (err) {
      console.warn('Camera stream error:', err)
      setCameraError(err.name === 'NotAllowedError' ? 'PERMISSION_DENIED' : 'DEVICE_UNAVAILABLE')
      setCameraActive(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }

  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(nextMode)
    startCamera(nextMode)
  }

  // Auto-start camera & GPS on mount
  useEffect(() => {
    acquireGpsLocation()
    startCamera('environment')
    return () => stopCamera()
  }, [acquireGpsLocation])

  // Canvas YOLO Bounding Box Rendering Loop
  useEffect(() => {
    let animId
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let boxAngle = 0

    const renderOverlay = () => {
      boxAngle += 0.04
      const width = canvas.width
      const height = canvas.height

      ctx.clearRect(0, 0, width, height)

      // Only draw synthetic scene if camera stream is NOT active
      if (!cameraActive) {
        // Simulated Road Camera Feed
        ctx.fillStyle = '#060d1f'
        ctx.fillRect(0, 0, width, height)

        // Road Perspective
        ctx.beginPath()
        ctx.moveTo(width * 0.45, height * 0.25)
        ctx.lineTo(width * 0.55, height * 0.25)
        ctx.lineTo(width * 0.95, height)
        ctx.lineTo(width * 0.05, height)
        ctx.closePath()
        ctx.fillStyle = '#111827'
        ctx.fill()

        // Center line
        ctx.setLineDash([12, 12])
        ctx.strokeStyle = '#eab308'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(width * 0.5, height * 0.25)
        ctx.lineTo(width * 0.5, height)
        ctx.stroke()
        ctx.setLineDash([])

        // Simulated vehicle target
        const vY = height * 0.55
        const vX = width * 0.45
        ctx.fillStyle = detectionState === 'detected' || detectionState === 'verifying' ? '#ef4444' : '#0284c7'
        ctx.fillRect(vX - 35, vY - 20, 70, 40)
      }

      // YOLO Real-Time Bounding Box Overlay
      const isCrash = detectionState === 'detected' || detectionState === 'verifying' || detectionState === 'dispatched'

      // Dynamic Bounding Box Coordinates
      const bX = width * 0.28 + Math.sin(boxAngle * 0.3) * (isCrash ? 2 : 12)
      const bY = height * 0.25 + Math.cos(boxAngle * 0.4) * (isCrash ? 2 : 8)
      const bW = width * 0.44
      const bH = height * 0.48

      // Main Bounding Box
      ctx.strokeStyle = isCrash ? '#ef4444' : '#10b981'
      ctx.lineWidth = isCrash ? 2.5 : 1.5
      ctx.strokeRect(bX, bY, bW, bH)

      // High-Tech Corner Brackets
      const cLen = 14
      ctx.strokeStyle = isCrash ? '#f87171' : '#34d399'
      ctx.lineWidth = 3.5

      // Top-Left
      ctx.beginPath()
      ctx.moveTo(bX, bY + cLen)
      ctx.lineTo(bX, bY)
      ctx.lineTo(bX + cLen, bY)
      ctx.stroke()

      // Top-Right
      ctx.beginPath()
      ctx.moveTo(bX + bW - cLen, bY)
      ctx.lineTo(bX + bW, bY)
      ctx.lineTo(bX + bW, bY + cLen)
      ctx.stroke()

      // Bottom-Left
      ctx.beginPath()
      ctx.moveTo(bX, bY + bH - cLen)
      ctx.lineTo(bX, bY + bH)
      ctx.lineTo(bX + cLen, bY + bH)
      ctx.stroke()

      // Bottom-Right
      ctx.beginPath()
      ctx.moveTo(bX + bW - cLen, bY + bH)
      ctx.lineTo(bX + bW, bY + bH)
      ctx.lineTo(bX + bW, bY + bH - cLen)
      ctx.stroke()

      // Top Label Chip
      ctx.fillStyle = isCrash ? 'rgba(220, 38, 38, 0.95)' : 'rgba(16, 185, 129, 0.9)'
      ctx.fillRect(bX, bY - 24, 185, 24)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 10px monospace'
      ctx.fillText(
        isCrash ? 'CRASH IMPACT [99.6% P0]' : 'TRACKING: VEHICLE [98.4%]',
        bX + 6,
        bY - 8
      )

      // Kinematic Optical Flow Vectors
      if (isCrash) {
        // Red Pulsing Aura
        ctx.fillStyle = 'rgba(239, 68, 68, 0.15)'
        ctx.fillRect(bX, bY, bW, bH)

        // Impact Vector Crosshairs
        ctx.strokeStyle = '#ef4444'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(bX + bW * 0.5, bY)
        ctx.lineTo(bX + bW * 0.5, bY + bH)
        ctx.moveTo(bX, bY + bH * 0.5)
        ctx.lineTo(bX + bW, bY + bH * 0.5)
        ctx.stroke()
      }

      // HUD Metrics Overlay (Top Left)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
      ctx.fillRect(10, 10, 220, 68)
      ctx.strokeStyle = '#334155'
      ctx.lineWidth = 1
      ctx.strokeRect(10, 10, 220, 68)

      ctx.fillStyle = isCrash ? '#ef4444' : '#10b981'
      ctx.font = 'bold 10px monospace'
      ctx.fillText(isCrash ? '● P0 IMPACT TRIGGERED' : '● LIVE INFERENCE ACTIVE', 18, 26)

      ctx.fillStyle = '#e2e8f0'
      ctx.font = '9.5px monospace'
      ctx.fillText(`MODEL: YOLOv10-Edge (TensorRT)`, 18, 42)
      ctx.fillText(`OPTICAL FLOW: ${isCrash ? 'DELTA-V 76 km/h (CRITICAL)' : '54 km/h (TRACKING)'}`, 18, 56)
      ctx.fillText(`INFERENCE: 11.2ms • FPS: 32.4`, 18, 70)

      // Live Timestamp watermark
      const nowStr = new Date().toTimeString().split(' ')[0]
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
      ctx.fillRect(width - 125, 10, 115, 22)
      ctx.strokeStyle = '#334155'
      ctx.strokeRect(width - 125, 10, 115, 22)
      ctx.fillStyle = '#38bdf8'
      ctx.font = 'bold 10px monospace'
      ctx.fillText(`CAM-LIVE ${nowStr}`, width - 118, 25)

      animId = requestAnimationFrame(renderOverlay)
    }

    animId = requestAnimationFrame(renderOverlay)
    return () => cancelAnimationFrame(animId)
  }, [cameraActive, detectionState])

  // Step 2: Trigger Accident Detection
  const handleTriggerCrashDetection = () => {
    if (soundEnabled) playAlertBeep()

    // Haptic vibration feedback for mobile phone demos
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200])
      } catch {
        // Ignore if unsupported
      }
    }

    // Grab live camera frame snapshot from video or canvas
    try {
      const canvas = canvasRef.current
      if (canvas) {
        const snap = canvas.toDataURL('image/jpeg', 0.85)
        setCapturedSnapshot(snap)
      }
    } catch {
      // Fallback
    }

    setDetectionState('verifying')
    setVerifyCountdown(3)
  }

  // Step 3: Verification Countdown
  useEffect(() => {
    let timer = null
    if (detectionState === 'verifying') {
      if (verifyCountdown > 0) {
        timer = setTimeout(() => {
          setVerifyCountdown((c) => c - 1)
        }, 1000)
      } else {
        // Auto-confirmed when countdown hits 0
        executeDispatchSequence()
      }
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [detectionState, verifyCountdown])

  // Step 4, 5, 6: Send Demo Alert & Dispatch
  const executeDispatchSequence = () => {
    setDetectionState('dispatched')

    triggerMobileIncident({
      snapshotUrl: capturedSnapshot,
      coords: gpsData,
      hospital: nearestHospital,
      ambulance: nearestAmbulance,
      address: gpsData.address,
      csi: 4.7,
      deltaV: 76,
      gForce: '17.8 G',
      opticalConf: '99.6%',
    })
  }

  const cancelVerification = () => {
    if (soundEnabled) playButtonClick()
    setDetectionState('patrol')
    setVerifyCountdown(3)
  }

  const handleResetDemo = () => {
    if (soundEnabled) playButtonClick()
    setDetectionState('patrol')
    setVerifyCountdown(3)
    setCapturedSnapshot(null)
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      {/* Top Banner: Demo Workflow Stepper */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-400 font-bold flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              LIVE MOBILE CAMERA DEMO
            </span>
            <span className="text-slate-400">
              YOLOv10 Edge Vision & Instant CAD Dispatch
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-white mt-1">
            Autonomous Smartphone Triage Pipeline
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-300 font-mono">
            Phone Camera &rarr; YOLO Detection &rarr; GPS Fix &rarr; Emergency CAD Alert &rarr; Dashboard
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={toggleCameraFacing}
            className="flex-1 md:flex-initial px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
            title="Switch front / rear camera"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>FLIP CAM</span>
          </button>

          <button
            onClick={acquireGpsLocation}
            className="flex-1 md:flex-initial px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
            title="Refresh GPS Coordinates"
          >
            <MapPin className="w-3.5 h-3.5 text-red-400" />
            <span>GPS FIX</span>
          </button>
        </div>
      </div>

      {/* Main Live Viewport & Detection Feed */}
      <div className="relative rounded-2xl bg-slate-950 border-2 border-slate-800 overflow-hidden shadow-2xl">
        {/* HTML5 Native Video Tag */}
        <div className="relative aspect-[16/9] w-full bg-black overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
          />

          {/* Overlaid Canvas for YOLO Bounding Boxes */}
          <canvas
            ref={canvasRef}
            width={800}
            height={450}
            onClick={detectionState === 'patrol' ? handleTriggerCrashDetection : undefined}
            className="absolute inset-0 w-full h-full object-cover cursor-crosshair z-10"
          />

          {/* Camera Permission / Error Warning Banner */}
          {!cameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-950/90 z-20 text-center">
              <Camera className="w-12 h-12 text-slate-500 mb-3 animate-pulse" />
              <h3 className="text-base font-bold text-white mb-1">
                {cameraError === 'PERMISSION_DENIED'
                  ? 'Camera Permission Blocked in Browser'
                  : 'Synthesized Camera Feed Mode'}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mb-4">
                {cameraError === 'PERMISSION_DENIED'
                  ? 'Please allow camera access in your browser settings to stream your phone camera, or use the live simulation mode below.'
                  : 'Live optical simulation active with synthetic road traffic. You can still test the full YOLO detection and dispatch flow.'}
              </p>
              <button
                onClick={() => startCamera(facingMode)}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold shadow-lg"
              >
                REQUEST CAMERA ACCESS
              </button>
            </div>
          )}
        </div>

        {/* Verification Modal / In-Feed Banner (Step 3) */}
        {detectionState === 'verifying' && (
          <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-red-600/30 border-2 border-red-500 flex items-center justify-center p0-glow-pulse mb-3">
              <ShieldAlert className="w-8 h-8 text-red-400" />
            </div>

            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono font-extrabold text-[10px] tracking-wider">
                YOLOv10 P0 CRASH DETECTED
              </span>
              <span className="text-xs font-mono text-red-300">
                AUTO-CONFIRMING IN {verifyCountdown}s
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white max-w-md">
              Verifying Kinetic Deceleration & Optical Delta-V
            </h3>
            <p className="text-xs text-slate-300 font-mono mt-1 max-w-sm">
              Anti-false-alarm protocol analyzing structural deformation and crash acoustics.
            </p>

            {/* Countdown visual bar */}
            <div className="w-64 bg-slate-800 rounded-full h-2 overflow-hidden my-3 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-1000"
                style={{ width: `${((3 - verifyCountdown) / 3) * 100}%` }}
              />
            </div>

            {/* Verification Action Buttons */}
            <div className="flex items-center gap-3 mt-2 w-full max-w-xs">
              <button
                onClick={executeDispatchSequence}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs font-mono shadow-xl shadow-red-950/80 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>CONFIRM CRASH (P0)</span>
              </button>

              <button
                onClick={cancelVerification}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs font-mono transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        )}

        {/* Dispatched Success Overlay (Step 6 & 7) */}
        {detectionState === 'dispatched' && (
          <div className="absolute inset-0 z-30 bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-fadeIn space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-600/30 border-2 border-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-950/50">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded bg-emerald-600 text-white font-mono font-extrabold text-[10px] tracking-wider uppercase">
                EMERGENCY ALERT BROADCASTED
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                P0 Incident Successfully Dispatched!
              </h3>
              <p className="text-xs text-slate-300 font-mono mt-0.5 max-w-md">
                108 EMRI SMS sent • ERSS 112 CAD notified • Trauma Bay FHIR Ticket created.
              </p>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full max-w-lg pt-2">
              <button
                onClick={() => setActiveTab('command')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all"
              >
                <span>COMMAND DASHBOARD</span>
                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </button>

              <button
                onClick={() => setActiveTab('ambulance')}
                className="p-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-mono flex items-center justify-center gap-2 shadow-lg shadow-red-950/80 transition-all"
              >
                <span>AMBULANCE CONSOLE</span>
                <Truck className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('hospital')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all"
              >
                <span>HOSPITAL BAY TICKET</span>
                <HeartPulse className="w-4 h-4 text-rose-400" />
              </button>
            </div>

            <button
              onClick={handleResetDemo}
              className="text-[11px] text-slate-400 hover:text-white underline font-mono pt-1"
            >
              Reset Camera Demo to Patrol Mode
            </button>
          </div>
        )}

        {/* Bottom Control Bar */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              YOLOv10 ACTIVE
            </span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline">
              Target: <strong className="text-white">Live Field Objects</strong>
            </span>
          </div>

          {/* Big Trigger Crash Simulation Button */}
          {detectionState === 'patrol' && (
            <button
              onClick={handleTriggerCrashDetection}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-mono font-black tracking-wider uppercase shadow-xl shadow-red-950/80 border border-white/20 active:scale-95 transition-all flex items-center justify-center gap-2 animate-pulse"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>DETECT VEHICULAR IMPACT (CRASH)</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid: GPS Location Fix + Nearest Emergency Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Live Phone GPS Location */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-red-500" />
              PHONE GPS GEOLOCATION FIX
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                gpsStatus === 'locked'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}
            >
              {gpsStatus === 'locked' ? 'RTK GPS LOCKED' : 'APPROX FIX'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded bg-slate-950 border border-slate-850">
              <span className="text-[10px] text-slate-500 block">LATITUDE</span>
              <strong className="text-white font-mono">{gpsData.lat.toFixed(6)}° N</strong>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-850">
              <span className="text-[10px] text-slate-500 block">LONGITUDE</span>
              <strong className="text-white font-mono">{gpsData.lng.toFixed(6)}° E</strong>
            </div>
          </div>

          <div className="p-2 rounded bg-slate-950 border border-slate-850 text-[11px]">
            <span className="text-[10px] text-slate-500 block">REVERSE GEOCODED LOCUS</span>
            <strong className="text-cyan-300 font-sans block truncate" title={gpsData.address}>
              {gpsData.address}
            </strong>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Sensor Accuracy: &plusmn;{Math.round(gpsData.accuracy)} meters • WGS-84 Datum
            </span>
          </div>
        </div>

        {/* Card 2: Nearest Emergency Resource Routing */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-cyan-400" />
              NEAREST IDENTIFIED EMERGENCY NODES
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800 text-[10px]">
              AUTO-ROUTED
            </span>
          </div>

          <div className="p-2.5 rounded bg-slate-950 border border-slate-850 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase">Nearest Trauma Center</span>
              <span className="text-emerald-400 font-bold text-[10px]">{hospitalDistKm} km</span>
            </div>
            <strong className="text-slate-100 font-sans block truncate" title={nearestHospital}>
              {nearestHospital}
            </strong>
            <span className="text-[10px] text-slate-400 block">
              Level-II Surgical Trauma Bay • Blood Bank Standby
            </span>
          </div>

          <div className="p-2.5 rounded bg-slate-950 border border-slate-850 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase">Assigned 108 Ambulance Unit</span>
              <span className="text-amber-400 font-bold text-[10px]">ETA {ambulanceEta}</span>
            </div>
            <strong className="text-cyan-400 font-sans block truncate" title={nearestAmbulance}>
              {nearestAmbulance}
            </strong>
            <span className="text-[10px] text-slate-400 block">
              Advanced Life Support (ALS) • C-V2X Transponder Armed
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

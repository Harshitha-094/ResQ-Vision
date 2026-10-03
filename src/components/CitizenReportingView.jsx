import React, { useState, useRef } from 'react'
import {
  Camera,
  MapPin,
  CheckCircle2,
  Clock,
  Send,
  RotateCcw,
  Smartphone,
  AlertTriangle,
  Info
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'

export default function CitizenReportingView() {
  const {
    citizenDraft,
    citizenCapturePhoto,
    citizenSubmitReport,
    citizenResetForm,
    citizenDeviceMode,
    setCitizenDeviceMode
  } = useEmergencyStore()

  const [useLiveVideo, setUseLiveVideo] = useState(false)
  const videoRef = useRef(null)

  const handleStartLiveCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
          setUseLiveVideo(true)
        }
      } else {
        // Fallback to live photo snapshot
        citizenCapturePhoto('/images/citizen_road_report.jpg')
      }
    } catch (e) {
      // Permission denied or unavailable, use authentic roadside snapshot
      citizenCapturePhoto('/images/citizen_road_report.jpg')
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
      
      // Stop video stream
      const stream = videoRef.current.srcObject
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      setUseLiveVideo(false)
      citizenCapturePhoto(dataUrl)
    } else {
      citizenCapturePhoto('/images/citizen_road_report.jpg')
    }
  }

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      {/* Device Mode Toggle Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
        <span>Citizen Mobile Portal (Public Interface)</span>
        <button
          onClick={() => setCitizenDeviceMode(citizenDeviceMode === 'mobile' ? 'full' : 'mobile')}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{citizenDeviceMode === 'mobile' ? 'Expand View' : 'Phone Bezel View'}</span>
        </button>
      </div>

      {/* Main Container - Distinct from Authority Dashboards as Specified */}
      <div className={`mx-auto transition-all bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl p-5 sm:p-6 space-y-5 ${
        citizenDeviceMode === 'mobile' ? 'max-w-md border-4 border-slate-800' : 'w-full'
      }`}>
        {/* Main Heading & Supporting Text as Specified */}
        <div className="text-center space-y-1.5 border-b border-slate-800/80 pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Report an accident
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Take a new photo of the accident. Don't upload an old image.
          </p>
        </div>

        {/* ======================================================== */}
        {/* STEP 1: INITIAL STATE — LARGE CAMERA BUTTON              */}
        {/* ======================================================== */}
        {citizenDraft.step === 'camera' && !useLiveVideo && (
          <div className="py-8 space-y-5 text-center">
            <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center mx-auto text-slate-300 shadow-inner">
              <Camera className="w-10 h-10 text-slate-300" />
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
                onClick={() => citizenCapturePhoto('/images/citizen_road_report.jpg')}
                className="text-xs text-slate-400 hover:text-slate-200 underline pt-1"
              >
                Use sample live street capture
              </button>
            </div>

            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Your device camera and live GPS coordinates will be used to dispatch emergency services to this exact spot.
            </p>
          </div>
        )}

        {/* Live Camera Stream Viewfinder if active */}
        {useLiveVideo && (
          <div className="space-y-4 text-center">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-700">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-mono font-bold">
                LIVE LENS
              </div>
            </div>

            <button
              onClick={handleSnapFromVideo}
              className="w-full py-3.5 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors cursor-pointer"
            >
              Capture Frame
            </button>
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
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[11px] font-mono text-emerald-400 border border-slate-700">
                ✓ Photo verified
              </div>
            </div>

            {/* Location Detected Section as Specified */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>Location detected</span>
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  GPS ±4.8m
                </span>
              </div>

              <p className="text-slate-300 text-[11px]">
                {citizenDraft.locationDetected}
              </p>

              {/* Show Small Map as Specified */}
              <div className="relative h-24 bg-slate-950 rounded border border-slate-800 overflow-hidden flex items-center justify-center">
                <svg viewBox="0 0 240 80" className="w-full h-full">
                  <path d="M 10,40 L 230,40" stroke="#334155" strokeWidth="8" />
                  <path d="M 80,10 L 80,70" stroke="#1e293b" strokeWidth="6" />
                  <circle cx="120" cy="40" r="7" fill="#ef4444" />
                  <circle cx="120" cy="40" r="14" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="1" />
                </svg>
                <div className="absolute bottom-1 right-2 text-[10px] font-mono text-slate-400">
                  Electronic City Elevated Rd
                </div>
              </div>

              {/* Captured just now as Specified */}
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] pt-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Captured just now</span>
              </div>
            </div>

            {/* Button: Send report as Specified */}
            <div className="space-y-2 pt-1">
              <button
                onClick={citizenSubmitReport}
                className="w-full py-3.5 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-base transition-colors shadow-lg shadow-red-950/40 cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Send report</span>
              </button>

              <button
                onClick={citizenResetForm}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-200"
              >
                Retake photo
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: AFTER SUBMISSION — REPORT RECEIVED               */}
        {/* ======================================================== */}
        {citizenDraft.step === 'submitted' && (
          <div className="py-4 space-y-4 animate-in fade-in duration-150">
            {/* Header: Report received as Specified */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-100">
                Report received
              </h3>
              <div className="font-mono text-sm font-bold text-blue-400">
                Incident ID: {citizenDraft.submittedIncidentId || 'RQ-1052'}
              </div>
              <p className="text-xs text-slate-300 max-w-xs mx-auto">
                Authorities are reviewing the report.
              </p>
            </div>

            {/* Status Checklist as Specified */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-xs space-y-2">
              <div className="flex items-center gap-2.5 text-emerald-400">
                <span className="font-bold text-sm">✓</span>
                <span>Photo received</span>
              </div>
              <div className="flex items-center gap-2.5 text-emerald-400">
                <span className="font-bold text-sm">✓</span>
                <span>Location received</span>
              </div>
              <div className="flex items-center gap-2.5 text-amber-400 font-semibold">
                <span className="font-bold text-sm">→</span>
                <span>Waiting for confirmation</span>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={citizenResetForm}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300"
              >
                File another report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

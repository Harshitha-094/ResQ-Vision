import React, { useRef, useEffect, useState } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  Camera,
  Film,
  Maximize2,
  Sliders,
  ShieldAlert,
  FastForward
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'

export default function VideoReplayBuffer({ scenarioKey = 'highway' }) {
  const canvasRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [playbackTime, setPlaybackTime] = useState(0) // 0 to 5 seconds (T-5s to T-0s)
  const [slowMo, setSlowMo] = useState(false)
  const [cameraAngle, setCameraAngle] = useState('cam1') // cam1: Roadside Edge, cam2: Upstream Mast, cam3: Dashcam
  const { activeIncident } = useEmergencyStore()

  // Animation frame loop
  useEffect(() => {
    let animId
    let lastTimestamp = performance.now()

    const step = (now) => {
      const delta = (now - lastTimestamp) / 1000
      lastTimestamp = now

      if (isPlaying) {
        const speed = slowMo ? 0.25 : 1.0
        setPlaybackTime((prev) => {
          const next = prev + delta * speed
          return next >= 5.0 ? 0 : next
        })
      }

      animId = requestAnimationFrame(step)
    }

    animId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animId)
  }, [isPlaying, slowMo])

  // Canvas drawing routine
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.fillStyle = '#050811'
    ctx.fillRect(0, 0, width, height)

    // Time normalized 0.0 to 1.0
    const progress = playbackTime / 5.0
    // Impact happens around T-1.5s (progress approx 0.70)
    const isImpact = progress >= 0.68

    // Draw Road Perspective
    ctx.save()
    if (scenarioKey === 'ghat') {
      // Ghat Mountain Curve with Fog
      ctx.fillStyle = '#061a14'
      ctx.fillRect(0, 0, width, height)

      // Hairpin asphalt curve
      ctx.beginPath()
      ctx.moveTo(0, height * 0.9)
      ctx.bezierCurveTo(width * 0.4, height * 0.8, width * 0.6, height * 0.3, width, height * 0.2)
      ctx.lineWidth = 110
      ctx.strokeStyle = '#1e293b'
      ctx.stroke()

      // Guardrail on cliff edge
      ctx.beginPath()
      ctx.moveTo(0, height * 0.78)
      ctx.bezierCurveTo(width * 0.38, height * 0.68, width * 0.58, height * 0.2, width, height * 0.1)
      ctx.lineWidth = 6
      ctx.strokeStyle = isImpact ? '#ef4444' : '#94a3b8'
      ctx.stroke()

      // Vehicle
      const carX = width * 0.15 + progress * width * 0.55
      const carY = height * 0.85 - Math.sin(progress * Math.PI * 0.8) * height * 0.55

      // Vehicle body
      ctx.save()
      ctx.translate(carX, carY)
      ctx.rotate(isImpact ? 0.45 : -0.2)
      ctx.fillStyle = '#f59e0b'
      ctx.fillRect(-28, -16, 56, 32)
      // Headlights cutting through fog
      ctx.beginPath()
      ctx.moveTo(28, -10)
      ctx.lineTo(120, -40)
      ctx.lineTo(120, 20)
      ctx.closePath()
      ctx.fillStyle = 'rgba(254, 240, 138, 0.25)'
      ctx.fill()
      ctx.restore()

      // Fog layers
      ctx.fillStyle = 'rgba(203, 213, 225, 0.45)'
      ctx.fillRect(0, 0, width, height)
    } else if (scenarioKey === 'urban') {
      // Urban Intersection (Silk Board)
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, width, height)

      // Crossroad
      ctx.fillStyle = '#1e293b'
      ctx.fillRect(0, height * 0.35, width, height * 0.35)
      ctx.fillRect(width * 0.4, 0, width * 0.25, height)

      // Zebra Crossing
      for (let i = 0; i < 7; i++) {
        ctx.fillStyle = '#64748b'
        ctx.fillRect(width * 0.32, height * 0.38 + i * 22, 28, 12)
      }

      // Van
      const vanX = Math.min(width * 0.48, width * 0.1 + progress * width * 0.45)
      ctx.fillStyle = '#38bdf8'
      ctx.fillRect(vanX - 35, height * 0.45 - 20, 70, 40)

      // Two-Wheeler Scooter
      const bikeY = Math.min(height * 0.5, height * 0.9 - progress * height * 0.5)
      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.arc(width * 0.5, bikeY, 14, 0, Math.PI * 2)
      ctx.fill()

      if (isImpact) {
        // Impact flash
        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)'
        ctx.beginPath()
        ctx.arc(width * 0.48, height * 0.48, 45, 0, Math.PI * 2)
        ctx.fill()
      }
    } else {
      // Highway Multi-Lane Expressway (NH-275)
      // Perspective Road
      ctx.beginPath()
      ctx.moveTo(width * 0.45, height * 0.25)
      ctx.lineTo(width * 0.55, height * 0.25)
      ctx.lineTo(width * 0.95, height)
      ctx.lineTo(width * 0.05, height)
      ctx.closePath()
      ctx.fillStyle = '#1e293b'
      ctx.fill()

      // Lane dividers
      ctx.setLineDash([16, 16])
      ctx.strokeStyle = '#f8fafc'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(width * 0.5, height * 0.25)
      ctx.lineTo(width * 0.5, height)
      ctx.stroke()
      ctx.setLineDash([])

      // Barriers
      ctx.strokeStyle = '#475569'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(width * 0.45, height * 0.25)
      ctx.lineTo(width * 0.05, height)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(width * 0.55, height * 0.25)
      ctx.lineTo(width * 0.95, height)
      ctx.stroke()

      // Vehicle 1 (Ahead, sudden stop)
      const leadCarY = height * 0.58
      const leadCarX = width * 0.46
      ctx.fillStyle = '#cbd5e1'
      ctx.fillRect(leadCarX - 25, leadCarY - 18, 50, 36)

      // Vehicle 2 (Behind, high-speed approach & crash at progress > 0.68)
      const tailProgress = Math.min(0.72, progress)
      const tailY = height * 0.9 - (1 - tailProgress / 0.72) * (height * 0.3)
      const tailX = width * 0.47 + (tailProgress - 0.5) * 20
      ctx.fillStyle = '#ef4444'
      ctx.fillRect(tailX - 28, tailY - 20, 56, 40)

      if (isImpact) {
        // Shockwave and debris particles
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2
          const dist = (progress - 0.68) * 160
          ctx.beginPath()
          ctx.arc(tailX + Math.cos(angle) * dist, leadCarY + Math.sin(angle) * dist, 2.5, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
    ctx.restore()

    // High-Tech Edge AI HUD Overlays
    ctx.save()

    // AI Bounding Box on Collision Target
    const boxX = width * 0.38
    const boxY = height * 0.35
    const boxW = width * 0.24
    const boxH = height * 0.35

    ctx.strokeStyle = isImpact ? '#ef4444' : '#22c55e'
    ctx.lineWidth = 1.5
    ctx.strokeRect(boxX, boxY, boxW, boxH)

    // Corner brackets
    const bracketSize = 8
    ctx.strokeStyle = isImpact ? '#f87171' : '#4ade80'
    ctx.lineWidth = 3
    // Top-left
    ctx.beginPath()
    ctx.moveTo(boxX, boxY + bracketSize)
    ctx.lineTo(boxX, boxY)
    ctx.lineTo(boxX + bracketSize, boxY)
    ctx.stroke()
    // Top-right
    ctx.beginPath()
    ctx.moveTo(boxX + boxW - bracketSize, boxY)
    ctx.lineTo(boxX + boxW, boxY)
    ctx.lineTo(boxX + boxW, boxY + bracketSize)
    ctx.stroke()

    // Bounding Box Label
    ctx.fillStyle = isImpact ? 'rgba(239, 68, 68, 0.9)' : 'rgba(34, 197, 94, 0.85)'
    ctx.fillRect(boxX, boxY - 18, 140, 18)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 9px monospace'
    ctx.fillText(
      isImpact ? 'CRASH IMPACT (99.4%)' : 'VEHICLE_TRACK (98.8%)',
      boxX + 4,
      boxY - 6
    )

    // Telemetry stats in HUD overlay
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
    ctx.fillRect(10, 10, 240, 72)
    ctx.strokeStyle = '#334155'
    ctx.strokeRect(10, 10, 240, 72)

    ctx.fillStyle = '#38bdf8'
    ctx.font = '10px monospace'
    ctx.fillText(`EDGE FEED: ${cameraAngle.toUpperCase()} [RING BUFFER]`, 18, 26)

    ctx.fillStyle = isImpact ? '#f87171' : '#e2e8f0'
    ctx.font = 'bold 11px monospace'
    const currentSpeed = isImpact
      ? '0 km/h [DECEL: 82 km/h]'
      : `${Math.round(114 - progress * 15)} km/h`
    ctx.fillText(`VELOCITY: ${currentSpeed}`, 18, 44)

    ctx.fillStyle = '#94a3b8'
    ctx.font = '9.5px monospace'
    ctx.fillText(`G-FORCE: ${isImpact ? '18.4 G (CRITICAL)' : '0.2 G (NORMAL)'}`, 18, 60)
    ctx.fillText(`FPS: 60 • BUFFER: 5.00s RING`, 18, 74)

    // Timestamp Watermark
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.arc(width - 25, 22, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#f8fafc'
    ctx.font = 'bold 10px monospace'
    ctx.fillText('REC T-05s LOOP', width - 120, 26)

    // Current Timecode
    const timecodeSec = (5.0 - playbackTime).toFixed(2)
    ctx.fillStyle = '#cbd5e1'
    ctx.font = 'bold 12px monospace'
    ctx.fillText(`T -0${timecodeSec}s`, width - 95, height - 16)

    ctx.restore()
  }, [playbackTime, scenarioKey, cameraAngle])

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
      {/* Top Replay Bar */}
      <div className="px-3 sm:px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 sm:gap-2 truncate">
          <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 shrink-0" />
          <span className="font-mono font-bold text-slate-200 truncate">
            <span className="hidden sm:inline">5-SECOND ROADSIDE EDGE VIDEO BUFFER</span>
            <span className="sm:hidden">5s EDGE BUFFER</span>
          </span>
          <span className="px-1.5 py-0.2 rounded bg-red-950/80 border border-red-800 text-[9px] sm:text-[10px] font-mono text-red-400 shrink-0">
            PRE & POST IMPACT
          </span>
        </div>

        {/* Camera Angle Selector */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[10px] sm:text-[11px] font-mono overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => setCameraAngle('cam1')}
            className={`px-2 py-0.5 rounded shrink-0 transition-colors ${cameraAngle === 'cam1' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-500'}`}
          >
            Pole Mast #1
          </button>
          <button
            onClick={() => setCameraAngle('cam2')}
            className={`px-2 py-0.5 rounded shrink-0 transition-colors ${cameraAngle === 'cam2' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-500'}`}
          >
            Gantry #2
          </button>
          <button
            onClick={() => setCameraAngle('cam3')}
            className={`px-2 py-0.5 rounded shrink-0 transition-colors ${cameraAngle === 'cam3' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-500'}`}
          >
            C-V2X Cam
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative aspect-[16/9] w-full bg-black">
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Scrubbing & Controls Bar */}
      <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 text-xs">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setPlaybackTime(0)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title="Rewind to T-5.00s"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setSlowMo(!slowMo)}
            className={`px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-[11px] font-mono border transition-colors ${
              slowMo
                ? 'bg-amber-950/80 border-amber-700 text-amber-300 font-bold'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {slowMo ? '0.25x' : '1.0x'}
          </button>
        </div>

        {/* Scrubber slider */}
        <div className="flex-1 min-w-[130px] max-w-xs flex items-center gap-1.5 sm:gap-2 font-mono text-[10px] sm:text-[11px] text-slate-400">
          <span>-5s</span>
          <input
            type="range"
            min="0"
            max="5"
            step="0.05"
            value={playbackTime}
            onChange={(e) => setPlaybackTime(parseFloat(e.target.value))}
            className="w-full accent-red-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span>0s</span>
        </div>

        <div className="text-[10px] sm:text-[11px] font-mono text-slate-300 shrink-0">
          <strong className="text-red-400">T -{(5 - playbackTime).toFixed(2)}s</strong>
        </div>
      </div>
    </div>
  )
}

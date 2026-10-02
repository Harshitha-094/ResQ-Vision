import React, { useState } from 'react'
import {
  MapPin,
  Radio,
  Eye,
  Crosshair,
  AlertTriangle,
  Layers,
  Activity,
  Maximize2,
  Navigation2,
  Building2,
  Car
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'
import { ZONES } from '../data/mockScenarios'
import { playButtonClick } from '../utils/audio'

export default function TacticalMap() {
  const {
    activeIncident,
    selectedZone,
    setZone,
    ambulanceStatus,
    soundEnabled,
  } = useEmergencyStore()

  const [mapLayer, setMapLayer] = useState('tactical') // 'tactical' | 'satellite' | 'sensor_nodes'
  const [showCameras, setShowCameras] = useState(true)
  const [showSignals, setShowSignals] = useState(true)

  // Map coordinates relative positions inside our SVG viewBox (0 0 900 520)
  const zoneLocations = {
    highway: { x: 420, y: 310, label: 'NH-275 KM 42 (Ramanagara)', code: 'RN-KM42' },
    urban: { x: 620, y: 260, label: 'Silk Board / Hebbal (BLR)', code: 'BLR-SB' },
    ghat: { x: 210, y: 220, label: 'Charmadi Ghat Hairpin #8', code: 'GHAT-HP8' },
  }

  const handleZoneSelect = (zoneKey) => {
    if (soundEnabled) playButtonClick()
    setZone(zoneKey)
  }

  const activeZoneCoord = zoneLocations[selectedZone]

  return (
    <div className="relative w-full h-[260px] sm:h-[340px] lg:h-[420px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
      {/* Top Map HUD Bar */}
      <div className="px-3 sm:px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs z-10">
        <div className="flex items-center gap-1.5 sm:gap-2 truncate">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="font-mono font-bold text-slate-200 truncate">
            <span className="hidden sm:inline">KARNATAKA STATE TACTICAL SURVEILLANCE GRID</span>
            <span className="sm:hidden">TACTICAL GRID (GIS)</span>
          </span>
          <span className="hidden md:inline px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-[10px] font-mono text-cyan-300">
            WGS-84 RTK-GPS
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Layer toggles */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[10px] sm:text-[11px]">
            <button
              onClick={() => setShowCameras(!showCameras)}
              className={`px-1.5 sm:px-2 py-0.5 rounded ${showCameras ? 'bg-slate-800 text-cyan-300' : 'text-slate-500'}`}
            >
              CCTV
            </button>
            <button
              onClick={() => setShowSignals(!showSignals)}
              className={`px-1.5 sm:px-2 py-0.5 rounded ${showSignals ? 'bg-slate-800 text-emerald-300' : 'text-slate-500'}`}
            >
              C-V2X
            </button>
          </div>

          <div className="hidden lg:block text-[11px] font-mono text-slate-400 truncate max-w-[140px]">
            <span className="text-slate-200 font-bold">{ZONES[selectedZone].name.split(' ')[0]}</span>
          </div>
        </div>
      </div>

      {/* Main SVG Interactive Map Canvas */}
      <div className="relative flex-1 bg-slate-950/90 overflow-hidden cursor-crosshair">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-grid-tactical opacity-70 pointer-events-none" />

        <svg
          viewBox="0 0 900 520"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full object-contain sm:object-cover select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Radar Sweep Gradient */}
            <radialGradient id="radarSweepGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="expresswayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Western Ghats Mountain Pass Elevation Contours (Top Left / Charmadi) */}
          <g opacity="0.4" stroke="#047857" strokeWidth="1" fill="none">
            <path d="M 80,140 Q 150,110 220,180 T 260,280" />
            <path d="M 110,160 Q 180,140 240,210 T 280,310" strokeDasharray="4 4" />
            <path d="M 60,190 Q 140,180 200,250 T 240,350" />
            <path d="M 140,110 Q 210,90 280,160 T 320,260" stroke="#065f46" />
            <text x="90" y="115" fill="#10b981" fontSize="10" fontFamily="monospace" opacity="0.6">
              WESTERN GHATS (ELEV 1,120M)
            </text>
          </g>

          {/* Major Highway Corridors */}
          {/* NH-275 Expressway (Bengaluru to Mysuru via Ramanagara) */}
          <g>
            <path
              d="M 620,260 L 490,290 L 420,310 L 330,360 L 260,420"
              stroke="#0284c7"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              filter="url(#glow)"
              opacity="0.8"
            />
            {/* White Lane Striping */}
            <path
              d="M 620,260 L 490,290 L 420,310 L 330,360 L 260,420"
              stroke="#ffffff"
              strokeWidth="1"
              strokeDasharray="8 8"
              fill="none"
              opacity="0.7"
            />
            <text x="360" y="345" fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold">
              NH-275 EXPRESSWAY (10-LANE)
            </text>
          </g>

          {/* NH-75 Bengaluru to Mangaluru via Shiradi / Charmadi Ghat */}
          <g>
            <path
              d="M 620,260 L 470,220 L 340,210 L 210,220 L 120,240"
              stroke="#475569"
              strokeWidth="3.5"
              fill="none"
              strokeDasharray="4 2"
              opacity="0.7"
            />
            <text x="240" y="200" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              NH-75 / SH-73 GHAT CORRIDOR
            </text>
          </g>

          {/* Bengaluru Urban Ring Road Network */}
          <g opacity="0.6">
            <ellipse cx="640" cy="240" rx="90" ry="70" stroke="#64748b" strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
            <ellipse cx="640" cy="240" rx="45" ry="35" stroke="#475569" strokeWidth="1" fill="none" />
            <text x="630" y="195" fill="#94a3b8" fontSize="9" fontFamily="monospace" fontWeight="bold">
              BENGALURU ORR / B-TRAC
            </text>
          </g>

          {/* C-V2X Traffic Signal Nodes (Kumbalgodu, Bidadi, Ramanagara) */}
          {showSignals && (
            <g>
              <circle cx="510" cy="285" r="4" fill="#10b981" />
              <text x="518" y="282" fill="#34d399" fontSize="8" fontFamily="monospace">SIG-275-01 (Kumbalgodu)</text>
              <circle cx="460" cy="300" r="4" fill="#10b981" />
              <text x="468" y="297" fill="#34d399" fontSize="8" fontFamily="monospace">SIG-275-02 (Bidadi)</text>
              <circle cx="630" cy="275" r="4" fill="#10b981" />
              <text x="638" y="278" fill="#34d399" fontSize="8" fontFamily="monospace">SIG-BTRAC-01 (Silk Board)</text>
            </g>
          )}

          {/* CCTV Camera Masts */}
          {showCameras && (
            <g opacity="0.75">
              <rect x="415" y="295" width="8" height="8" rx="2" fill="#0284c7" />
              <rect x="615" y="245" width="8" height="8" rx="2" fill="#0284c7" />
              <rect x="205" y="205" width="8" height="8" rx="2" fill="#0284c7" />
            </g>
          )}

          {/* Hospitals Icons */}
          <g>
            {/* Ramanagara District Hospital */}
            <circle cx="390" cy="350" r="5" fill="#ef4444" opacity="0.8" />
            <text x="330" y="375" fill="#f87171" fontSize="9" fontFamily="monospace">
              + Ramanagara District Hosp
            </text>

            {/* NIMHANS */}
            <circle cx="670" cy="230" r="5" fill="#ef4444" opacity="0.8" />
            <text x="680" y="234" fill="#f87171" fontSize="9" fontFamily="monospace">
              + NIMHANS Trauma Hub
            </text>

            {/* Hassan HIMS */}
            <circle cx="180" cy="270" r="5" fill="#ef4444" opacity="0.8" />
            <text x="120" y="290" fill="#f87171" fontSize="9" fontFamily="monospace">
              + HIMS Trauma Care
            </text>
          </g>

          {/* 3 Interactive Zone Node Points */}
          {Object.keys(zoneLocations).map((key) => {
            const pos = zoneLocations[key]
            const isSelected = selectedZone === key
            const isIncidentHere = activeIncident && activeIncident.zoneDetails.id === key

            return (
              <g
                key={key}
                onClick={() => handleZoneSelect(key)}
                className="cursor-pointer transition-transform duration-200"
              >
                {/* Outer Target Radar Ping Rings */}
                {isIncidentHere ? (
                  <g>
                    <circle cx={pos.x} cy={pos.y} r="36" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.8">
                      <animate attributeName="r" from="15" to="50" dur="1.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="1" to="0" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={pos.x} cy={pos.y} r="24" fill="#ef4444" fillOpacity="0.25" stroke="#ef4444" strokeWidth="2" />
                    <line x1={pos.x - 30} y1={pos.y} x2={pos.x + 30} y2={pos.y} stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1={pos.x} y1={pos.y - 30} x2={pos.x} y2={pos.y + 30} stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
                  </g>
                ) : isSelected ? (
                  <circle cx={pos.x} cy={pos.y} r="20" fill="#0284c7" fillOpacity="0.2" stroke="#38bdf8" strokeWidth="1.5" />
                ) : (
                  <circle cx={pos.x} cy={pos.y} r="12" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                )}

                {/* Core Center Dot */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="6"
                  fill={isIncidentHere ? '#ef4444' : isSelected ? '#38bdf8' : '#94a3b8'}
                />

                {/* Callout Label HUD */}
                <g transform={`translate(${pos.x - 70}, ${pos.y - 38})`}>
                  <rect
                    width="140"
                    height="24"
                    rx="4"
                    fill={isIncidentHere ? 'rgba(69, 10, 10, 0.9)' : isSelected ? 'rgba(8, 47, 73, 0.9)' : 'rgba(15, 23, 42, 0.85)'}
                    stroke={isIncidentHere ? '#ef4444' : isSelected ? '#38bdf8' : '#334155'}
                    strokeWidth="1"
                  />
                  <text
                    x="70"
                    y="16"
                    textAnchor="middle"
                    fill={isIncidentHere ? '#fecaca' : isSelected ? '#e0f2fe' : '#94a3b8'}
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {isIncidentHere ? '⚠️ P0 IMPACT LOCUS' : pos.code + ' - ' + (key === 'highway' ? 'HWY' : key === 'urban' ? 'URB' : 'GHAT')}
                  </text>
                </g>
              </g>
            )
          })}

          {/* Real-time Ambulance Navigation Breadcrumb (if incident active and en route) */}
          {activeIncident && ambulanceStatus === 'en_route' && (
            <g>
              <circle
                cx={activeZoneCoord.x + 40}
                cy={activeZoneCoord.y - 20}
                r="7"
                fill="#f59e0b"
                stroke="#ffffff"
                strokeWidth="1.5"
                filter="url(#glow)"
              >
                <animate attributeName="opacity" values="0.8;1;0.8" dur="1s" repeatCount="indefinite" />
              </circle>
              {/* V2X Preemption Wave Aura (250m) */}
              <circle
                cx={activeZoneCoord.x + 40}
                cy={activeZoneCoord.y - 20}
                r="30"
                fill="#10b981"
                fillOpacity="0.12"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              >
                <animate attributeName="r" values="24;36;24" dur="2s" repeatCount="indefinite" />
              </circle>
              <text
                x={activeZoneCoord.x + 52}
                y={activeZoneCoord.y - 16}
                fill="#fbbf24"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
              >
                108-ALS (EN ROUTE)
              </text>
            </g>
          )}

          {/* Compass Rose */}
          <g transform="translate(840, 60)" opacity="0.6">
            <circle cx="0" cy="0" r="22" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            <path d="M 0,-18 L 4,-4 L 0,0 L -4,-4 Z" fill="#ef4444" />
            <path d="M 0,18 L 4,4 L 0,0 L -4,4 Z" fill="#94a3b8" />
            <text x="0" y="-8" textAnchor="middle" fill="#f87171" fontSize="8" fontFamily="monospace" fontWeight="bold">N</text>
          </g>
        </svg>

        {/* Tactical Legend & Status Overlay */}
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-slate-900/90 border border-slate-800 rounded-lg p-1.5 sm:p-2.5 backdrop-blur-md text-[9px] sm:text-[11px] font-mono space-y-0.5 sm:space-y-1">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500 animate-pulse" />
            <span className="text-slate-200">Accident Hotspot</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300">C-V2X Green Wave</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-300">108 ALS En Route</span>
          </div>
        </div>

        {/* Selected Zone Quick Telemetry Pill */}
        <div className="hidden md:block absolute top-3 right-3 bg-slate-900/95 border border-slate-700/80 rounded-lg p-2.5 backdrop-blur-md text-xs font-mono shadow-xl max-w-xs">
          <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-0.5">
            Zone Telemetry Preview
          </div>
          <div className="font-semibold text-slate-100 text-xs truncate">
            {ZONES[selectedZone].name}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex justify-between gap-4">
            <span>Link: <strong className="text-emerald-400">{ZONES[selectedZone].networkStatus.split(' ')[0]}</strong></span>
            <span>LoRa: <strong className="text-cyan-400">865 MHz IN</strong></span>
          </div>
        </div>
      </div>
    </div>
  )
}

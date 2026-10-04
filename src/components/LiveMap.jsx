import React, { useState } from 'react'
import {
  MapPin,
  Ambulance,
  Building2,
  Shield,
  Layers,
  Crosshair,
  Maximize2,
  Navigation2,
  AlertTriangle,
  Radio,
  X,
  ArrowRight
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'

export default function LiveMap({ compact = false, focusedIncidentId = null, onSelectIncident = null }) {
  const {
    incidents,
    hospitals,
    ambulances,
    policeUnits,
    tollPlazas,
    simulationStage,
    setActiveView,
    setSelectedIncidentId,
    setSelectedAmbulanceUnitId
  } = useEmergencyStore()

  const [selectedMarker, setSelectedMarker] = useState(null)
  const [activeLayers, setActiveLayers] = useState({
    incidents: true,
    ambulances: true,
    hospitals: true,
    police: true,
    routes: true
  })

  // SVG Coordinate mapping (800 x 500)
  // Bengaluru geography mapped into SVG coordinates
  const positions = {
    // Incidents
    'RQ-1048': { x: 580, y: 360, label: 'RQ-1048 (NH 44 KM 42.4)', type: 'incident', severity: 'Severe' },
    'RQ-1047': { x: 220, y: 130, label: 'RQ-1047 (Tumkur Road)', type: 'incident', severity: 'Moderate' },
    'RQ-1046': { x: 440, y: 250, label: 'RQ-1046 (Outer Ring Road)', type: 'incident', severity: 'Mild' },
    'RQ-1052': { x: 620, y: 410, label: 'RQ-1052 (Citizen Report)', type: 'incident', severity: 'Pending' },

    // Ambulances
    'AMB-07': simulationStage >= 7 
      ? { x: 575, y: 355, label: 'Ambulance 07 (On Scene)', type: 'ambulance', status: 'On Scene' }
      : simulationStage >= 6
      ? { x: 520, y: 320, label: 'Ambulance 07 (En route)', type: 'ambulance', status: 'En route' }
      : { x: 490, y: 290, label: 'Ambulance 07 (Electronic City Bay)', type: 'ambulance', status: 'Alerted' },
    'AMB-04': { x: 390, y: 220, label: 'Ambulance 04 (Available)', type: 'ambulance', status: 'Available' },
    'AMB-12': { x: 270, y: 155, label: 'Ambulance 12 (En route)', type: 'ambulance', status: 'En route' },
    'AMB-02': { x: 430, y: 270, label: 'Ambulance 02 (Available)', type: 'ambulance', status: 'Available' },

    // Hospitals
    'HOSP-STJOHNS': { x: 460, y: 230, label: "St. John's Hospital", type: 'hospital', eta: '8 min' },
    'HOSP-VICTORIA': { x: 340, y: 170, label: 'Victoria Hospital', type: 'hospital', eta: '10 min' },
    'HOSP-NIMHANS': { x: 390, y: 190, label: 'NIMHANS Bay', type: 'hospital', eta: '14 min' },

    // Police
    'POL-04': simulationStage >= 7
      ? { x: 585, y: 365, label: 'Highway Interceptor 04 (On Scene)', type: 'police' }
      : { x: 540, y: 340, label: 'Highway Interceptor 04 (Dispatched)', type: 'police' },
    'POL-08': { x: 230, y: 135, label: 'Traffic Patrol 08 (Arrived)', type: 'police' },
    'POL-11': { x: 450, y: 245, label: 'BTP Patrol 11 (En route)', type: 'police' },

    // Toll
    'TOLL-17': { x: 650, y: 440, label: 'Toll Plaza 17 (Emergency Lane Open)', type: 'toll' }
  }

  const toggleLayer = (layerKey) => {
    setActiveLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }))
  }

  const handleMarkerClick = (markerId, data) => {
    setSelectedMarker({ id: markerId, ...data })
    if (data.type === 'incident' && onSelectIncident) {
      onSelectIncident(markerId)
    }
  }

  const focusIncident = () => {
    setSelectedMarker({
      id: 'RQ-1048',
      title: 'Incident RQ-1048',
      type: 'incident',
      severity: 'Severe',
      location: 'NH 44, Bengaluru–Hosur Highway KM 42.4',
      status: 'Ambulance en route · Target: 02:14 remaining'
    })
  }

  const focusAmbulance = () => {
    setSelectedMarker({
      id: 'AMB-07',
      title: 'Ambulance 07 (KA 01 AB 1234)',
      type: 'ambulance',
      info: 'ALS Unit · Electronic City Post · Responding to RQ-1048',
      status: simulationStage >= 7 ? 'On Scene' : simulationStage >= 6 ? 'En route (64 km/h)' : 'Alerted'
    })
  }

  return (
    <div className={`relative w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs flex flex-col ${
      compact ? 'h-[280px]' : 'h-[360px] sm:h-[440px] lg:h-[500px]'
    }`}>
      {/* Map Header / Layer Bar */}
      <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs select-none z-10">
        <div className="flex items-center gap-2 text-slate-800 font-semibold">
          <Crosshair className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Live Operations Map</span>
          <span className="text-slate-500 font-mono text-xs hidden sm:inline font-normal">
            · Bengaluru South & Highway Corridors
          </span>
        </div>

        {/* Layer Toggles & Focus Shortcuts */}
        {!compact && (
          <div className="flex items-center gap-1.5 text-xs">
            <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-1 hidden md:flex">
              <button
                onClick={focusIncident}
                className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 border border-red-200 text-red-700 text-[11px] font-mono font-medium shadow-2xs cursor-pointer transition-colors"
                title="Focus on Incident RQ-1048"
              >
                Focus RQ-1048
              </button>
              <button
                onClick={focusAmbulance}
                className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono font-medium shadow-2xs cursor-pointer transition-colors"
                title="Focus on Ambulance 07"
              >
                Focus Amb 07
              </button>
            </div>

            <button
              onClick={() => toggleLayer('incidents')}
              className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                activeLayers.incidents ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
              }`}
            >
              Incidents (4)
            </button>
            <button
              onClick={() => toggleLayer('ambulances')}
              className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                activeLayers.ambulances ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
              }`}
            >
              Ambulances (4)
            </button>
            <button
              onClick={() => toggleLayer('hospitals')}
              className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                activeLayers.hospitals ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
              }`}
            >
              Hospitals (3)
            </button>
            <button
              onClick={() => toggleLayer('police')}
              className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                activeLayers.police ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
              }`}
            >
              Police (3)
            </button>
          </div>
        )}
      </div>

      {/* SVG GIS Canvas */}
      <div className="relative flex-1 bg-slate-950 overflow-hidden cursor-default select-none">
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-map-grid opacity-60 pointer-events-none" />

        {/* Tactical HUD Coordinates Overlay */}
        <div className="absolute top-2.5 left-2.5 pointer-events-none flex flex-col gap-0.5 text-[10px] font-mono text-slate-300 bg-black/80 px-3 py-1.5 rounded-lg border border-white/10 z-10 backdrop-blur-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-semibold">GRID: BANGALORE-SOUTH / NH-44</span>
          </div>
          <div className="text-[10px] text-slate-400">
            GPS: 12.8452° N, 77.6601° E · DGPS: 14 SATS FIXED
          </div>
        </div>

        <svg
          viewBox="0 0 800 500"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="roadHash" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 0,8 l 8,-8 M -2,2 l 4,-4 M 6,10 l 4,-4" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Major Road Arterials */}
          {/* Outer Ring Road Ring */}
          <path
            d="M 180,80 Q 420,120 620,240 Q 680,330 650,450"
            fill="none"
            stroke="#1e293b"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 180,80 Q 420,120 620,240 Q 680,330 650,450"
            fill="none"
            stroke="#334155"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* NH 44 Expressway Corridor (Center-North to South-East) */}
          <path
            d="M 320,60 L 460,230 L 580,360 L 680,470"
            fill="none"
            stroke="#1e293b"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <path
            d="M 320,60 L 460,230 L 580,360 L 680,470"
            fill="none"
            stroke="#475569"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Tumkur Road Corridor (North-West to Center) */}
          <path
            d="M 120,70 L 220,130 L 340,170 L 460,230"
            fill="none"
            stroke="#1e293b"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d="M 120,70 L 220,130 L 340,170 L 460,230"
            fill="none"
            stroke="#334155"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Hosur Road Underpass & Cross Roads */}
          <line x1="280" y1="230" x2="620" y2="230" stroke="#1e293b" strokeWidth="10" />
          <line x1="280" y1="230" x2="620" y2="230" stroke="#334155" strokeWidth="2" strokeDasharray="6 4" />

          {/* Road Corridor Text Labels & Highway Shields */}
          {/* NH 44 Shield */}
          <g transform="translate(600, 310)">
            <rect x="-16" y="-8" width="32" height="15" fill="#1e3a5f" stroke="#60a5fa" strokeWidth="1" rx="2" />
            <text x="0" y="3.5" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold" fontFamily="monospace">NH 44</text>
          </g>
          <text x="622" y="314" fill="#94a3b8" fontSize="10" fontFamily="sans-serif" fontWeight="600" letterSpacing="0.03em">
            Hosur Road Expressway
          </text>

          {/* NH 48 Shield */}
          <g transform="translate(140, 100)">
            <rect x="-16" y="-8" width="32" height="15" fill="#1e3a5f" stroke="#60a5fa" strokeWidth="1" rx="2" />
            <text x="0" y="3.5" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold" fontFamily="monospace">NH 48</text>
          </g>
          <text x="162" y="104" fill="#94a3b8" fontSize="10" fontFamily="sans-serif" fontWeight="600" letterSpacing="0.03em">
            Tumkur Road
          </text>

          {/* ORR Shield */}
          <g transform="translate(470, 205)">
            <rect x="-14" y="-7" width="28" height="14" fill="#334155" stroke="#94a3b8" strokeWidth="1" rx="2" />
            <text x="0" y="3.5" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold" fontFamily="monospace">ORR</text>
          </g>
          <text x="490" y="209" fill="#94a3b8" fontSize="9" fontFamily="sans-serif" fontWeight="600">
            Silk Board Jn Underpass
          </text>

          <text x="655" y="435" fill="#64748b" fontSize="9" fontFamily="sans-serif">
            Toll Plaza 17
          </text>

          {/* Active Response Route (Ambulance 07 -> Incident RQ-1048 -> St. John's Hospital) */}
          {activeLayers.routes && (
            <g>
              {/* Route line */}
              <path
                d="M 460,230 L 520,320 L 580,360"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3.5"
                strokeDasharray="6 4"
                strokeLinecap="round"
                className={simulationStage === 6 ? 'animate-pulse' : ''}
              />
              {/* Incident to Hospital transfer line */}
              {simulationStage >= 9 && (
                <path
                  d="M 580,360 L 460,230"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  className={simulationStage >= 9 && simulationStage <= 11 ? 'animate-pulse' : ''}
                />
              )}
            </g>
          )}

          {/* Toll Plaza Marker */}
          <g transform="translate(650, 440)">
            <rect x="-8" y="-8" width="16" height="16" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" rx="2" />
            <text x="0" y="3.5" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="bold">T</text>
          </g>

          {/* Hospitals */}
          {activeLayers.hospitals && (
            <g>
              {/* St. John's */}
              <g
                transform="translate(460, 230)"
                className="cursor-pointer group"
                onClick={() => handleMarkerClick('HOSP-STJOHNS', {
                  title: "St. John's Hospital",
                  type: 'hospital',
                  info: 'Level-1 Trauma Care · Trauma Bay 1 Reserved',
                  eta: '8 min'
                })}
              >
                <circle r="14" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
                <rect x="-5" y="-5" width="10" height="10" fill="#3b82f6" rx="1" />
                <path d="M -3,0 L 3,0 M 0,-3 L 0,3" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                <text x="18" y="4" fill="#93c5fd" fontSize="10" fontWeight="600" className="drop-shadow">
                  St. John's
                </text>
              </g>

              {/* Victoria Hospital */}
              <g
                transform="translate(340, 170)"
                className="cursor-pointer"
                onClick={() => handleMarkerClick('HOSP-VICTORIA', {
                  title: 'Victoria Hospital Trauma Center',
                  type: 'hospital',
                  info: 'State Trauma Care Facility · Ready for arrival',
                  eta: '10 min'
                })}
              >
                <circle r="11" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5" />
                <path d="M -3,0 L 3,0 M 0,-3 L 0,3" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" />
                <text x="15" y="3" fill="#94a3b8" fontSize="9">
                  Victoria Hosp
                </text>
              </g>

              {/* NIMHANS */}
              <g
                transform="translate(390, 190)"
                className="cursor-pointer"
                onClick={() => handleMarkerClick('HOSP-NIMHANS', {
                  title: 'NIMHANS Neurotrauma',
                  type: 'hospital',
                  info: 'Specialized Neurotrauma Bay · Available (GPS: 12.9392° N, 77.5936° E)',
                  eta: '14 min'
                })}
              >
                <circle r="10" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5" />
                <path d="M -2.5,0 L 2.5,0 M 0,-2.5 L 0,2.5" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" />
                <text x="14" y="3" fill="#94a3b8" fontSize="8">
                  NIMHANS
                </text>
              </g>

              {/* Narayana Health City (Bommasandra) */}
              <g
                transform="translate(620, 395)"
                className="cursor-pointer group"
                onClick={() => handleMarkerClick('HOSP-NARAYANA', {
                  title: 'Narayana Health City',
                  type: 'hospital',
                  info: 'Level-1 Comprehensive Trauma & Cardiac ER · 2.8 km (GPS: 12.8252° N, 77.6895° E)',
                  eta: '6 min'
                })}
              >
                <circle r="13" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
                <rect x="-4" y="-4" width="8" height="8" fill="#10b981" rx="1" />
                <path d="M -2.5,0 L 2.5,0 M 0,-2.5 L 0,2.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                <text x="16" y="4" fill="#6ee7b7" fontSize="9" fontWeight="600" className="drop-shadow">
                  Narayana Health
                </text>
              </g>

              {/* SPARSH Hospital (Hosur Rd) */}
              <g
                transform="translate(605, 415)"
                className="cursor-pointer"
                onClick={() => handleMarkerClick('HOSP-SPARSH', {
                  title: 'SPARSH Hospital',
                  type: 'hospital',
                  info: 'Polytrauma & Orthopedic Emergency · 3.1 km (GPS: 12.8235° N, 77.6890° E)',
                  eta: '7 min'
                })}
              >
                <circle r="10" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5" />
                <path d="M -2.5,0 L 2.5,0 M 0,-2.5 L 0,2.5" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" />
                <text x="14" y="3" fill="#94a3b8" fontSize="8">
                  SPARSH
                </text>
              </g>
            </g>
          )}

          {/* Police Units */}
          {activeLayers.police && (
            <g>
              {/* POL-04 (Highway Interceptor) */}
              <g
                transform={simulationStage >= 7 ? 'translate(588, 368)' : 'translate(540, 335)'}
                className="cursor-pointer"
                onClick={() => handleMarkerClick('POL-04', {
                  title: 'Highway Interceptor 04',
                  type: 'police',
                  info: 'SI M. Kumar · Assigned to RQ-1048',
                  status: simulationStage >= 7 ? 'Arrived' : 'Dispatched'
                })}
              >
                <rect x="-8" y="-8" width="16" height="16" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" rx="2" />
                <text x="0" y="3.5" textAnchor="middle" fill="#f8fafc" fontSize="8" fontWeight="bold">P4</text>
              </g>

              {/* POL-08 */}
              <g
                transform="translate(235, 135)"
                className="cursor-pointer"
                onClick={() => handleMarkerClick('POL-08', {
                  title: 'Traffic Patrol 08',
                  type: 'police',
                  info: 'Inspector K. Patel · Arrived at RQ-1047',
                  status: 'Arrived'
                })}
              >
                <rect x="-7" y="-7" width="14" height="14" fill="#1e293b" stroke="#94a3b8" strokeWidth="1" rx="2" />
                <text x="0" y="3" textAnchor="middle" fill="#cbd5e1" fontSize="7">P8</text>
              </g>
            </g>
          )}

          {/* Ambulances */}
          {activeLayers.ambulances && (
            <g>
              {/* Ambulance 07 (Active Assigned Unit) */}
              <g
                transform={
                  simulationStage >= 7
                    ? 'translate(570, 355)'
                    : simulationStage >= 6
                    ? 'translate(520, 320)'
                    : 'translate(490, 290)'
                }
                className="cursor-pointer"
                onClick={() => handleMarkerClick('AMB-07', {
                  title: 'Ambulance 07 (KA 01 AB 1234)',
                  type: 'ambulance',
                  info: 'ALS Unit · Driver: Ramesh K. · Responding to RQ-1048',
                  status: simulationStage >= 7 ? 'On Scene' : simulationStage >= 6 ? 'En route' : 'Alerted'
                })}
              >
                <circle r="13" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
                <rect x="-5" y="-5" width="10" height="10" fill="#10b981" rx="1.5" />
                <path d="M -3,0 L 3,0 M 0,-3 L 0,3" stroke="#ffffff" strokeWidth="1.5" />
                <text x="16" y="4" fill="#6ee7b7" fontSize="10" fontWeight="bold">
                  Amb 07
                </text>
              </g>

              {/* Ambulance 04 (Available backup unit) */}
              <g
                transform="translate(390, 220)"
                className="cursor-pointer"
                onClick={() => handleMarkerClick('AMB-04', {
                  title: 'Ambulance 04 (KA 04 E 2211)',
                  type: 'ambulance',
                  info: 'BLS Unit · Bommanahalli Bay · Available (Unassigned)',
                  status: 'Available'
                })}
              >
                <circle r="10" fill="#0f172a" stroke="#059669" strokeWidth="1.5" />
                <text x="0" y="3.5" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="bold">A4</text>
                <text x="14" y="3" fill="#94a3b8" fontSize="8">
                  Amb 04
                </text>
              </g>

              {/* Ambulance 12 */}
              <g
                transform="translate(270, 155)"
                className="cursor-pointer"
                onClick={() => handleMarkerClick('AMB-12', {
                  title: 'Ambulance 12 (KA 04 G 4567)',
                  type: 'ambulance',
                  info: 'ALS Unit · En route to RQ-1047 on Tumkur Road',
                  status: 'En route'
                })}
              >
                <circle r="10" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
                <text x="0" y="3.5" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="bold">A12</text>
              </g>
            </g>
          )}

          {/* Incidents */}
          {activeLayers.incidents && (
            <g>
              {/* RQ-1048: Severe on NH 44 KM 42.4 (Primary Interactive Incident) */}
              <g
                transform="translate(580, 360)"
                className="cursor-pointer"
                onClick={() => handleMarkerClick('RQ-1048', {
                  title: 'Incident RQ-1048',
                  type: 'incident',
                  severity: 'Severe',
                  location: 'NH 44, Bengaluru–Hosur Highway KM 42.4',
                  status: 'Ambulance en route · Target: 02:14 remaining',
                  id: 'RQ-1048'
                })}
              >
                {/* Target rings */}
                <circle r="18" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
                <circle r="9" fill="#ef4444" />
                <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">!</text>
                
                {/* Tag label */}
                <g transform="translate(18, -4)">
                  <rect x="0" y="-10" width="104" height="20" fill="#0f172a" stroke="#dc2626" strokeWidth="1" rx="3" />
                  <text x="6" y="4" fill="#fca5a5" fontSize="10" fontWeight="bold">
                    RQ-1048 · Severe
                  </text>
                </g>
              </g>

              {/* RQ-1047: Moderate on Tumkur Road */}
              <g
                transform="translate(220, 130)"
                className="cursor-pointer"
                onClick={() => handleMarkerClick('RQ-1047', {
                  title: 'Incident RQ-1047',
                  type: 'incident',
                  severity: 'Moderate',
                  location: 'Tumkur Road Junction',
                  status: 'Hospital selected · Victoria Hospital',
                  id: 'RQ-1047'
                })}
              >
                <circle r="13" fill="rgba(245, 158, 11, 0.15)" stroke="#f59e0b" strokeWidth="1" />
                <circle r="7" fill="#f59e0b" />
                <text x="14" y="3" fill="#fcd34d" fontSize="9" fontWeight="600">
                  RQ-1047
                </text>
              </g>

              {/* RQ-1046: Mild on Outer Ring Road */}
              <g
                transform="translate(440, 250)"
                className="cursor-pointer"
                onClick={() => handleMarkerClick('RQ-1046', {
                  title: 'Incident RQ-1046',
                  type: 'incident',
                  severity: 'Mild',
                  location: 'Outer Ring Road (Silk Board)',
                  status: 'Police notified · BTP Patrol 11',
                  id: 'RQ-1046'
                })}
              >
                <circle r="6" fill="#94a3b8" stroke="#0f172a" strokeWidth="1.5" />
                <text x="12" y="3" fill="#cbd5e1" fontSize="9">
                  RQ-1046
                </text>
              </g>

              {/* RQ-1052: Citizen Report */}
              {(() => {
                const inc1052 = incidents.find(i => i.id === 'RQ-1052')
                const isCitizenActive = inc1052 && (inc1052.source?.includes('CITIZEN') || inc1052.citizenReport?.photoReceived)
                return (
                  <g
                    transform="translate(620, 410)"
                    className="cursor-pointer"
                    onClick={() => handleMarkerClick('RQ-1052', {
                      title: 'Incident RQ-1052 (Citizen Report)',
                      type: 'incident',
                      severity: inc1052?.severity || 'Moderate',
                      location: inc1052?.location || 'Electronic City Phase 1 Road',
                      status: inc1052?.status || 'Ambulance 04 & BTP Patrol 11 routed',
                      id: 'RQ-1052',
                      isCitizen: true,
                      image: inc1052?.image,
                      coordinates: inc1052?.coordinates,
                      accuracyMeters: inc1052?.citizenReport?.accuracyMeters || 3.4
                    })}
                  >
                    {isCitizenActive && (
                      <circle r="15" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="1" className="animate-ping" />
                    )}
                    <circle r="7" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                    <text x="12" y="3" fill="#93c5fd" fontSize="9" fontWeight="bold">
                      RQ-1052 (Citizen Photo)
                    </text>
                  </g>
                )
              })()}
            </g>
          )}
        </svg>

        {/* Selected Marker Operational Info Overlay */}
        {selectedMarker && (
          <div className="absolute bottom-3 left-3 max-w-xs bg-white/95 border border-slate-200 rounded-xl p-3.5 text-xs shadow-xl backdrop-blur-sm z-20 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-bold text-slate-900 text-xs">{selectedMarker.title}</span>
                {selectedMarker.severity && (
                  <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                    selectedMarker.severity === 'Severe'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : selectedMarker.severity === 'Moderate'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {selectedMarker.severity}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedMarker(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Thumbnail if Citizen Report */}
            {selectedMarker.isCitizen && selectedMarker.image && (
              <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
                <img
                  src={selectedMarker.image}
                  alt="Citizen report thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-emerald-400 border border-white/20">
                  PHOTO CLICKED AT SCENE
                </div>
              </div>
            )}

            <p className="text-slate-600 text-xs leading-relaxed">
              {selectedMarker.location || selectedMarker.info}
            </p>

            {selectedMarker.coordinates && (
              <div className="text-[10px] font-mono text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 font-medium">
                GPS: {selectedMarker.coordinates.lat.toFixed(5)}° N, {selectedMarker.coordinates.lng.toFixed(5)}° E (±{selectedMarker.accuracyMeters || 3.4}m)
              </div>
            )}

            {selectedMarker.status && (
              <div className="text-[11px] font-mono text-slate-500">
                Status: <span className="text-slate-800 font-semibold">{selectedMarker.status}</span>
              </div>
            )}

            <div className="space-y-1.5 pt-1">
              {selectedMarker.id && (
                <button
                  onClick={() => {
                    setSelectedIncidentId(selectedMarker.id)
                    setActiveView('incident_detail')
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  <span>Open Incident Docket</span>
                  <ArrowRight className="w-3 h-3 text-white" />
                </button>
              )}

              {selectedMarker.id === 'RQ-1052' && (
                <button
                  onClick={() => {
                    setSelectedAmbulanceUnitId('AMB-04')
                    setActiveView('ambulances')
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium border border-slate-300 shadow-2xs transition-colors cursor-pointer"
                >
                  <Ambulance className="w-3.5 h-3.5 text-blue-600" />
                  <span>Inspect Ambulance 04 Console</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Small Bottom Map Legend */}
        <div className="absolute bottom-2.5 right-2.5 bg-white/90 border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] text-slate-700 flex items-center gap-3 backdrop-blur-sm pointer-events-none shadow-2xs">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Accident
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Ambulance
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /> Hospital
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" /> Police
          </span>
        </div>
      </div>
    </div>
  )
}

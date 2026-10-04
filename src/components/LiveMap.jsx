import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useMapsLibrary
} from '@vis.gl/react-google-maps'
import {
  Ambulance,
  Crosshair,
  AlertTriangle,
  X,
  ArrowRight,
  Key,
  Globe,
  Satellite,
  ExternalLink,
  Sun,
  Moon
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'

// Primary Operations Center Focus: South Bengaluru / NH-44 Corridor
const DEFAULT_CENTER = { lat: 12.8650, lng: 77.6450 }
const DEFAULT_ZOOM = 12

// Pre-defined GPS coordinates for all assets across South Bengaluru / NH-44
const GEOLOCATIONS = {
  // Incidents
  'RQ-1048': { lat: 12.8452, lng: 77.6601, label: 'RQ-1048 (NH 44 KM 42.4)', type: 'incident', severity: 'Severe' },
  'RQ-1047': { lat: 13.0382, lng: 77.5189, label: 'RQ-1047 (Tumkur Road)', type: 'incident', severity: 'Moderate' },
  'RQ-1046': { lat: 12.9177, lng: 77.6238, label: 'RQ-1046 (Outer Ring Road)', type: 'incident', severity: 'Mild' },
  'RQ-1052': { lat: 12.8492, lng: 77.6685, label: 'RQ-1052 (Citizen Verified)', type: 'incident', severity: 'Moderate' },

  // Hospitals
  'HOSP-NARAYANA': { lat: 12.8252, lng: 77.6895, label: 'Narayana Health City', type: 'hospital', eta: '6 min', bays: 4 },
  'HOSP-SPARSH': { lat: 12.8235, lng: 77.6890, label: 'SPARSH Hospital', type: 'hospital', eta: '7 min', bays: 3 },
  'HOSP-STJOHNS': { lat: 12.9288, lng: 77.6186, label: "St. John's Hospital", type: 'hospital', eta: '14 min', bays: 2 },
  'HOSP-VICTORIA': { lat: 12.9645, lng: 77.5745, label: 'Victoria Hospital', type: 'hospital', eta: '22 min', bays: 2 },
  'HOSP-NIMHANS': { lat: 12.9392, lng: 77.5936, label: 'NIMHANS Neurotrauma', type: 'hospital', eta: '18 min', bays: 3 },

  // Ambulances (Static Base coordinates)
  'AMB-04': { lat: 12.9020, lng: 77.6280, label: 'Ambulance 04 (Bommanahalli)', type: 'ambulance', status: 'Available' },
  'AMB-12': { lat: 13.0280, lng: 77.5380, label: 'Ambulance 12 (Yeshwanthpur)', type: 'ambulance', status: 'En route' },
  'AMB-02': { lat: 12.9150, lng: 77.6200, label: 'Ambulance 02 (Silk Board)', type: 'ambulance', status: 'Available' },

  // Police Units
  'POL-08': { lat: 13.0310, lng: 77.5250, label: 'Traffic Patrol 08 (Yeshwanthpur)', type: 'police' },
  'POL-11': { lat: 12.9210, lng: 77.6310, label: 'BTP Patrol 11 (Outer Ring Road)', type: 'police' },

  // Toll Plaza
  'TOLL-17': { lat: 12.8310, lng: 77.6820, label: 'Toll Plaza 17 (Emergency Lane)', type: 'toll' }
}

// C-V2X Green Wave Corridor Coordinates along NH 44 (Electronic City to St. John's Hospital)
const GREEN_WAVE_CORRIDOR_PATH = [
  { lat: 12.8452, lng: 77.6601 }, // Crash Site KM 42.4
  { lat: 12.8550, lng: 77.6540 }, // Electronic City Toll ramp
  { lat: 12.8720, lng: 77.6470 }, // Veerasandra Elevated Expressway
  { lat: 12.8870, lng: 77.6390 }, // Singasandra Corridor
  { lat: 12.9050, lng: 77.6310 }, // Bommanahalli Flyover
  { lat: 12.9177, lng: 77.6238 }, // Silk Board Underpass / Flyover
  { lat: 12.9288, lng: 77.6186 }  // St. John's Trauma Bay
]

// Dispatch Route (Ambulance 07 Post to Incident 1048)
const AMB07_DISPATCH_PATH = [
  { lat: 12.8520, lng: 77.6520 }, // Electronic City Base Post
  { lat: 12.8486, lng: 77.6560 }, // Hosur Road South Access
  { lat: 12.8452, lng: 77.6601 }  // Scene KM 42.4
]

/**
 * Helper hook component to programmatically pan/zoom the Google Map
 */
function MapCameraHandler({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (!map || !center) return
    map.panTo(center)
    if (zoom !== undefined) {
      map.setZoom(zoom)
    }
  }, [map, center, zoom])
  return null
}

/**
 * Polyline overlay for Google Maps using standard google.maps.Polyline
 */
function MapRoutePolyline({ path, strokeColor = '#3b82f6', strokeWeight = 4, strokeOpacity = 0.85, isDashed = false }) {
  const map = useMap()
  const mapsLib = useMapsLibrary('maps')

  useEffect(() => {
    if (!map || !mapsLib || !path || path.length < 2) return

    const polylineOptions = {
      path,
      geodesic: true,
      strokeColor,
      strokeOpacity,
      strokeWeight,
      map
    }

    if (isDashed && window.google?.maps?.SymbolPath) {
      polylineOptions.strokeOpacity = 0
      polylineOptions.icons = [{
        icon: {
          path: 'M 0,-1 0,1',
          strokeOpacity: 1,
          scale: 3,
          strokeColor
        },
        offset: '0',
        repeat: '14px'
      }]
    }

    const polyline = new window.google.maps.Polyline(polylineOptions)

    return () => {
      polyline.setMap(null)
    }
  }, [map, mapsLib, path, strokeColor, strokeWeight, strokeOpacity, isDashed])

  return null
}

export default function LiveMap({ compact = false, focusedIncidentId = null, onSelectIncident = null }) {
  const {
    incidents,
    simulationStage,
    setActiveView,
    setSelectedIncidentId,
    setSelectedAmbulanceUnitId,
    theme,
    toggleTheme
  } = useEmergencyStore()

  // API Key state: reads from localStorage, env var, or user input
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('resq_gmaps_api_key') || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  })
  const [keyInput, setKeyInput] = useState('')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [mapType, setMapType] = useState('roadmap') // 'roadmap' | 'satellite' | 'hybrid'
  const [renderMode, setRenderMode] = useState('google') // 'google' | 'vector'
  const [apiLoadError, setApiLoadError] = useState(false)

  // Camera focus state
  const [cameraTarget, setCameraTarget] = useState({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM })

  // Synchronize when focusedIncidentId prop changes
  useEffect(() => {
    if (focusedIncidentId && GEOLOCATIONS[focusedIncidentId]) {
      const geo = GEOLOCATIONS[focusedIncidentId]
      setCameraTarget({
        center: { lat: geo.lat, lng: geo.lng },
        zoom: 15
      })
    }
  }, [focusedIncidentId])

  // Active marker selection for InfoWindow / docket card
  const [selectedMarker, setSelectedMarker] = useState(null)

  // Layer filters
  const [activeLayers, setActiveLayers] = useState({
    incidents: true,
    ambulances: true,
    hospitals: true,
    police: true,
    routes: true
  })

  // Dynamic coordinates for Ambulance 07 based on the 12-stage simulation
  const amb07Position = useMemo(() => {
    if (simulationStage >= 11) {
      // Arrived at Hospital Trauma Bay
      return { lat: 12.9288, lng: 77.6186, status: 'At Hospital Trauma Bay 1' }
    }
    if (simulationStage >= 10) {
      // Approaching Silk Board / Koramangala
      return { lat: 12.9177, lng: 77.6238, status: 'Hospital Transit (Silk Board Flyover)' }
    }
    if (simulationStage >= 9) {
      // En route to Hospital along NH 44 (Singasandra)
      return { lat: 12.8870, lng: 77.6390, status: 'Critical Transit to St. John’s (72 km/h)' }
    }
    if (simulationStage >= 7) {
      // On scene at Incident RQ-1048
      return { lat: 12.8455, lng: 77.6598, status: 'On Scene at RQ-1048 (Triage in Progress)' }
    }
    if (simulationStage >= 6) {
      // En route to crash scene
      return { lat: 12.8486, lng: 77.6560, status: 'En route to Scene (64 km/h)' }
    }
    // Base Station
    return { lat: 12.8520, lng: 77.6520, status: 'Electronic City Emergency Post (Standby)' }
  }, [simulationStage])

  // Dynamic coordinates for Police Unit POL-04
  const pol04Position = useMemo(() => {
    if (simulationStage >= 7) {
      return { lat: 12.8458, lng: 77.6608, status: 'On Scene (Traffic Diverted)' }
    }
    return { lat: 12.8410, lng: 77.6660, status: 'Dispatched (Approaching KM 42.4)' }
  }, [simulationStage])

  // Handle saving API key to localStorage
  const handleSaveApiKey = (e) => {
    e?.preventDefault()
    const trimmed = keyInput.trim()
    if (trimmed) {
      localStorage.setItem('resq_gmaps_api_key', trimmed)
      setApiKey(trimmed)
      setApiLoadError(false)
      setShowKeyModal(false)
    }
  }

  // Clear API key
  const handleClearApiKey = () => {
    localStorage.removeItem('resq_gmaps_api_key')
    setApiKey('')
    setKeyInput('')
    setRenderMode('vector')
  }

  const toggleLayer = (layerKey) => {
    setActiveLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }))
  }

  const handleMarkerClick = useCallback((markerId, data) => {
    setSelectedMarker({ id: markerId, ...data })
    if (data.type === 'incident' && onSelectIncident) {
      onSelectIncident(markerId)
    }
  }, [onSelectIncident])

  // Quick Focus Actions
  const focusIncident = () => {
    setCameraTarget({
      center: { lat: 12.8452, lng: 77.6601 },
      zoom: 15
    })
    setSelectedMarker({
      id: 'RQ-1048',
      title: 'Incident RQ-1048',
      type: 'incident',
      severity: 'Severe',
      location: 'NH 44, Bengaluru–Hosur Highway KM 42.4',
      status: 'Ambulance en route · Target: 02:14 remaining',
      lat: 12.8452,
      lng: 77.6601
    })
  }

  const focusAmbulance = () => {
    setCameraTarget({
      center: { lat: amb07Position.lat, lng: amb07Position.lng },
      zoom: 15
    })
    setSelectedMarker({
      id: 'AMB-07',
      title: 'Ambulance 07 (KA 01 AB 1234)',
      type: 'ambulance',
      info: 'ALS Unit · Responding to RQ-1048',
      status: amb07Position.status,
      lat: amb07Position.lat,
      lng: amb07Position.lng
    })
  }

  const resetCorridorView = () => {
    setCameraTarget({
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM
    })
  }

  // SVG Vector Fallback Coordinate Mapping (800 x 500)
  const svgPositions = {
    'RQ-1048': { x: 580, y: 360 },
    'RQ-1047': { x: 220, y: 130 },
    'RQ-1046': { x: 440, y: 250 },
    'RQ-1052': { x: 620, y: 410 },
    'AMB-07': simulationStage >= 7 ? { x: 575, y: 355 } : simulationStage >= 6 ? { x: 520, y: 320 } : { x: 490, y: 290 },
    'AMB-04': { x: 390, y: 220 },
    'AMB-12': { x: 270, y: 155 },
    'AMB-02': { x: 430, y: 270 },
    'HOSP-STJOHNS': { x: 460, y: 230 },
    'HOSP-VICTORIA': { x: 340, y: 170 },
    'HOSP-NIMHANS': { x: 390, y: 190 },
    'POL-04': simulationStage >= 7 ? { x: 585, y: 365 } : { x: 540, y: 340 },
    'POL-08': { x: 230, y: 135 },
    'POL-11': { x: 450, y: 245 },
    'TOLL-17': { x: 650, y: 440 }
  }

  return (
    <div className={`relative w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs flex flex-col ${
      compact ? 'h-[280px]' : 'h-[380px] sm:h-[460px] lg:h-[540px]'
    }`}>
      {/* Map Control Bar */}
      <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs select-none z-10">
        <div className="flex items-center gap-2 text-slate-800 font-semibold">
          <Crosshair className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Live Operations Map</span>
          <span className="text-slate-500 font-mono text-xs hidden sm:inline font-normal">
            · Bengaluru South & NH-44 Grid
          </span>

          {/* Mode Badge */}
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border flex items-center gap-1 ${
            renderMode === 'google' && !apiLoadError
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            <Globe className="w-3 h-3" />
            <span>{renderMode === 'google' && !apiLoadError ? 'Google Maps' : 'Vector GIS Grid'}</span>
          </span>
        </div>

        {/* Map View & Layer Controls */}
        {!compact && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {/* Quick Focus Actions */}
            <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-1 hidden md:flex">
              <button
                onClick={focusIncident}
                className="px-2 py-1 rounded-md bg-white hover:bg-slate-50 border border-red-200 text-red-700 text-[11px] font-mono font-medium shadow-2xs cursor-pointer transition-colors"
                title="Focus on Incident RQ-1048"
              >
                Focus RQ-1048
              </button>
              <button
                onClick={focusAmbulance}
                className="px-2 py-1 rounded-md bg-white hover:bg-slate-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono font-medium shadow-2xs cursor-pointer transition-colors"
                title="Focus on Ambulance 07"
              >
                Focus Amb 07
              </button>
              <button
                onClick={resetCorridorView}
                className="px-2 py-1 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-mono font-medium shadow-2xs cursor-pointer transition-colors"
                title="Overview of South Bengaluru Highway Corridor"
              >
                Corridor
              </button>
            </div>

            {/* Layer Toggles */}
            <button
              onClick={() => toggleLayer('incidents')}
              className={`px-2 py-0.5 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                activeLayers.incidents ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
              }`}
            >
              Incidents
            </button>
            <button
              onClick={() => toggleLayer('ambulances')}
              className={`px-2 py-0.5 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                activeLayers.ambulances ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
              }`}
            >
              Fleet
            </button>
            <button
              onClick={() => toggleLayer('hospitals')}
              className={`px-2 py-0.5 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                activeLayers.hospitals ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
              }`}
            >
              Hospitals
            </button>
            <button
              onClick={() => toggleLayer('police')}
              className={`px-2 py-0.5 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                activeLayers.police ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
              }`}
            >
              Police
            </button>

            {/* Mode & Key Toggle */}
            <div className="flex items-center gap-1 border-l border-slate-200 pl-2 ml-1">
              {/* System Night / Day Mode Toggle */}
              <button
                onClick={toggleTheme}
                className={`px-2 py-0.5 rounded-md border text-[11px] font-mono font-medium cursor-pointer shadow-2xs transition-colors flex items-center gap-1 ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title={theme === 'dark' ? 'Currently in Night Mode · Click to switch whole system to Bright Day Mode' : 'Currently in Day Mode · Click to switch whole system to Dark Night Mode'}
                aria-label="Toggle Night/Day System Theme"
              >
                {theme === 'dark' ? (
                  <>
                    <Moon className="w-3 h-3 text-blue-400 shrink-0" />
                    <span>Night</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>Day</span>
                  </>
                )}
              </button>

              {renderMode === 'google' && (
                <button
                  onClick={() => setMapType(mapType === 'satellite' ? 'roadmap' : 'satellite')}
                  className="p-1 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 cursor-pointer shadow-2xs transition-colors"
                  title={mapType === 'satellite' ? 'Switch to Tactical Roadmap' : 'Switch to Satellite Imagery'}
                >
                  <Satellite className="w-3.5 h-3.5 text-slate-600" />
                </button>
              )}

              <button
                onClick={() => setRenderMode(renderMode === 'google' ? 'vector' : 'google')}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                title="Toggle Google Maps / Vector GIS Grid"
              >
                {renderMode === 'google' ? 'Vector GIS' : 'Google Map'}
              </button>

              <button
                onClick={() => setShowKeyModal(true)}
                className={`p-1 rounded-md border text-xs transition-colors cursor-pointer ${
                  apiKey ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'
                }`}
                title="Configure Google Maps API Key or Demo Key"
              >
                <Key className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Map Stage */}
      <div className="relative flex-1 bg-slate-950 overflow-hidden cursor-default select-none">
        {/* Tactical HUD Coordinates Overlay */}
        <div className="absolute top-2.5 left-2.5 pointer-events-none flex flex-col gap-0.5 text-[10px] font-mono text-slate-300 bg-black/85 px-3 py-1.5 rounded-lg border border-white/10 z-10 backdrop-blur-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-semibold">GRID: BENGALURU-SOUTH / NH-44</span>
          </div>
          <div className="text-[10px] text-slate-400">
            GPS: 12.8452° N, 77.6601° E · DGPS: 14 SATS FIXED
          </div>
        </div>

        {/* Missing API Key Warning / Prompt Bar */}
        {!apiKey && renderMode === 'google' && (
          <div className="absolute top-2.5 right-2.5 max-w-sm bg-slate-900/95 border border-amber-500/40 rounded-xl p-3 text-xs text-slate-200 shadow-xl z-20 backdrop-blur-md space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Google Maps Key Not Configured</span>
              </div>
              <button
                onClick={() => setRenderMode('vector')}
                className="text-slate-400 hover:text-slate-200 text-[10px] font-mono underline cursor-pointer"
              >
                Switch to Vector
              </button>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              ResQVision uses Google Maps Platform for real-time GIS navigation. Provide your Google Cloud API key or free Maps Demo Key to view satellite tiles.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setShowKeyModal(true)}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Key className="w-3 h-3" />
                <span>Enter Key</span>
              </button>
              <a
                href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_git_agentskills_v1"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Get Free Demo Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Mode 1: Real Interactive Google Map */}
        {renderMode === 'google' && apiKey && !apiLoadError ? (
          <APIProvider
            apiKey={apiKey}
            onError={(err) => {
              console.warn('[ResQ-Vision] Google Maps API failed to load:', err)
              setApiLoadError(true)
            }}
          >
            <Map
              mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'}
              style={{ width: '100%', height: '100%' }}
              defaultCenter={DEFAULT_CENTER}
              defaultZoom={DEFAULT_ZOOM}
              mapTypeId={mapType}
              colorScheme={theme === 'dark' ? 'DARK' : 'LIGHT'}
              disableDefaultUI={compact}
              zoomControl={!compact}
              streetViewControl={!compact}
              mapTypeControl={false}
              fullscreenControl={false}
              internalUsageAttributionIds={['gmp_git_agentskills_v1']}
            >
              {/* Programmatic Camera Controller */}
              <MapCameraHandler center={cameraTarget.center} zoom={cameraTarget.zoom} />

              {/* Response Route Polylines */}
              {activeLayers.routes && (
                <>
                  {/* Ambulance Dispatch Route (Blue) */}
                  <MapRoutePolyline
                    path={AMB07_DISPATCH_PATH}
                    strokeColor="#3b82f6"
                    strokeWeight={4}
                    strokeOpacity={0.85}
                  />

                  {/* C-V2X Green Wave Hospital Transfer Corridor (Emerald Glow) */}
                  <MapRoutePolyline
                    path={GREEN_WAVE_CORRIDOR_PATH}
                    strokeColor="#10b981"
                    strokeWeight={5}
                    strokeOpacity={0.9}
                  />
                </>
              )}

              {/* Incidents Markers */}
              {activeLayers.incidents && (
                <>
                  {/* RQ-1048: Primary P0 Incident */}
                  <AdvancedMarker
                    position={{ lat: GEOLOCATIONS['RQ-1048'].lat, lng: GEOLOCATIONS['RQ-1048'].lng }}
                    onClick={() => handleMarkerClick('RQ-1048', {
                      title: 'Incident RQ-1048',
                      type: 'incident',
                      severity: 'Severe',
                      location: 'NH 44, Bengaluru–Hosur Highway KM 42.4',
                      status: 'Ambulance en route · Target: 02:14 remaining',
                      id: 'RQ-1048',
                      lat: GEOLOCATIONS['RQ-1048'].lat,
                      lng: GEOLOCATIONS['RQ-1048'].lng
                    })}
                  >
                    <div className="relative group cursor-pointer flex flex-col items-center">
                      <div className="absolute -inset-2 bg-red-500/20 rounded-full animate-ping pointer-events-none" />
                      <div className="w-8 h-8 rounded-full bg-red-600 border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs">
                        !
                      </div>
                      <div className="mt-1 px-1.5 py-0.5 rounded bg-black/85 border border-red-500/50 text-[10px] font-mono font-bold text-red-300 whitespace-nowrap shadow-md">
                        RQ-1048 · Severe
                      </div>
                    </div>
                  </AdvancedMarker>

                  {/* RQ-1047: Moderate Incident on Tumkur Road */}
                  <AdvancedMarker
                    position={{ lat: GEOLOCATIONS['RQ-1047'].lat, lng: GEOLOCATIONS['RQ-1047'].lng }}
                    onClick={() => handleMarkerClick('RQ-1047', {
                      title: 'Incident RQ-1047',
                      type: 'incident',
                      severity: 'Moderate',
                      location: 'Tumkur Road (NH 48) / Yeshwanthpur Junction',
                      status: 'Hospital selected · Victoria Hospital Trauma Bay',
                      id: 'RQ-1047',
                      lat: GEOLOCATIONS['RQ-1047'].lat,
                      lng: GEOLOCATIONS['RQ-1047'].lng
                    })}
                  >
                    <div className="relative cursor-pointer flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-[10px]">
                        !
                      </div>
                      <div className="mt-0.5 px-1 py-0.2 rounded bg-black/80 text-[9px] font-mono text-amber-300 whitespace-nowrap">
                        RQ-1047
                      </div>
                    </div>
                  </AdvancedMarker>

                  {/* RQ-1046: Mild Incident on Silk Board */}
                  <AdvancedMarker
                    position={{ lat: GEOLOCATIONS['RQ-1046'].lat, lng: GEOLOCATIONS['RQ-1046'].lng }}
                    onClick={() => handleMarkerClick('RQ-1046', {
                      title: 'Incident RQ-1046',
                      type: 'incident',
                      severity: 'Mild',
                      location: 'Outer Ring Road / Silk Board Underpass',
                      status: 'Police notified · BTP Patrol 11',
                      id: 'RQ-1046',
                      lat: GEOLOCATIONS['RQ-1046'].lat,
                      lng: GEOLOCATIONS['RQ-1046'].lng
                    })}
                  >
                    <div className="cursor-pointer flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full bg-slate-400 border border-white shadow-md flex items-center justify-center text-slate-900 font-bold text-[9px]">
                        •
                      </div>
                      <div className="mt-0.5 px-1 py-0.2 rounded bg-black/80 text-[8px] font-mono text-slate-300 whitespace-nowrap">
                        RQ-1046
                      </div>
                    </div>
                  </AdvancedMarker>

                  {/* RQ-1052: Citizen Verified Crash */}
                  {(() => {
                    const inc1052 = incidents.find(i => i.id === 'RQ-1052')
                    return (
                      <AdvancedMarker
                        position={{ lat: GEOLOCATIONS['RQ-1052'].lat, lng: GEOLOCATIONS['RQ-1052'].lng }}
                        onClick={() => handleMarkerClick('RQ-1052', {
                          title: 'Incident RQ-1052 (Citizen Report)',
                          type: 'incident',
                          severity: inc1052?.severity || 'Moderate',
                          location: inc1052?.location || 'Electronic City Phase 1 Road',
                          status: inc1052?.status || 'Ambulance 04 & BTP Patrol 11 routed',
                          id: 'RQ-1052',
                          isCitizen: true,
                          image: inc1052?.image,
                          accuracyMeters: inc1052?.citizenReport?.accuracyMeters || 3.4,
                          lat: GEOLOCATIONS['RQ-1052'].lat,
                          lng: GEOLOCATIONS['RQ-1052'].lng
                        })}
                      >
                        <div className="relative cursor-pointer flex flex-col items-center">
                          <div className="absolute -inset-1.5 bg-blue-500/30 rounded-full animate-ping pointer-events-none" />
                          <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-[10px]">
                            📸
                          </div>
                          <div className="mt-0.5 px-1 py-0.2 rounded bg-black/85 text-[9px] font-mono font-bold text-blue-300 whitespace-nowrap border border-blue-400/40">
                            RQ-1052 (Citizen)
                          </div>
                        </div>
                      </AdvancedMarker>
                    )
                  })()}
                </>
              )}

              {/* Ambulances */}
              {activeLayers.ambulances && (
                <>
                  {/* Ambulance 07 (Active Dispatched Unit moving dynamically) */}
                  <AdvancedMarker
                    position={{ lat: amb07Position.lat, lng: amb07Position.lng }}
                    onClick={() => handleMarkerClick('AMB-07', {
                      title: 'Ambulance 07 (KA 01 AB 1234)',
                      type: 'ambulance',
                      info: 'ALS Unit · Driver: Ramesh K. · Responding to RQ-1048',
                      status: amb07Position.status,
                      lat: amb07Position.lat,
                      lng: amb07Position.lng
                    })}
                  >
                    <div className="relative cursor-pointer flex flex-col items-center">
                      <div className="absolute -inset-1.5 bg-emerald-500/30 rounded-full animate-ping pointer-events-none" />
                      <div className="w-7 h-7 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center text-white">
                        <Ambulance className="w-4 h-4" />
                      </div>
                      <div className="mt-0.5 px-1.5 py-0.5 rounded bg-emerald-950/90 border border-emerald-400/40 text-[9px] font-mono font-bold text-emerald-300 whitespace-nowrap shadow">
                        Amb 07
                      </div>
                    </div>
                  </AdvancedMarker>

                  {/* Ambulance 04 (Available Reserve Unit) */}
                  <AdvancedMarker
                    position={{ lat: GEOLOCATIONS['AMB-04'].lat, lng: GEOLOCATIONS['AMB-04'].lng }}
                    onClick={() => handleMarkerClick('AMB-04', {
                      title: 'Ambulance 04 (KA 04 E 2211)',
                      type: 'ambulance',
                      info: 'BLS Unit · Bommanahalli Bay · Available (Unassigned)',
                      status: 'Available',
                      lat: GEOLOCATIONS['AMB-04'].lat,
                      lng: GEOLOCATIONS['AMB-04'].lng
                    })}
                  >
                    <div className="cursor-pointer flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full bg-teal-600 border border-white shadow flex items-center justify-center text-white text-[8px] font-bold">
                        A4
                      </div>
                      <div className="mt-0.5 px-1 rounded bg-black/80 text-[8px] font-mono text-teal-300 whitespace-nowrap">
                        Amb 04
                      </div>
                    </div>
                  </AdvancedMarker>
                </>
              )}

              {/* Hospitals */}
              {activeLayers.hospitals && (
                <>
                  {/* St. John's Medical College Hospital */}
                  <AdvancedMarker
                    position={{ lat: GEOLOCATIONS['HOSP-STJOHNS'].lat, lng: GEOLOCATIONS['HOSP-STJOHNS'].lng }}
                    onClick={() => handleMarkerClick('HOSP-STJOHNS', {
                      title: "St. John's Medical College Hospital",
                      type: 'hospital',
                      info: 'Level-1 Comprehensive Trauma Care · Trauma Bay 1 Reserved',
                      eta: '14 min',
                      lat: GEOLOCATIONS['HOSP-STJOHNS'].lat,
                      lng: GEOLOCATIONS['HOSP-STJOHNS'].lng
                    })}
                  >
                    <div className="cursor-pointer flex flex-col items-center group">
                      <div className="w-7 h-7 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-xs">
                        H
                      </div>
                      <div className="mt-0.5 px-1.5 py-0.5 rounded bg-black/85 border border-blue-400/40 text-[9px] font-mono font-semibold text-blue-300 whitespace-nowrap shadow">
                        St. John's Hospital
                      </div>
                    </div>
                  </AdvancedMarker>

                  {/* Narayana Health City */}
                  <AdvancedMarker
                    position={{ lat: GEOLOCATIONS['HOSP-NARAYANA'].lat, lng: GEOLOCATIONS['HOSP-NARAYANA'].lng }}
                    onClick={() => handleMarkerClick('HOSP-NARAYANA', {
                      title: 'Narayana Health City',
                      type: 'hospital',
                      info: 'Level-1 Trauma & Cardiac ER · 2.8 km (NH 44 Bommasandra)',
                      eta: '6 min',
                      lat: GEOLOCATIONS['HOSP-NARAYANA'].lat,
                      lng: GEOLOCATIONS['HOSP-NARAYANA'].lng
                    })}
                  >
                    <div className="cursor-pointer flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white shadow flex items-center justify-center text-white font-bold text-[10px]">
                        H
                      </div>
                      <div className="mt-0.5 px-1 rounded bg-black/80 text-[8px] font-mono text-emerald-300 whitespace-nowrap">
                        Narayana Health (2.8km)
                      </div>
                    </div>
                  </AdvancedMarker>

                  {/* SPARSH Hospital */}
                  <AdvancedMarker
                    position={{ lat: GEOLOCATIONS['HOSP-SPARSH'].lat, lng: GEOLOCATIONS['HOSP-SPARSH'].lng }}
                    onClick={() => handleMarkerClick('HOSP-SPARSH', {
                      title: 'SPARSH Hospital',
                      type: 'hospital',
                      info: 'Polytrauma & Orthopedic Emergency · 3.1 km',
                      eta: '7 min',
                      lat: GEOLOCATIONS['HOSP-SPARSH'].lat,
                      lng: GEOLOCATIONS['HOSP-SPARSH'].lng
                    })}
                  >
                    <div className="cursor-pointer flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full bg-blue-500 border border-white shadow flex items-center justify-center text-white text-[9px]">
                        H
                      </div>
                      <div className="mt-0.5 px-1 rounded bg-black/80 text-[8px] font-mono text-slate-300 whitespace-nowrap">
                        SPARSH
                      </div>
                    </div>
                  </AdvancedMarker>
                </>
              )}

              {/* Police Units */}
              {activeLayers.police && (
                <AdvancedMarker
                  position={{ lat: pol04Position.lat, lng: pol04Position.lng }}
                  onClick={() => handleMarkerClick('POL-04', {
                    title: 'Highway Interceptor 04',
                    type: 'police',
                    info: 'SI M. Kumar · Assigned to RQ-1048',
                    status: pol04Position.status,
                    lat: pol04Position.lat,
                    lng: pol04Position.lng
                  })}
                >
                  <div className="cursor-pointer flex flex-col items-center">
                    <div className="w-6 h-6 rounded-md bg-slate-800 border-2 border-slate-300 shadow flex items-center justify-center text-white text-[10px] font-mono font-bold">
                      P4
                    </div>
                    <div className="mt-0.5 px-1 rounded bg-black/80 text-[8px] font-mono text-slate-300 whitespace-nowrap">
                      Police 04
                    </div>
                  </div>
                </AdvancedMarker>
              )}

              {/* Toll Plaza Marker */}
              <AdvancedMarker
                position={{ lat: GEOLOCATIONS['TOLL-17'].lat, lng: GEOLOCATIONS['TOLL-17'].lng }}
                onClick={() => handleMarkerClick('TOLL-17', {
                  title: 'Toll Plaza 17 (Attibele / Electronic City)',
                  type: 'toll',
                  info: 'Lane #1 Emergency FASTag Auto-Lift Priority Active',
                  lat: GEOLOCATIONS['TOLL-17'].lat,
                  lng: GEOLOCATIONS['TOLL-17'].lng
                })}
              >
                <div className="cursor-pointer flex flex-col items-center">
                  <div className="w-5 h-5 rounded-md bg-amber-600 border border-white shadow flex items-center justify-center text-white text-[9px] font-bold">
                    T
                  </div>
                  <div className="mt-0.5 px-1 rounded bg-black/80 text-[8px] font-mono text-amber-300 whitespace-nowrap">
                    Toll 17
                  </div>
                </div>
              </AdvancedMarker>

              {/* Real Google Maps InfoWindow for Selected Tactical Marker */}
              {selectedMarker && selectedMarker.lat && selectedMarker.lng && (
                <InfoWindow
                  position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div className="p-1.5 text-xs max-w-xs space-y-1.5 text-slate-900 font-sans">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1">
                      <span className="font-bold text-slate-900 text-xs">{selectedMarker.title}</span>
                      {selectedMarker.severity && (
                        <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold ${
                          selectedMarker.severity === 'Severe'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {selectedMarker.severity}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      {selectedMarker.location || selectedMarker.info}
                    </p>
                    {selectedMarker.status && (
                      <div className="text-[10px] font-mono text-blue-700 font-medium">
                        Status: {selectedMarker.status}
                      </div>
                    )}
                    {selectedMarker.id && (
                      <button
                        onClick={() => {
                          setSelectedIncidentId(selectedMarker.id)
                          setActiveView('incident_detail')
                        }}
                        className="mt-1 w-full py-1 px-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold text-center cursor-pointer shadow-xs"
                      >
                        Open Incident Docket →
                      </button>
                    )}
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        ) : (
          /* Mode 2: Tactical Vector GIS Grid (Fallback / Offline / Key-less) */
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-map-grid opacity-60 pointer-events-none" />

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

              {/* NH 44 Expressway Corridor */}
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

              {/* Tumkur Road Corridor */}
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

              {/* Hosur Road Cross Roads */}
              <line x1="280" y1="230" x2="620" y2="230" stroke="#1e293b" strokeWidth="10" />
              <line x1="280" y1="230" x2="620" y2="230" stroke="#334155" strokeWidth="2" strokeDasharray="6 4" />

              {/* Highway Shields */}
              <g transform="translate(600, 310)">
                <rect x="-16" y="-8" width="32" height="15" fill="#1e3a5f" stroke="#60a5fa" strokeWidth="1" rx="2" />
                <text x="0" y="3.5" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold" fontFamily="monospace">NH 44</text>
              </g>
              <text x="622" y="314" fill="#94a3b8" fontSize="10" fontFamily="sans-serif" fontWeight="600">
                Hosur Road Expressway
              </text>

              {/* Response Route Polylines */}
              {activeLayers.routes && (
                <g>
                  <path
                    d="M 460,230 L 520,320 L 580,360"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3.5"
                    strokeDasharray="6 4"
                    strokeLinecap="round"
                    className={simulationStage === 6 ? 'animate-pulse' : ''}
                  />
                  {simulationStage >= 9 && (
                    <path
                      d="M 580,360 L 460,230"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3.5"
                      strokeDasharray="4 4"
                      strokeLinecap="round"
                      className="animate-pulse"
                    />
                  )}
                </g>
              )}

              {/* Vector Incidents */}
              {activeLayers.incidents && (
                <g
                  transform="translate(580, 360)"
                  className="cursor-pointer"
                  onClick={() => handleMarkerClick('RQ-1048', {
                    title: 'Incident RQ-1048',
                    type: 'incident',
                    severity: 'Severe',
                    location: 'NH 44, Bengaluru–Hosur Highway KM 42.4',
                    status: 'Ambulance en route · Target: 02:14 remaining',
                    id: 'RQ-1048',
                    lat: GEOLOCATIONS['RQ-1048'].lat,
                    lng: GEOLOCATIONS['RQ-1048'].lng
                  })}
                >
                  <circle r="18" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
                  <circle r="9" fill="#ef4444" />
                  <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">!</text>
                  <g transform="translate(18, -4)">
                    <rect x="0" y="-10" width="104" height="20" fill="#0f172a" stroke="#dc2626" strokeWidth="1" rx="3" />
                    <text x="6" y="4" fill="#fca5a5" fontSize="10" fontWeight="bold">
                      RQ-1048 · Severe
                    </text>
                  </g>
                </g>
              )}

              {/* Vector Ambulance 07 */}
              {activeLayers.ambulances && (
                <g
                  transform={`translate(${svgPositions['AMB-07'].x}, ${svgPositions['AMB-07'].y})`}
                  className="cursor-pointer"
                  onClick={() => handleMarkerClick('AMB-07', {
                    title: 'Ambulance 07 (KA 01 AB 1234)',
                    type: 'ambulance',
                    info: 'ALS Unit · Driver: Ramesh K. · Responding to RQ-1048',
                    status: amb07Position.status,
                    lat: amb07Position.lat,
                    lng: amb07Position.lng
                  })}
                >
                  <circle r="13" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
                  <rect x="-5" y="-5" width="10" height="10" fill="#10b981" rx="1.5" />
                  <path d="M -3,0 L 3,0 M 0,-3 L 0,3" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="16" y="4" fill="#6ee7b7" fontSize="10" fontWeight="bold">
                    Amb 07
                  </text>
                </g>
              )}

              {/* Vector Hospitals */}
              {activeLayers.hospitals && (
                <g
                  transform="translate(460, 230)"
                  className="cursor-pointer"
                  onClick={() => handleMarkerClick('HOSP-STJOHNS', {
                    title: "St. John's Hospital",
                    type: 'hospital',
                    info: 'Level-1 Trauma Care · Trauma Bay 1 Reserved',
                    eta: '14 min',
                    lat: GEOLOCATIONS['HOSP-STJOHNS'].lat,
                    lng: GEOLOCATIONS['HOSP-STJOHNS'].lng
                  })}
                >
                  <circle r="14" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
                  <rect x="-5" y="-5" width="10" height="10" fill="#3b82f6" rx="1" />
                  <path d="M -3,0 L 3,0 M 0,-3 L 0,3" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="18" y="4" fill="#93c5fd" fontSize="10" fontWeight="600">
                    St. John's
                  </text>
                </g>
              )}
            </svg>
          </div>
        )}

        {/* Selected Marker Operational Info Overlay (Persistent & Clear) */}
        {selectedMarker && (
          <div className="absolute bottom-3 left-3 max-w-xs bg-white/95 border border-slate-200 rounded-xl p-3.5 text-xs shadow-xl backdrop-blur-sm z-30 space-y-2.5">
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

            {/* Photo preview if Citizen Report */}
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

            {selectedMarker.lat && selectedMarker.lng && (
              <div className="text-[10px] font-mono text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 font-medium flex items-center justify-between">
                <span>GPS: {selectedMarker.lat.toFixed(4)}° N, {selectedMarker.lng.toFixed(4)}° E</span>
                <span className="text-slate-500 font-normal">DGPS Fix</span>
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

        {/* Bottom Legend */}
        <div className="absolute bottom-2.5 right-2.5 bg-white/90 border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] text-slate-700 flex items-center gap-3 backdrop-blur-sm pointer-events-none shadow-2xs z-10">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Accident (P0)
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

      {/* Google Maps API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Google Maps Platform Setup</h3>
                  <p className="text-xs text-slate-500">Configure your API key for live satellite & road GIS</p>
                </div>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveApiKey} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Google Maps API Key or Demo Key:
                </label>
                <input
                  type="text"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder={apiKey ? '••••••••••••••••••••••••••••••••' : 'AIzaSy...'}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  autoFocus
                />
              </div>

              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200/80 text-[11px] text-blue-900 space-y-1.5">
                <div className="font-semibold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>Prototyping with Maps Demo Key</span>
                </div>
                <p className="text-blue-800 leading-relaxed">
                  You can get a free, instant Maps Demo Key with no billing setup needed from the Google Maps Platform:
                </p>
                <a
                  href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_git_agentskills_v1"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:underline"
                >
                  <span>Mint Maps Demo Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center justify-between pt-2">
                {apiKey ? (
                  <button
                    type="button"
                    onClick={handleClearApiKey}
                    className="text-xs text-red-600 hover:underline cursor-pointer"
                  >
                    Disconnect Key
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setRenderMode('vector')
                      setShowKeyModal(false)
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Use Vector GIS
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs cursor-pointer transition-colors"
                  >
                    Save & Activate
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

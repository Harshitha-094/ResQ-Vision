import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import DemoModePanel from './components/DemoModePanel'
import ControlCenterView from './components/ControlCenterView'
import IncidentsListView from './components/IncidentsListView'
import IncidentDetailView from './components/IncidentDetailView'
import LiveMap from './components/LiveMap'
import AmbulanceView from './components/AmbulanceView'
import HospitalView from './components/HospitalView'
import PoliceView from './components/PoliceView'
import TrafficView from './components/TrafficView'
import TollView from './components/TollView'
import CameraMonitoringView from './components/CameraMonitoringView'
import CitizenReportingView from './components/CitizenReportingView'
import ReportsView from './components/ReportsView'
import ConfirmModal from './components/ConfirmModal'
import SettingsModal from './components/SettingsModal'
import { useEmergencyStore } from './store/emergencyStore'

export default function App() {
  const {
    activeView,
    setActiveView,
    tickTimer
  } = useEmergencyStore()

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Real-time response timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      tickTimer()
    }, 1000)
    return () => clearInterval(timer)
  }, [tickTimer])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-red-500/20 w-full overflow-x-hidden">
      {/* Left Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0b0f19]">
        {/* Top App Header */}
        <TopBar
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* Demo Mode 12-Stage Simulation Controller */}
        <DemoModePanel />

        {/* Main Operational Viewport */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
          {activeView === 'overview' && <ControlCenterView />}
          {activeView === 'incidents' && <IncidentsListView />}
          {activeView === 'incident_detail' && <IncidentDetailView />}
          {activeView === 'map' && (
            <div className="space-y-4 max-w-5xl mx-auto">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-100">
                  Full GIS Operations Map
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  High-definition monitoring grid for Bangalore South and National Highway Corridors
                </p>
              </div>
              <LiveMap />
            </div>
          )}
          {activeView === 'ambulances' && <AmbulanceView />}
          {activeView === 'hospitals' && <HospitalView />}
          {activeView === 'police' && <PoliceView />}
          {activeView === 'traffic' && <TrafficView />}
          {activeView === 'toll' && <TollView />}
          {activeView === 'cameras' && <CameraMonitoringView />}
          {activeView === 'citizen' && <CitizenReportingView />}
          {activeView === 'reports' && <ReportsView />}
        </main>
      </div>

      {/* System Modals */}
      <ConfirmModal />
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  )
}

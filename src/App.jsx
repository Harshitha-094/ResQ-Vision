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
import UserGuideManualView from './components/UserGuideManualView'
import SecurityPrivacyView from './components/SecurityPrivacyView'
import UserGuidesModal from './components/UserGuidesModal'
import FloatingGuidesButton from './components/FloatingGuidesButton'
import ConfirmModal from './components/ConfirmModal'
import SettingsModal from './components/SettingsModal'
import DeskAuthModal from './components/DeskAuthModal'
import AccessRestrictedView from './components/AccessRestrictedView'
import { useEmergencyStore } from './store/emergencyStore'
import { checkViewAuthorization } from './data/rolesConfig'

export default function App() {
  const {
    activeView,
    userRole,
    tickTimer
  } = useEmergencyStore()

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  // Real-time response timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      tickTimer()
    }, 1000)
    return () => clearInterval(timer)
  }, [tickTimer])

  // Verify departmental role access to the requested desk
  const authCheck = checkViewAuthorization(activeView, userRole)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans selection:bg-blue-600/10 w-full overflow-x-hidden">
      {/* Left Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Top App Header with Department Credentials Switcher */}
        <TopBar
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onOpenAuthModal={() => setAuthModalOpen(true)}
        />

        {/* Demo Mode 12-Stage Simulation Controller */}
        <DemoModePanel />

        {/* Main Operational Viewport */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
          {!authCheck.allowed ? (
            <AccessRestrictedView
              targetView={activeView}
              authCheck={authCheck}
            />
          ) : (
            <>
              {activeView === 'overview' && <ControlCenterView />}
              {activeView === 'incidents' && <IncidentsListView />}
              {activeView === 'incident_detail' && <IncidentDetailView />}
              {activeView === 'map' && (
                <div className="space-y-4 max-w-6xl mx-auto">
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">
                      Full GIS Operations Map
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Real-time spatial monitoring grid for South Bengaluru and National Highway Corridors
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
              {activeView === 'manual' && <UserGuideManualView />}
              {activeView === 'security' && <SecurityPrivacyView />}
            </>
          )}
        </main>
      </div>

      {/* System Modals & Floating Help */}
      <ConfirmModal />
      <UserGuidesModal />
      <FloatingGuidesButton />
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <DeskAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  )
}

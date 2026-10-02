import React, { useEffect } from 'react'
import Header from './components/Header'
import CommandCenterView from './components/CommandCenterView'
import AmbulanceConsoleView from './components/AmbulanceConsoleView'
import HospitalBayView from './components/HospitalBayView'
import GreenCorridorView from './components/GreenCorridorView'
import MobileCamView from './components/MobileCamView'
import OutboundDrawer from './components/OutboundDrawer'
import { useEmergencyStore } from './store/emergencyStore'

export default function App() {
  const {
    activeTab,
    ambulanceStatus,
    decrementCountdown,
    advanceSimulationProgress,
    triggerIncident,
    acceptDispatch,
    toggleSound,
    outboundDrawerOpen,
  } = useEmergencyStore()

  // Auto-decrementing driver timeout (15s countdown)
  useEffect(() => {
    let interval = null
    if (ambulanceStatus === 'alerted') {
      interval = setInterval(() => {
        decrementCountdown()
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [ambulanceStatus, decrementCountdown])

  // Real-time progress advancement when ambulance is en route
  useEffect(() => {
    let interval = null
    if (ambulanceStatus === 'en_route') {
      interval = setInterval(() => {
        advanceSimulationProgress()
      }, 2000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [ambulanceStatus, advanceSimulationProgress])

  // Helpful keyboard shortcuts for high-stakes demonstrations
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      if (e.key === '1') {
        triggerIncident('highway')
      } else if (e.key === '2') {
        triggerIncident('urban')
      } else if (e.key === '3') {
        triggerIncident('ghat')
      } else if (e.key === ' ' && ambulanceStatus === 'alerted') {
        e.preventDefault()
        acceptDispatch()
      } else if (e.key === 'm' || e.key === 'M') {
        toggleSound()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [ambulanceStatus, triggerIncident, acceptDispatch, toggleSound])

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500/30 w-full overflow-x-hidden">
      {/* Sticky Mission-Control Header */}
      <Header />

      {/* Main View Area with Bottom Padding for Drawer */}
      <main
        className={`flex-1 px-2.5 sm:px-4 md:px-6 py-3 sm:py-5 transition-all duration-300 w-full ${
          outboundDrawerOpen ? 'pb-[70vh] sm:pb-96' : 'pb-14 sm:pb-16'
        }`}
      >
        <div className="max-w-7xl mx-auto w-full">
          {activeTab === 'camera' && <MobileCamView />}
          {activeTab === 'command' && <CommandCenterView />}
          {activeTab === 'ambulance' && <AmbulanceConsoleView />}
          {activeTab === 'hospital' && <HospitalBayView />}
          {activeTab === 'corridor' && <GreenCorridorView />}
        </div>
      </main>

      {/* Persistent Collapsible Outbound Telemetry & Communications Drawer */}
      <OutboundDrawer />
    </div>
  )
}

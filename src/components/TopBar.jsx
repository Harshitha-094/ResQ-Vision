import React, { useState, useEffect } from 'react'
import {
  Menu,
  Bell,
  CheckCheck,
  ChevronDown,
  Play,
  RotateCcw,
  Sparkles,
  Sliders,
  ShieldCheck,
  Volume2,
  VolumeX,
  X,
  Radio,
  ExternalLink
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'

export default function TopBar({ onToggleMobileSidebar }) {
  const {
    activeView,
    setActiveView,
    notifications,
    notificationsOpen,
    setNotificationsOpen,
    markNotificationRead,
    markAllNotificationsRead,
    demoPanelOpen,
    setDemoPanelOpen,
    simulationStage,
    soundEnabled,
    toggleSound,
    setSelectedIncidentId
  } = useEmergencyStore()

  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const dateStr = now.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
      const timeStr = now.toLocaleTimeString('en-IN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      setCurrentTime(`${dateStr} · ${timeStr} IST`)
    }

    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const roles = [
    { view: 'overview', label: 'Control Center' },
    { view: 'ambulances', label: 'Ambulance 07' },
    { view: 'hospitals', label: 'Hospital Desk' },
    { view: 'police', label: 'Police Unit' },
    { view: 'traffic', label: 'Traffic Authority' },
    { view: 'toll', label: 'Toll Authority' },
    { view: 'citizen', label: 'Citizen Reporter' },
    { view: 'cameras', label: 'Camera Feeds' }
  ]

  const activeRoleLabel = roles.find(r => r.view === activeView)?.label || 'Control Center'

  return (
    <header className="sticky top-0 z-30 bg-slate-950 border-b border-slate-800/90 h-13 px-3 sm:px-5 flex items-center justify-between gap-3 text-xs select-none">
      {/* Left: Mobile hamburger + Operational Status */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="p-1.5 rounded hover:bg-slate-900 border border-slate-800 md:hidden text-slate-300"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Current Operational Status */}
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="hidden sm:inline text-slate-200">
            Normal monitoring
          </span>
          <span className="text-slate-400 text-[11px] hidden lg:inline">
            · All 5 dispatch channels operational
          </span>
        </div>
      </div>

      {/* Right Controls: Notifications, Date/Time, Role Switcher, Demo Mode Pill */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors hidden sm:flex"
          title={soundEnabled ? 'Mute alert audio' : 'Unmute alert audio'}
          aria-label={soundEnabled ? 'Mute audio' : 'Unmute audio'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-slate-600" />}
        </button>

        {/* Live Date / Time */}
        <div className="hidden md:block font-mono text-[11px] text-slate-400 px-2 py-1 rounded bg-slate-900/60 border border-slate-800/60">
          {currentTime}
        </div>

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-1.5 rounded hover:bg-slate-900 text-slate-300 border border-slate-800/80 transition-colors"
            title="Operational Notifications"
            aria-label="Operational Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1 min-w-[15px] h-[15px] rounded-full bg-red-600 text-white font-mono text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700/80 rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between text-xs bg-slate-950/80">
                <span className="font-semibold text-slate-200">Dispatch Notifications</span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <CheckCheck className="w-3 h-3" />
                      <span>Mark read</span>
                    </button>
                  )}
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 text-xs">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-xs">
                    No active notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationRead(notif.id)
                        if (notif.title.includes('RQ-1048')) {
                          setSelectedIncidentId('RQ-1048')
                          setActiveView('incident_detail')
                        }
                      }}
                      className={`p-2.5 transition-colors cursor-pointer ${
                        notif.read ? 'bg-slate-900/60 hover:bg-slate-800/60' : 'bg-slate-800/50 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5 mb-0.5">
                        <span className={`font-medium ${
                          notif.type === 'critical' ? 'text-red-400' : notif.type === 'warning' ? 'text-amber-400' : 'text-slate-200'
                        }`}>
                          {notif.title}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 shrink-0">
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        {notif.detail}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Quick Switcher */}
        <div className="flex items-center">
          <select
            value={activeView}
            onChange={(e) => setActiveView(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded px-2 py-1 text-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
            title="Switch User Role View"
            aria-label="Switch User Role View"
          >
            {roles.map(r => (
              <option key={r.view} value={r.view}>
                View as: {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Demo Mode Pill Indicator & Controller Toggle */}
        <button
          onClick={() => setDemoPanelOpen(!demoPanelOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
            demoPanelOpen
              ? 'bg-amber-950/80 border-amber-600 text-amber-300'
              : 'bg-slate-900 hover:bg-slate-800 border-amber-900/40 text-amber-400/90'
          }`}
          title="Toggle 12-Stage Simulation Panel"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-pulse" />
          <span className="font-mono text-[11px] font-semibold">Demo Mode</span>
          <span className="font-mono text-[10px] text-amber-300/80 hidden sm:inline">
            (Step {simulationStage}/12)
          </span>
        </button>
      </div>
    </header>
  )
}

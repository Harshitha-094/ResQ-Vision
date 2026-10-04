import React, { useState, useEffect } from 'react'
import {
  Menu,
  Bell,
  CheckCheck,
  Volume2,
  VolumeX,
  X,
  BookOpen,
  KeyRound,
  ShieldCheck
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'
import { DEPARTMENT_ROLES } from '../data/rolesConfig'
import { authenticateRole } from '../utils/authService'

export default function TopBar({ onToggleMobileSidebar, onOpenAuthModal }) {
  const {
    activeView,
    setActiveView,
    userRole,
    setUserRole,
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
  const currentRoleObj = DEPARTMENT_ROLES.find(r => r.id === userRole) || DEPARTMENT_ROLES[0]

  const handleRoleChange = async (newRole) => {
    setUserRole(newRole)
    // Synchronize signed server session token
    await authenticateRole(newRole, null, null, true)
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-14 px-4 sm:px-6 flex items-center justify-between gap-3 text-xs select-none shadow-xs">
      {/* Left: Mobile hamburger + Brand + Operational Status */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="p-1.5 rounded-lg hover:bg-slate-100 border border-slate-200 md:hidden text-slate-700 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Mobile-visible ResQVision Logo Emblem */}
        <div className="flex items-center gap-2 md:hidden">
          <img
            src="/resqvision-icon.svg"
            alt="ResQVision"
            className="w-6 h-6 object-contain"
          />
          <span className="font-extrabold text-slate-900 tracking-tight text-sm">
            ResQVision
          </span>
        </div>

        {/* Current Operational Status */}
        <div className="hidden sm:flex items-center gap-2 font-medium text-slate-800">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-semibold text-slate-900">
            Normal Monitoring
          </span>
          <span className="text-slate-500 text-xs hidden lg:inline">
            · 5 multi-agency dispatch channels active
          </span>
        </div>
      </div>

      {/* Right Controls: Notifications, Date/Time, Role Switcher, Demo Mode Pill */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors hidden sm:flex border border-transparent hover:border-slate-200"
          title={soundEnabled ? 'Mute alert audio' : 'Unmute alert audio'}
          aria-label={soundEnabled ? 'Mute audio' : 'Unmute audio'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        </button>

        {/* Live Date / Time */}
        <div className="hidden md:block font-mono text-[11px] text-slate-600 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200">
          {currentTime}
        </div>

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
            title="Operational Notifications"
            aria-label="Operational Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1 min-w-[16px] h-4 rounded-full bg-red-600 text-white font-mono text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between text-xs bg-slate-50">
                <span className="font-semibold text-slate-900">Dispatch Notifications</span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark read</span>
                    </button>
                  )}
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
                {notifications.length === 0 ? (
                  <div className="p-5 text-center text-slate-500 text-xs">
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
                      className={`p-3 transition-colors cursor-pointer ${
                        notif.read ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/40 hover:bg-blue-50/70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className={`font-semibold ${
                          notif.type === 'critical' ? 'text-red-600' : notif.type === 'warning' ? 'text-amber-700' : 'text-slate-900'
                        }`}>
                          {notif.title}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 shrink-0">
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {notif.detail}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Guide Manual Quick Link */}
        <button
          onClick={() => setActiveView('manual')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
            activeView === 'manual'
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
          }`}
          title="Open Human-Made Operational Field Manual (SOP-802)"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">User Guide</span>
        </button>

        {/* Department Terminal Clearance Switcher */}
        <div className="flex items-center gap-2">
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-slate-500">Badge:</span>
            <span className="text-slate-800 font-semibold">{currentRoleObj.badgeId}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={userRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs font-medium focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer transition-colors shadow-2xs"
              title="Switch Department Terminal Credentials"
              aria-label="Switch Department Terminal Credentials"
            >
              {DEPARTMENT_ROLES.map(role => (
                <option key={role.id} value={role.id}>
                  Role: {role.name}
                </option>
              ))}
            </select>

            <button
              onClick={onOpenAuthModal}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-blue-600 transition-colors shadow-2xs cursor-pointer"
              title="Authenticate Desk with Department Badge ID & Passcode"
              aria-label="Authenticate Desk with Department Badge ID & Passcode"
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
            </button>
          </div>
        </div>

        {/* Demo Mode Pill Indicator & Controller Toggle */}
        <button
          onClick={() => setDemoPanelOpen(!demoPanelOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
            demoPanelOpen
              ? 'bg-amber-100 border-amber-300 text-amber-900 font-semibold'
              : 'bg-amber-50 hover:bg-amber-100/70 border-amber-200 text-amber-800'
          }`}
          title="Toggle 12-Stage Simulation Panel"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
          <span className="font-semibold">Demo Simulation</span>
          <span className="font-mono text-[11px] text-amber-700 hidden sm:inline">
            ({simulationStage}/12)
          </span>
        </button>
      </div>
    </header>
  )
}

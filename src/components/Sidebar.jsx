import React, { useState } from 'react'
import {
  LayoutDashboard,
  AlertCircle,
  Map as MapIcon,
  Ambulance,
  Building2,
  Shield,
  Activity,
  CreditCard,
  Camera,
  Smartphone,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  Radio,
  Lock,
  ShieldAlert,
  KeyRound,
  BookOpen
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'
import { DEPARTMENT_ROLES, checkViewAuthorization } from '../data/rolesConfig'

export default function Sidebar({ mobileOpen, setMobileOpen, onOpenSettings }) {
  const {
    activeView,
    setActiveView,
    userRole,
    setUserRole,
    incidents,
    openConfirmModal
  } = useEmergencyStore()

  const activeCount = incidents.filter(i => i.status !== 'Completed').length
  const currentRoleObj = DEPARTMENT_ROLES.find(r => r.id === userRole) || DEPARTMENT_ROLES[0]

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'incidents', label: 'Live Incidents', icon: AlertCircle, badge: activeCount },
    { id: 'map', label: 'Map', icon: MapIcon },
    { id: 'ambulances', label: 'Ambulances', icon: Ambulance, deskRole: 'ambulance' },
    { id: 'hospitals', label: 'Hospitals', icon: Building2, deskRole: 'hospital' },
    { id: 'police', label: 'Police', icon: Shield, deskRole: 'police' },
    { id: 'traffic', label: 'Traffic', icon: Activity, deskRole: 'traffic' },
    { id: 'toll', label: 'Toll Authority', icon: CreditCard, deskRole: 'toll' },
    { id: 'cameras', label: 'Camera Feeds', icon: Camera },
    { id: 'citizen', label: 'Citizen Report', icon: Smartphone, deskRole: 'citizen' },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'manual', label: 'User Guide Manual', icon: BookOpen }
  ]

  const handleNavClick = (viewId) => {
    setActiveView(viewId)
    if (setMobileOpen) setMobileOpen(false)
  }

  const handleSignOut = () => {
    openConfirmModal({
      title: 'Sign out of Dispatch Session?',
      message: 'Active emergency monitoring will be reassigned to the backup duty operator.',
      confirmLabel: 'Sign Out',
      isDestructive: true,
      onConfirm: () => {
        window.location.reload()
      }
    })
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen h-[100dvh] w-64 bg-slate-950 border-r border-slate-800/90 flex flex-col z-50 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="px-4 py-3.5 border-b border-slate-800/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-red-600/90 flex items-center justify-center text-white font-black text-sm tracking-wider">
              RV
            </div>
            <div>
              <div className="font-bold text-slate-100 tracking-tight text-sm flex items-center gap-1.5">
                <span>ResQVision</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" title="System Live" />
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                CAD DESK ISOLATION ACTIVE
              </div>
            </div>
          </div>
        </div>

        {/* Active Terminal Badge Card */}
        <div className="p-3 mx-2 my-2 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 font-semibold block">
              Active Terminal Badge
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="font-bold text-slate-100 text-xs truncate">
            {currentRoleObj.name}
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
            <span className="text-emerald-400">{currentRoleObj.badgeId}</span>
            <span className="text-slate-500">RBAC Active</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto" aria-label="Main Navigation">
          <div className="px-2 pb-1.5 text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold flex items-center justify-between">
            <span>Department Desks</span>
            <span className="text-[9px] text-slate-400 font-normal">Strict Clearance</span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id || (item.id === 'incidents' && activeView === 'incident_detail')
            const auth = checkViewAuthorization(item.id, userRole)
            const isRestricted = !auth.allowed

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={isRestricted ? `Restricted: ${auth.reason}` : item.label}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-slate-100 font-semibold border border-slate-700/80 shadow-xs'
                    : isRestricted
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? 'text-blue-400'
                      : isRestricted
                      ? 'text-slate-400'
                      : 'text-slate-400'
                  }`} />
                  <span className={`truncate ${isRestricted ? 'text-slate-400 line-through-none' : ''}`}>
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isRestricted ? (
                    <span className="px-1.5 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-[9px] font-mono text-slate-400 flex items-center gap-0.5" title="Restricted Desk">
                      <Lock className="w-2.5 h-2.5 text-amber-500" />
                      <span className="text-[9px]">Locked</span>
                    </span>
                  ) : item.badge !== undefined && item.badge > 0 ? (
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                      isActive ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {String(item.badge).padStart(2, '0')}
                    </span>
                  ) : null}
                </div>
              </button>
            )
          })}
        </nav>

        {/* Bottom Sidebar - User Profile & Controls */}
        <div className="p-3 border-t border-slate-800/90 bg-slate-950/60 space-y-2">
          {/* User & Role */}
          <div className="px-2 py-1.5 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="truncate">
              <div className="font-medium text-slate-200 text-xs truncate">
                Duty Terminal: {currentRoleObj.shortName}
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">
                {currentRoleObj.department}
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-emerald-400 border border-slate-700 shrink-0">
              Shift A
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={onOpenSettings}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 transition-colors text-[11px] cursor-pointer"
              title="System Settings"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Settings</span>
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

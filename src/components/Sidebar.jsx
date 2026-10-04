import React from 'react'
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
  Lock,
  BookOpen,
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'
import { DEPARTMENT_ROLES, checkViewAuthorization } from '../data/rolesConfig'
import { clearStoredSession } from '../utils/authService'

export default function Sidebar({ mobileOpen, setMobileOpen, onOpenSettings }) {
  const {
    activeView,
    setActiveView,
    userRole,
    incidents,
    openConfirmModal,
    theme,
    toggleTheme
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
    { id: 'manual', label: 'User Guide Manual', icon: BookOpen },
    { id: 'security', label: 'Security & Privacy', icon: ShieldCheck }
  ]

  const handleNavClick = (viewId) => {
    setActiveView(viewId)
    if (setMobileOpen) setMobileOpen(false)
  }

  const handleSignOut = () => {
    openConfirmModal({
      title: 'Sign out of Dispatch Session?',
      message: 'Active emergency monitoring session token will be revoked.',
      confirmLabel: 'Sign Out',
      isDestructive: true,
      onConfirm: async () => {
        clearStoredSession()
        try {
          await fetch('/api/auth/logout', { method: 'POST' })
        } catch {}
        window.location.reload()
      }
    })
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen h-[100dvh] w-64 bg-white border-r border-slate-200 flex flex-col z-50 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-1 shadow-md shadow-blue-950/20 shrink-0">
              <img
                src="/resqvision-icon.svg"
                alt="ResQVision Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 tracking-tight text-base flex items-center gap-1.5">
                <span>ResQVision</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Operational" />
              </div>
              <div className="text-[10px] text-blue-700 font-mono font-semibold tracking-wider">
                EMERGENCY CAD NETWORK
              </div>
            </div>
          </div>
        </div>

        {/* Active Terminal Badge Card */}
        <div className="p-3 mx-3 my-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold block">
              Active Terminal Badge
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="font-bold text-slate-900 text-xs truncate">
            {currentRoleObj.name}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-0.5">
            <span className="text-blue-700 font-semibold">{currentRoleObj.badgeId}</span>
            <span className="text-slate-400">RBAC Active</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto" aria-label="Main Navigation">
          <div className="px-2 pb-1.5 text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold flex items-center justify-between">
            <span>Navigation</span>
            <span className="text-[9px] text-slate-400 font-normal">Role Enforced</span>
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
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200 shadow-2xs'
                    : isRestricted
                    ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? 'text-blue-600'
                      : isRestricted
                      ? 'text-slate-400'
                      : 'text-slate-500'
                  }`} />
                  <span className="truncate">
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isRestricted ? (
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-500 flex items-center gap-0.5" title="Restricted Desk">
                      <Lock className="w-2.5 h-2.5 text-amber-600" />
                      <span className="text-[9px]">Locked</span>
                    </span>
                  ) : item.badge !== undefined && item.badge > 0 ? (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isActive ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600 border border-red-200'
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
        <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2">
          {/* User & Role */}
          <div className="px-3 py-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs">
            <div className="truncate">
              <div className="font-semibold text-slate-900 text-xs truncate">
                {currentRoleObj.shortName}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {currentRoleObj.department}
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-mono text-slate-700 border border-slate-200 shrink-0">
              Shift A
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={onOpenSettings}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors text-xs font-medium cursor-pointer shadow-2xs truncate"
              title="System Settings"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">Settings</span>
            </button>
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs shrink-0"
              title={theme === 'dark' ? 'Switch to Bright Mode' : 'Switch to Dark Mode'}
              aria-label={theme === 'dark' ? 'Switch to Bright Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center p-1.5 rounded-lg bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 transition-colors cursor-pointer shadow-2xs shrink-0"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

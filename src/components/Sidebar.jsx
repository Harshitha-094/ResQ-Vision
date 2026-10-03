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
  Radio
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'

export default function Sidebar({ mobileOpen, setMobileOpen, onOpenSettings }) {
  const {
    activeView,
    setActiveView,
    incidents,
    openConfirmModal
  } = useEmergencyStore()

  const activeCount = incidents.filter(i => i.status !== 'Completed').length

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'incidents', label: 'Live Incidents', icon: AlertCircle, badge: activeCount },
    { id: 'map', label: 'Map', icon: MapIcon },
    { id: 'ambulances', label: 'Ambulances', icon: Ambulance },
    { id: 'hospitals', label: 'Hospitals', icon: Building2 },
    { id: 'police', label: 'Police', icon: Shield },
    { id: 'traffic', label: 'Traffic', icon: Activity },
    { id: 'toll', label: 'Toll Authority', icon: CreditCard },
    { id: 'cameras', label: 'Camera Feeds', icon: Camera },
    { id: 'citizen', label: 'Citizen Report', icon: Smartphone },
    { id: 'reports', label: 'Reports', icon: FileText }
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
                EMERGENCY DISPATCH
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto" aria-label="Main Navigation">
          <div className="px-2 pb-1.5 text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">
            Operational Views
          </div>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id || (item.id === 'incidents' && activeView === 'incident_detail')

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-slate-100 font-semibold border border-slate-700/80 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                    isActive ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {String(item.badge).padStart(2, '0')}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Bottom Sidebar - User Profile & Controls */}
        <div className="p-3 border-t border-slate-800/90 bg-slate-950/60 space-y-2">
          {/* User & Role */}
          <div className="px-2 py-1.5 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="truncate">
              <div className="font-medium text-slate-200 text-xs truncate">S. Rao</div>
              <div className="text-[11px] text-slate-400 font-mono">Dispatch Lead</div>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-emerald-400 border border-slate-700">
              Shift A
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={onOpenSettings}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 transition-colors text-[11px]"
              title="System Settings"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Settings</span>
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-red-400 transition-colors"
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

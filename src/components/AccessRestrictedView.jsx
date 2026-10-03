import React from 'react'
import {
  ShieldAlert,
  Lock,
  ArrowRight,
  RotateCcw,
  UserCheck,
  AlertTriangle,
  KeyRound,
  Building2,
  Ambulance,
  Shield,
  Activity,
  CreditCard,
  Smartphone,
  ChevronRight
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'
import { DEPARTMENT_ROLES, DEPARTMENT_DESKS } from '../data/rolesConfig'

export default function AccessRestrictedView({ targetView, authCheck }) {
  const {
    userRole,
    setUserRole,
    setActiveView
  } = useEmergencyStore()

  const currentRoleObj = DEPARTMENT_ROLES.find(r => r.id === userRole) || DEPARTMENT_ROLES[0]
  const targetDeskObj = DEPARTMENT_DESKS[targetView] || {
    name: targetView.toUpperCase() + ' DESK',
    shortName: targetView,
    ownerDepartment: 'Restricted Agency Desk'
  }

  const handleReturnToMyDesk = () => {
    setActiveView(currentRoleObj.primaryDesk)
  }

  const handleSwitchToAuthorizedRole = () => {
    const requiredRole = targetDeskObj.authorizedRoles?.[0] || 'dispatcher'
    setUserRole(requiredRole)
    setActiveView(targetView)
  }

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-red-900/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Subtle security background watermark */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-red-600/5 rounded-full blur-2xl pointer-events-none" />

        {/* Security Alert Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-red-950 border border-red-700/80 flex items-center justify-center text-red-400 shrink-0 shadow-lg shadow-red-950/40">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-red-950 border border-red-800 text-red-300 font-mono text-[10px] font-bold tracking-wider">
                  CAD SECURITY RULE: ACCESS BLOCKED
                </span>
                <span className="font-mono text-xs text-slate-400">
                  CODE 403 · DESK ISOLATION
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 mt-1">
                {authCheck?.reason || `${currentRoleObj.shortName} cannot access ${targetDeskObj.shortName}`}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Inter-agency authorization barrier enforced by ResQVision Dispatch Protocol.
              </p>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-right shrink-0">
            <span className="text-[10px] text-slate-400 block uppercase">Protocol</span>
            <span className="text-red-400 font-bold">SOP-802 · RBAC</span>
          </div>
        </div>

        {/* Terminal Comparison Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          {/* Your Credentials */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] uppercase font-bold">Your Active Terminal Badge</span>
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="font-bold text-slate-200 text-sm">
              {currentRoleObj.name}
            </div>
            <div className="text-[11px] text-slate-400">
              Agency: {currentRoleObj.department}
            </div>
            <div className="px-2 py-0.5 rounded bg-slate-900 border border-slate-750 text-slate-300 text-[10px] inline-block">
              Badge ID: {currentRoleObj.badgeId}
            </div>
          </div>

          {/* Requested Resource */}
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/60 space-y-2">
            <div className="flex items-center justify-between text-red-400">
              <span className="text-[10px] uppercase font-bold">Requested Desk Console</span>
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="font-bold text-red-200 text-sm">
              {targetDeskObj.name}
            </div>
            <div className="text-[11px] text-slate-400">
              Owner: {targetDeskObj.ownerDepartment}
            </div>
            <div className="px-2 py-0.5 rounded bg-red-950 border border-red-800 text-red-300 text-[10px] inline-block">
              Clearance: RESTRICTED
            </div>
          </div>
        </div>

        {/* Security Rationale & Explanation */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
          <div className="font-semibold text-slate-300 uppercase tracking-wider font-mono text-[11px] flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Operational Separation of Duties Rationale</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            {authCheck?.details || targetDeskObj.restrictionMessage}
          </p>
          <div className="pt-1 text-[10px] text-slate-400 font-mono">
            • Under statutory guidelines, each emergency agency operates within their exclusive command console to prevent cross-channel tampering and protect sensitive evidence and medical data.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            onClick={handleReturnToMyDesk}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-950/40 cursor-pointer"
          >
            <span>Return to My Desk ({currentRoleObj.shortName})</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleSwitchToAuthorizedRole}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Switch to {targetDeskObj.shortName} Login</span>
          </button>
        </div>

        {/* Audit Log Footer */}
        <div className="text-[10px] font-mono text-slate-400 pt-1 flex items-center justify-between border-t border-slate-850">
          <span>Security Barrier Logged · CAD Terminal Intercept</span>
          <span className="text-emerald-400">STATUS: REJECTION VERIFIED</span>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import {
  ShieldAlert,
  Lock,
  ArrowRight,
  AlertTriangle,
  KeyRound
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
    <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4">
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Security Alert Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-mono text-[10px] font-bold tracking-wider">
                  SECURITY BARRIER: DESK ISOLATION
                </span>
                <span className="font-mono text-xs text-slate-500">
                  CODE 403 · ACCESS RESTRICTED
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
                {authCheck?.reason || `${currentRoleObj.shortName} cannot access ${targetDeskObj.shortName}`}
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                Statutory separation of duties enforced under ResQVision Emergency Protocol.
              </p>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-right shrink-0">
            <span className="text-[10px] text-slate-500 block uppercase">Protocol</span>
            <span className="text-slate-800 font-semibold">SOP-802 · RBAC</span>
          </div>
        </div>

        {/* Terminal Comparison Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          {/* Your Credentials */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-[10px] uppercase font-bold font-sans">Your Active Badge</span>
              <Lock className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="font-bold text-slate-900 text-sm">
              {currentRoleObj.name}
            </div>
            <div className="text-xs text-slate-600 font-sans">
              Agency: {currentRoleObj.department}
            </div>
            <div className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-xs inline-block">
              Badge: {currentRoleObj.badgeId}
            </div>
          </div>

          {/* Requested Resource */}
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2">
            <div className="flex items-center justify-between text-amber-800">
              <span className="text-[10px] uppercase font-bold font-sans">Target Agency Desk</span>
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
            </div>
            <div className="font-bold text-slate-900 text-sm">
              {targetDeskObj.name}
            </div>
            <div className="text-xs text-slate-600 font-sans">
              Owner: {targetDeskObj.ownerDepartment}
            </div>
            <div className="px-2 py-0.5 rounded bg-white border border-amber-200 text-amber-800 text-xs inline-block">
              Clearance: RESTRICTED
            </div>
          </div>
        </div>

        {/* Security Rationale & Explanation */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="font-semibold text-slate-800 uppercase tracking-wider font-mono text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Separation of Duties Rationale</span>
          </div>
          <p className="text-slate-600 leading-relaxed text-xs">
            {authCheck?.details || targetDeskObj.restrictionMessage}
          </p>
          <div className="pt-1 text-[11px] text-slate-500">
            • Under statutory emergency guidelines, each agency operates within their exclusive terminal to protect sensitive patient medical data, criminal evidence chains, and prevent inter-agency command collisions.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            onClick={handleReturnToMyDesk}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
          >
            <span>Return to My Desk ({currentRoleObj.shortName})</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleSwitchToAuthorizedRole}
            className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <KeyRound className="w-3.5 h-3.5 text-slate-500" />
            <span>Switch to {targetDeskObj.shortName} Role</span>
          </button>
        </div>

        {/* Audit Log Footer */}
        <div className="text-[11px] font-mono text-slate-500 pt-1 flex items-center justify-between border-t border-slate-100">
          <span>Security Event Logged · Terminal Boundary Intercept</span>
          <span className="text-slate-700 font-semibold">STATUS: BLOCKED</span>
        </div>
      </div>
    </div>
  )
}

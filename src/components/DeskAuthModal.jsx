import React, { useState } from 'react'
import {
  Lock,
  X,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { DEPARTMENT_ROLES } from '../data/rolesConfig'
import { useEmergencyStore } from '../store/emergencyStore'
import { OFFICIAL_CREDENTIALS, authenticateRole } from '../utils/authService'

export default function DeskAuthModal({ isOpen, onClose, targetRole = null }) {
  const { setUserRole } = useEmergencyStore()

  const [selectedRole, setSelectedRole] = useState(targetRole || 'ambulance')
  const [badgeId, setBadgeId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  if (!isOpen) return null

  const roleMeta = DEPARTMENT_ROLES.find(r => r.id === selectedRole) || DEPARTMENT_ROLES[0]
  const creds = OFFICIAL_CREDENTIALS.find(c => c.role === selectedRole)

  const handleQuickDemoFill = () => {
    if (creds) {
      setBadgeId(creds.badgeId)
      setPassword(creds.samplePass)
      setErrorMessage('')
    }
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    const res = await authenticateRole(selectedRole, badgeId, password, false)
    setLoading(false)

    if (res.success) {
      setSuccessMessage(`Authenticated as ${res.user.name} (${res.user.badgeId})`)
      setUserRole(selectedRole)
      setTimeout(() => {
        onClose()
      }, 700)
    } else {
      setErrorMessage(res.error || 'Authentication rejected. Verify badge ID or password.')
    }
  }

  const handleQuickAuthorize = async (roleId) => {
    setSelectedRole(roleId)
    setLoading(true)
    const res = await authenticateRole(roleId, null, null, true)
    setLoading(false)

    if (res.success) {
      setUserRole(roleId)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <Lock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Department Desk Authentication
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                ZERO-TRUST MULTI-AGENCY PROTOCOL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
            aria-label="Close authentication modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info banner */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="leading-snug">
            Each emergency desk requires role credentials. The server verifies token integrity, enforces rate limits, and issues an ephemeral signed session.
          </div>
        </div>

        {/* Error / Success Display */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Role selector */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              Department Terminal Desk:
            </label>
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value)
                setBadgeId('')
                setPassword('')
                setErrorMessage('')
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-hidden focus:border-blue-600 focus:bg-white"
            >
              {DEPARTMENT_ROLES.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} — {r.department}
                </option>
              ))}
            </select>
          </div>

          {/* Badge ID Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 block">
                Official Department Badge ID:
              </label>
              <button
                type="button"
                onClick={handleQuickDemoFill}
                className="text-[11px] text-blue-600 hover:text-blue-700 underline font-medium cursor-pointer"
              >
                Auto-fill Sample
              </button>
            </div>
            <input
              type="text"
              value={badgeId}
              onChange={(e) => setBadgeId(e.target.value)}
              placeholder={creds?.badgeId || 'e.g. EMS-KA01-07'}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-hidden focus:border-blue-600 focus:bg-white"
            />
          </div>

          {/* Passcode Input */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              Security Clearance Passcode:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-hidden focus:border-blue-600 focus:bg-white"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => handleQuickAuthorize(selectedRole)}
              className="px-3.5 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="One-click demo credentials authorization"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Demo Quick-Auth</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer flex items-center gap-2"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{loading ? 'Authenticating...' : 'Sign In to Desk'}</span>
            </button>
          </div>
        </form>

        {/* Quick Role Switcher Chips for Evaluators */}
        <div className="pt-3 border-t border-slate-100 space-y-1.5">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
            Evaluator Fast Desk Switcher:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {DEPARTMENT_ROLES.map(role => (
              <button
                key={role.id}
                onClick={() => handleQuickAuthorize(role.id)}
                className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors cursor-pointer ${
                  selectedRole === role.id
                    ? 'bg-blue-600 border-blue-600 text-white font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {role.shortName}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

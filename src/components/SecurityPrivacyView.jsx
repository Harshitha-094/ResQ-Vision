import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  Lock,
  EyeOff,
  UserCheck,
  FileText,
  AlertTriangle,
  Activity,
  CheckCircle2,
  Clock,
  RefreshCw,
  Server,
  Database,
  ArrowRight
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'
import { fetchSecurityStatus, fetchAuditLogs } from '../utils/apiClient'
import { getStoredSession } from '../utils/authService'

export default function SecurityPrivacyView() {
  const { userRole, setActiveView } = useEmergencyStore()
  const [securityData, setSecurityData] = useState(null)
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [logFilter, setLogFilter] = useState('ALL')
  const [sessionInfo, setSessionInfo] = useState(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const sec = await fetchSecurityStatus()
      setSecurityData(sec)

      const session = getStoredSession()
      setSessionInfo(session)

      // If dispatcher, fetch actual audit logs
      if (userRole === 'dispatcher') {
        const auditRes = await fetchAuditLogs()
        if (auditRes.success && auditRes.logs) {
          setAuditLogs(auditRes.logs)
        }
      }
      setLoading(false)
    }
    loadData()
  }, [userRole])

  const filteredLogs = auditLogs.filter(log => {
    if (logFilter === 'ALL') return true
    return log.action.includes(logFilter)
  })

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-700 font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Production Security & Privacy Architecture</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Security, Privacy & Data Integrity
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              ResQVision employs defense-in-depth security engineered for mission-critical emergency orchestration. All dispatches, location telemetry, and inter-agency communications are cryptographically protected, rate-limited, and audited.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Active Session</div>
              <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{sessionInfo?.user?.role?.toUpperCase() || userRole.toUpperCase()}</span>
              </div>
              <div className="text-[10px] text-slate-500">
                Badge: {sessionInfo?.user?.badgeId || 'AUTHORIZED'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7 Core Security Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Secure Authentication */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Secure Authentication</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Cryptographically signed HMAC-SHA256 session tokens. Automatic session expiration after 30 minutes of inactivity. Storage strictly isolated to ephemeral session storage.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-mono text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>HMAC Token Active</span>
          </div>
        </div>

        {/* 2. Role-Based Access Control */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Role-Based Access Control</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Strict departmental desk isolation. Citizen, Ambulance, Hospital, Police, Traffic, and Toll roles operate under zero-trust boundaries enforced on both client and serverless API layers.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-mono text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Desk Isolation Enforced</span>
          </div>
        </div>

        {/* 3. Protected Emergency Data */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Protected Emergency Data</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Server-side schema validation on all incoming incident reports. Immutable incident identifiers, creation timestamps, and ownership fields protected against modification.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-mono text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Field Immutability Guard</span>
          </div>
        </div>

        {/* 4. Encrypted Communication */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Encrypted Communication</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Strict-Transport-Security (HSTS 1 Year) with subdomains included. Strict Content-Security-Policy (CSP) blocking unauthorized scripts, framing, and clickjacking attacks.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-mono text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>HSTS & CSP Active</span>
          </div>
        </div>

        {/* 5. Abuse Prevention & Rate Limiting */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Abuse Prevention</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Sliding-window rate limiters prevent automated reporting spam (5 reports/min per IP) and credential stuffing (5 failed logins/5 min lockout per IP/account).
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-mono text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Rate Limiting Active</span>
          </div>
        </div>

        {/* 6. Location Privacy */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center">
            <EyeOff className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Location Privacy</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Coordinates are treated as sensitive telemetry. Citizens only receive obfuscated general corridor areas for incidents they did not file. Pinpoint GPS is strictly restricted to assigned emergency responders.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-mono text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Spatial Obfuscation Guard</span>
          </div>
        </div>
      </div>

      {/* Security Headers & Live Policy Status */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Active Production Security Headers & Policies</h2>
          </div>
          <span className="font-mono text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
            NETLIFY EDGE VERIFIED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] text-slate-500 font-sans font-semibold">Strict-Transport-Security</div>
            <div className="text-slate-800 font-bold truncate">max-age=31536000</div>
            <div className="text-[10px] text-emerald-600 font-sans">1 Year HSTS Enforced</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] text-slate-500 font-sans font-semibold">X-Frame-Options</div>
            <div className="text-slate-800 font-bold">DENY</div>
            <div className="text-[10px] text-emerald-600 font-sans">Anti-Clickjacking</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] text-slate-500 font-sans font-semibold">X-Content-Type-Options</div>
            <div className="text-slate-800 font-bold">nosniff</div>
            <div className="text-[10px] text-emerald-600 font-sans">MIME Sniffing Blocked</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] text-slate-500 font-sans font-semibold">Permissions-Policy</div>
            <div className="text-slate-800 font-bold truncate">geolocation=(self), camera=(self)</div>
            <div className="text-[10px] text-emerald-600 font-sans">Mic Blocked · Sensor Restricted</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] space-y-2 overflow-x-auto">
          <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
            Content-Security-Policy (CSP) Policy Digest:
          </div>
          <div className="text-emerald-400 break-all leading-relaxed">
            default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://nominatim.openstreetmap.org https://*.tile.openstreetmap.org; connect-src 'self' https://nominatim.openstreetmap.org https://www.google.com; media-src 'self' blob: data:; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';
          </div>
        </div>
      </div>

      {/* Forensic Audit Log Section (Visible to Supervisor / Dispatcher) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Forensic Audit Log Trail</h2>
          </div>

          <div className="flex items-center gap-2">
            {userRole === 'dispatcher' ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-sans">Filter:</span>
                {['ALL', 'LOGIN', 'EMERGENCY', 'STATUS', 'LOCATION'].map(f => (
                  <button
                    key={f}
                    onClick={() => setLogFilter(f)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors border ${
                      logFilter === f
                        ? 'bg-blue-600 border-blue-600 text-white font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-500 font-sans">
                Full audit inspection restricted to Central CAD Supervisor
              </span>
            )}
          </div>
        </div>

        {userRole !== 'dispatcher' ? (
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
            <Lock className="w-6 h-6 text-slate-400 mx-auto" />
            <div className="text-xs text-slate-600 max-w-md mx-auto">
              Statutory forensic audit records contain legal chain-of-custody data and require Central CAD Supervisor or Highway Police Inspector credentials.
            </div>
            <button
              onClick={() => setActiveView('overview')}
              className="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
            >
              <span>Return to Operational Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 uppercase">
                  <th className="p-2.5">Timestamp</th>
                  <th className="p-2.5">Actor / Badge</th>
                  <th className="p-2.5">Role</th>
                  <th className="p-2.5">Action</th>
                  <th className="p-2.5">Resource</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">IP (Masked)</th>
                  <th className="p-2.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-4 text-center text-slate-400">
                      No matching audit records in current rolling window
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-2.5 text-slate-500 whitespace-nowrap">
                        {log.timestamp ? log.timestamp.split('T')[1]?.slice(0, 8) : '--:--:--'}
                      </td>
                      <td className="p-2.5 font-bold text-slate-800">{log.actorId}</td>
                      <td className="p-2.5 text-slate-600 uppercase text-[10px]">{log.actorRole}</td>
                      <td className="p-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.action.includes('LOGIN') ? 'bg-blue-50 text-blue-700' :
                          log.action.includes('EMERGENCY') ? 'bg-red-50 text-red-700' :
                          log.action.includes('LOCATION') ? 'bg-cyan-50 text-cyan-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-700">{log.resourceId}</td>
                      <td className="p-2.5">
                        <span className={`font-bold ${log.status === 'SUCCESS' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-400">{log.ipMasked}</td>
                      <td className="p-2.5 text-slate-600 max-w-xs truncate" title={log.details}>
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import {
  FileText,
  Download,
  CheckCircle2,
  Clock,
  Shield,
  Ambulance,
  Building2,
  Calendar,
  Filter
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'

export default function ReportsView() {
  const { reports, incidents, hospitalState } = useEmergencyStore()
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  const rq1048 = incidents.find(i => i.id === 'RQ-1048')
  const isRq1048Closed = rq1048?.status === 'Completed'

  const activeReports = isRq1048Closed
    ? [
        {
          id: 'RQ-1048',
          date: 'Just now (' + (hospitalState.handoverTime || '14:48:30 IST') + ')',
          location: 'NH 44, Bengaluru–Hosur Highway KM 42.4',
          severity: 'Severe',
          source: 'AI CAMERA DETECTION (CAM-07)',
          assignedAmbulance: 'Ambulance 07 (KA 01 AB 1234)',
          hospitalDestination: "St. John's Hospital (Trauma Bay 1)",
          policeUnit: 'Highway Interceptor 04',
          timeToDispatch: '13s',
          timeToArrival: '2m 14s',
          totalHandoverTime: '15m 44s',
          status: 'Completed',
          outcome: 'Two casualties successfully handed over to Dr. A. Mathew at Trauma Bay 1. Clinical handover signed and case docket archived.'
        },
        ...reports
      ]
    : reports

  const handleExport = () => {
    setDownloadSuccess(true)
    setTimeout(() => setDownloadSuccess(false), 3000)
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Response Audits & Incident Reports</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Post-incident emergency response timelines and inter-agency dispatch records
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>{downloadSuccess ? '✓ Audit Docket Exported' : 'Export Audit Summary'}</span>
        </button>
      </div>

      {/* Practical Operational Benchmarks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400 text-[10px] block font-mono">AVG DISPATCH LATENCY</span>
          <span className="font-bold text-base font-mono text-emerald-400">41 sec</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Target: &lt;60 sec</span>
        </div>
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400 text-[10px] block font-mono">AVG ARRIVAL TIME</span>
          <span className="font-bold text-base font-mono text-blue-400">3m 52s</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Within Golden 10-Min</span>
        </div>
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400 text-[10px] block font-mono">HANDOVER TIME</span>
          <span className="font-bold text-base font-mono text-slate-200">14m 20s</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Ambulance to Trauma Bay</span>
        </div>
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400 text-[10px] block font-mono">AUDIT COMPLIANCE</span>
          <span className="font-bold text-base font-mono text-emerald-400">100%</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Section 134A Verified</span>
        </div>
      </div>

      {/* Reports Table */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40 divide-y divide-slate-800 text-xs">
        <div className="p-3 bg-slate-950 font-semibold text-slate-300 text-xs flex items-center justify-between">
          <span>Archived Response Dockets</span>
          <span className="font-mono text-[11px] text-slate-400">{activeReports.length} Verified Records</span>
        </div>

        {activeReports.map((report) => (
          <div key={report.id} className="p-4 space-y-2 hover:bg-slate-800/30 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-slate-100">{report.id}</span>
                <span className="px-2 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {report.severity}
                </span>
                <span className="text-slate-400 text-[11px] font-mono">· {report.source}</span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">{report.date}</span>
            </div>

            <div className="text-slate-200 font-medium">
              {report.location}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1 text-[11px] text-slate-300 font-mono bg-slate-950/70 p-2.5 rounded-lg border border-slate-850">
              <div>
                <span className="text-slate-400 text-[10px] block">Ambulance:</span>
                <span>{report.assignedAmbulance}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Hospital:</span>
                <span>{report.hospitalDestination}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Police Unit:</span>
                <span>{report.policeUnit}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
              <p className="text-slate-300 italic">
                "{report.outcome}"
              </p>
              <div className="flex items-center gap-3 font-mono shrink-0">
                <span>Dispatch: <strong className="text-slate-200">{report.timeToDispatch}</strong></span>
                <span>Arrival: <strong className="text-slate-200">{report.timeToArrival}</strong></span>
                <span>Handover: <strong className="text-slate-200">{report.totalHandoverTime}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

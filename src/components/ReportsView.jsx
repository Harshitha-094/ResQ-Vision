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
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Response Audits & Incident Reports</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Post-incident emergency response timelines and inter-agency dispatch records
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-white" />
          <span>{downloadSuccess ? '✓ Audit Docket Exported' : 'Export Audit Summary'}</span>
        </button>
      </div>

      {/* Practical Operational Benchmarks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 text-[10px] block font-mono font-semibold uppercase">AVG DISPATCH LATENCY</span>
          <span className="font-bold text-lg font-mono text-emerald-700">41 sec</span>
          <span className="text-[11px] text-slate-500 block">Target: &lt;60 sec</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 text-[10px] block font-mono font-semibold uppercase">AVG ARRIVAL TIME</span>
          <span className="font-bold text-lg font-mono text-blue-700">3m 52s</span>
          <span className="text-[11px] text-slate-500 block">Within Golden 10-Min</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 text-[10px] block font-mono font-semibold uppercase">HANDOVER TIME</span>
          <span className="font-bold text-lg font-mono text-slate-900">14m 20s</span>
          <span className="text-[11px] text-slate-500 block">Ambulance to Trauma Bay</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 text-[10px] block font-mono font-semibold uppercase">AUDIT COMPLIANCE</span>
          <span className="font-bold text-lg font-mono text-emerald-700">100%</span>
          <span className="text-[11px] text-slate-500 block">Section 134A Verified</span>
        </div>
      </div>

      {/* Reports Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs divide-y divide-slate-100 text-xs">
        <div className="p-3.5 bg-slate-50 font-semibold text-slate-800 text-xs flex items-center justify-between border-b border-slate-200">
          <span>Archived Response Dockets</span>
          <span className="font-mono text-xs text-slate-500 font-normal">{activeReports.length} Verified Records</span>
        </div>

        {activeReports.map((report) => (
          <div key={report.id} className="p-5 space-y-3 hover:bg-slate-50/60 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-sm text-slate-900">{report.id}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  report.severity === 'Severe'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : report.severity === 'Moderate'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {report.severity}
                </span>
                <span className="text-slate-500 text-xs font-mono">· {report.source}</span>
              </div>
              <span className="text-slate-500 font-mono text-xs">{report.date}</span>
            </div>

            <div className="text-slate-800 font-medium text-xs">
              {report.location}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 py-1 text-xs text-slate-700 font-mono bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 text-[10px] block font-sans font-semibold uppercase">Ambulance</span>
                <span className="font-medium">{report.assignedAmbulance}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block font-sans font-semibold uppercase">Hospital</span>
                <span className="font-medium">{report.hospitalDestination}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block font-sans font-semibold uppercase">Police Unit</span>
                <span className="font-medium">{report.policeUnit}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs text-slate-500">
              <p className="text-slate-600 italic">
                "{report.outcome}"
              </p>
              <div className="flex items-center gap-3 font-mono shrink-0 text-xs">
                <span>Dispatch: <strong className="text-slate-800">{report.timeToDispatch}</strong></span>
                <span>Arrival: <strong className="text-slate-800">{report.timeToArrival}</strong></span>
                <span>Handover: <strong className="text-slate-800">{report.totalHandoverTime}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import {
  ChevronUp,
  ChevronDown,
  Terminal,
  Trash2,
  Copy,
  Check,
  Download,
  Filter,
  Radio,
  Server,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'
import { playButtonClick } from '../utils/audio'

export default function OutboundDrawer() {
  const {
    simulatedLogs,
    clearLogs,
    outboundDrawerOpen,
    setOutboundDrawerOpen,
    soundEnabled,
  } = useEmergencyStore()

  const [activeChannelFilter, setActiveChannelFilter] = useState('ALL')
  const [copied, setCopied] = useState(false)

  const toggleDrawer = () => {
    if (soundEnabled) playButtonClick()
    setOutboundDrawerOpen(!outboundDrawerOpen)
  }

  const channels = ['ALL', 'SMS', 'ERSS', 'MQTT', 'C-V2X', 'FHIR/HL7']

  const filteredLogs = simulatedLogs.filter((log) => {
    if (activeChannelFilter === 'ALL') return true
    if (activeChannelFilter === 'SMS') return log.channel.includes('SMS')
    if (activeChannelFilter === 'ERSS') return log.channel.includes('ERSS')
    if (activeChannelFilter === 'MQTT') return log.channel.includes('MQTT')
    if (activeChannelFilter === 'C-V2X') return log.channel.includes('C-V2X')
    if (activeChannelFilter === 'FHIR/HL7') return log.channel.includes('FHIR') || log.channel.includes('HL7')
    return true
  })

  const handleCopyLogs = () => {
    if (soundEnabled) playButtonClick()
    const text = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.channel}]: ${l.message}\nPayload: ${JSON.stringify(l.rawPayload, null, 2)}`)
      .join('\n\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportJson = () => {
    if (soundEnabled) playButtonClick()
    const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resq-vision-telemetry-logs-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <aside
      aria-label="Simulated Outbound Communications & Hardware Feeds"
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-t border-slate-800 bg-slate-950/98 backdrop-blur-xl shadow-2xl ${
        outboundDrawerOpen ? 'h-96' : 'h-11'
      }`}
    >
      {/* Header Bar / Handle Button */}
      <div
        onClick={toggleDrawer}
        className="h-11 px-4 flex items-center justify-between cursor-pointer bg-slate-900/90 hover:bg-slate-850 select-none text-xs font-mono border-b border-slate-800/80"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-slate-200">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="tracking-wide">
              Simulated Outbound Communications & Hardware Feeds
            </span>
          </div>

          <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-[10px] text-cyan-300 font-bold">
            {simulatedLogs.length} EVENTS LOGGED
          </span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            SMS (108 EMRI) • ERSS 112 Police CAD • MQTT Telemetry • C-V2X V2I • FHIR HL7
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400 font-medium">
            {outboundDrawerOpen ? 'COLLAPSE DRAWER' : 'EXPAND FEED'}
          </span>
          <div className="p-1 rounded bg-slate-800 text-slate-300">
            {outboundDrawerOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Content Viewport */}
      {outboundDrawerOpen && (
        <div className="h-[calc(100%-2.75rem)] flex flex-col p-3 space-y-2">
          {/* Action and Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80 text-xs font-mono">
            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              <span className="text-slate-500 text-[11px] mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              {channels.map((ch) => (
                <button
                  key={ch}
                  onClick={() => setActiveChannelFilter(ch)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                    activeChannelFilter === ch
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>

            {/* Utility Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLogs}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                title="Copy formatted logs to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>

              <button
                onClick={handleExportJson}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                title="Export as JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>

              <button
                onClick={clearLogs}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-800 text-slate-400 hover:text-red-300 flex items-center gap-1.5 transition-colors"
                title="Clear telemetry logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>CLEAR</span>
              </button>
            </div>
          </div>

          {/* Formatted Log Stream */}
          <div className="flex-1 overflow-y-auto font-mono text-[11.5px] space-y-2 pr-1">
            {filteredLogs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 italic">
                No logs recorded for channel filter "{activeChannelFilter}".
              </div>
            ) : (
              filteredLogs.map((log) => {
                const isCritical = log.level === 'critical'
                const isWarning = log.level === 'warning'
                const isSuccess = log.level === 'success'

                return (
                  <div
                    key={log.id}
                    className={`p-2.5 rounded-lg border leading-relaxed transition-all ${
                      isCritical
                        ? 'bg-red-950/20 border-red-800/80 text-red-200'
                        : isWarning
                        ? 'bg-amber-950/20 border-amber-800/70 text-amber-200'
                        : isSuccess
                        ? 'bg-emerald-950/20 border-emerald-800/70 text-emerald-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-semibold">{log.timestamp}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                            isCritical
                              ? 'bg-red-600 text-white'
                              : isWarning
                              ? 'bg-amber-600 text-slate-950'
                              : isSuccess
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 text-cyan-300'
                          }`}
                        >
                          {log.channel}
                        </span>
                        <strong className="text-white font-bold">{log.title}</strong>
                      </div>

                      <span className="text-[10px] text-slate-500 uppercase">
                        LEVEL: {log.level.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-slate-300 text-[11px] pl-2 border-l-2 border-slate-700/80">
                      {log.message}
                    </p>

                    {/* Raw payload collapsible / JSON preview */}
                    {log.rawPayload && (
                      <div className="mt-1.5 p-1.5 bg-black/60 rounded border border-slate-850 text-[10px] text-slate-400 overflow-x-auto">
                        <span className="text-cyan-400 font-bold block mb-0.5">PAYLOAD:</span>
                        <pre className="whitespace-pre-wrap font-mono">
                          {JSON.stringify(log.rawPayload, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </aside>
  )
}

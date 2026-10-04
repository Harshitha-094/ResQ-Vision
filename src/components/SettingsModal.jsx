import React from 'react'
import { Settings, X, Volume2, VolumeX, Shield, Bell, RefreshCw } from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'

export default function SettingsModal({ isOpen, onClose }) {
  const { soundEnabled, toggleSound } = useEmergencyStore()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
      <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Dispatch System Settings</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {/* Audio Alerts */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-800">Emergency Audio Alerts</span>
              <p className="text-[11px] text-slate-500">Play radio squelch and critical tones on new alerts</p>
            </div>
            <button
              onClick={toggleSound}
              className={`p-2 rounded-lg border transition-colors cursor-pointer shadow-2xs ${
                soundEnabled
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-slate-300 text-slate-400 hover:text-slate-700'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Active Terminal Info */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 font-mono text-xs">
            <div className="text-slate-500 uppercase text-[10px] font-semibold">Security & Node Telemetry</div>
            <div className="text-slate-700">Terminal: Bengaluru Central Emergency Command</div>
            <div className="text-slate-700">Transport: HSTS 1-Year · TLS 1.3 · CSP Active</div>
            <div className="text-slate-700">RBAC: Multi-Agency Zero-Trust Isolation</div>
            <div className="text-slate-700">Audit Trail: Forensic Logging with 30-Day Rolling Window</div>
          </div>

          {/* Quick link to Security & Privacy view */}
          <button
            onClick={() => {
              useEmergencyStore.getState().setActiveView('security')
              onClose()
            }}
            className="w-full py-2.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
          >
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Open Security & Privacy Dashboard</span>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

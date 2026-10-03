import React from 'react'
import { Settings, X, Volume2, VolumeX, Shield, Bell, RefreshCw } from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'

export default function SettingsModal({ isOpen, onClose }) {
  const { soundEnabled, toggleSound } = useEmergencyStore()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-4 sm:p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-100">Dispatch System Settings</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {/* Audio Alerts */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-200">Emergency Audio Alerts</span>
              <p className="text-[11px] text-slate-400">Play radio squelch and critical tones on new alerts</p>
            </div>
            <button
              onClick={toggleSound}
              className={`p-2 rounded-lg border transition-colors ${
                soundEnabled
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Active Terminal Info */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-[11px]">
            <div className="text-slate-400 uppercase text-[10px]">Node Telemetry</div>
            <div className="text-slate-300">Terminal: Bengaluru Central Emergency Command</div>
            <div className="text-slate-300">Protocol: National Highway Inter-Agency Grid v2.4</div>
            <div className="text-slate-300">Authorized Channels: Ambulance, Hospital, Police, Traffic, Toll</div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

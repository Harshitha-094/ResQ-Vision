import React from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'

export default function ConfirmModal() {
  const { confirmModal, closeConfirmModal } = useEmergencyStore()

  if (!confirmModal.isOpen) return null

  const handleConfirm = () => {
    if (confirmModal.onConfirm) {
      confirmModal.onConfirm()
    }
    closeConfirmModal()
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-sm w-full p-4 sm:p-5 shadow-2xl space-y-4">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
            confirmModal.isDestructive
              ? 'bg-red-950 text-red-400 border border-red-800'
              : 'bg-amber-950 text-amber-400 border border-amber-800'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-100">
              {confirmModal.title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {confirmModal.message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800 text-xs">
          <button
            onClick={closeConfirmModal}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
          >
            {confirmModal.cancelLabel || 'Cancel'}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              confirmModal.isDestructive
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {confirmModal.confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

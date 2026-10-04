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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
      <div className="bg-white border border-slate-200 rounded-xl max-w-sm w-full p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-start gap-3.5">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            confirmModal.isDestructive
              ? 'bg-red-50 text-red-600 border border-red-200'
              : 'bg-amber-50 text-amber-600 border border-amber-200'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">
              {confirmModal.title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {confirmModal.message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
          <button
            onClick={closeConfirmModal}
            className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium border border-slate-300 shadow-2xs transition-colors cursor-pointer"
          >
            {confirmModal.cancelLabel || 'Cancel'}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-lg font-semibold text-white shadow-2xs transition-colors cursor-pointer ${
              confirmModal.isDestructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmModal.confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

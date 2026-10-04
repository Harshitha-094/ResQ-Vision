import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ResQ-Vision Runtime Catch:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">System Safe Mode Activated</h2>
            <p className="text-xs text-slate-500">
              An unexpected render issue was safely intercepted:
            </p>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 text-left overflow-x-auto space-y-1">
              <div className="font-semibold text-red-600">
                {this.state.error?.name || 'Error'}: {this.state.error?.message || 'Operational runtime error'}
              </div>
              <div className="text-[10px] text-slate-500">
                Central dispatch intercepted this component exception to prevent unhandled app termination.
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  window.location.reload()
                }}
                className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Emergency Console</span>
              </button>
              <button
                onClick={() => {
                  sessionStorage.clear()
                  localStorage.clear()
                  window.location.reload()
                }}
                className="w-full py-2 px-4 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
              >
                Clear Cache & Hard Reset
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

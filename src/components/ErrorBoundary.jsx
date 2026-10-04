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
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 text-left overflow-x-auto">
              {import.meta.env.PROD
                ? 'An operational error occurred while processing the request. Central dispatch has logged this event.'
                : (this.state.error?.message || 'Operational runtime error')}
            </div>
            <button
              onClick={() => {
                sessionStorage.clear()
                window.location.reload()
              }}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Emergency Console</span>
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

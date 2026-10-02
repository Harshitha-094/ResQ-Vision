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
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-red-500/50 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-950/80 border border-red-500 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-white">System Safe Mode Activated</h2>
            <p className="text-xs text-slate-400 font-mono">
              An unexpected render issue was safely intercepted:
            </p>
            <div className="p-3 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-red-300 text-left overflow-x-auto">
              {this.state.error?.message || 'Unknown runtime error'}
            </div>
            <button
              onClick={() => {
                localStorage.clear()
                window.location.reload()
              }}
              className="w-full min-h-[48px] py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
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

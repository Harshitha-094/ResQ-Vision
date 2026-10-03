import React from 'react'
import { Clock } from 'lucide-react'

export default function ResponseTimer({ seconds = 134, targetSeconds = 180, label = 'Target arrival' }) {
  const isExceeded = seconds <= 0
  const isAtRisk = seconds > 0 && seconds < 60

  const absSec = Math.abs(seconds)
  const mins = Math.floor(absSec / 60)
  const secs = absSec % 60
  const timeFormatted = `${seconds < 0 ? '+' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  // State calculation:
  // >= 60s: within target (calm/neutral)
  // 1s - 59s: response at risk (warning/amber)
  // <= 0s: target exceeded (severe/red)
  let statusText = 'Within target'
  let colorClasses = 'text-slate-200 bg-slate-900 border-slate-700'
  let badgeClasses = 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60'

  if (isExceeded) {
    statusText = 'Target exceeded'
    colorClasses = 'text-red-300 bg-red-950/30 border-red-900/60'
    badgeClasses = 'text-red-400 bg-red-950/80 border-red-800 font-bold'
  } else if (isAtRisk) {
    statusText = 'Response at risk'
    colorClasses = 'text-amber-300 bg-amber-950/30 border-amber-900/60'
    badgeClasses = 'text-amber-400 bg-amber-950/80 border-amber-800 font-semibold'
  }

  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded border text-xs font-mono ${colorClasses}`}>
      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <span className="text-slate-400 font-sans text-[11px]">{label}:</span>
      <span className="font-bold text-sm tracking-tight">{timeFormatted}</span>
      <span className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-medium border ${badgeClasses}`}>
        {statusText}
      </span>
    </div>
  )
}

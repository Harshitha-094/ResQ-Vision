import React from 'react'
import { BookOpen, Sparkles, HelpCircle } from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'

export default function FloatingGuidesButton() {
  const { openUserGuides, activeView, userGuidesOpen } = useEmergencyStore()

  if (userGuidesOpen) return null

  // Map current view to the most relevant guide topic
  const getTopicForView = () => {
    switch (activeView) {
      case 'citizen':
        return 'citizen'
      case 'ambulances':
        return 'ambulance'
      case 'hospitals':
        return 'hospital'
      case 'police':
        return 'police'
      case 'traffic':
        return 'traffic'
      case 'toll':
        return 'toll'
      default:
        return 'citizen'
    }
  }

  const handleOpenGuide = () => {
    openUserGuides(getTopicForView())
  }

  return (
    <aside
      aria-label="User guides quick help"
      className="fixed bottom-5 right-5 z-40 print:hidden flex items-center"
    >
      <button
        onClick={handleOpenGuide}
        className="group relative pl-3.5 pr-4 py-2.5 rounded-full bg-slate-900/95 hover:bg-slate-850 text-slate-100 font-semibold text-xs border border-red-500/40 hover:border-red-500 shadow-xl shadow-red-950/40 backdrop-blur-md flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="Open Interactive User Guides & Step-by-Step SOPs"
      >
        <div className="relative flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-red-500 absolute -top-0.5 -right-0.5 animate-ping" />
          <span className="w-2 h-2 rounded-full bg-red-500 absolute -top-0.5 -right-0.5" />
          <BookOpen className="w-4 h-4 text-red-400 group-hover:rotate-6 transition-transform" />
        </div>

        <span className="tracking-tight">
          User Guides
        </span>

        <span className="px-1.5 py-0.5 rounded bg-red-950/80 text-[10px] font-mono text-red-300 border border-red-800/80 hidden sm:inline">
          SOP-802
        </span>
      </button>
    </aside>
  )
}

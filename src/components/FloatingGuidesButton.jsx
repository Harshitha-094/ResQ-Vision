import React from 'react'
import { BookOpen } from 'lucide-react'
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
        className="group relative pl-3.5 pr-4 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs border border-slate-300 hover:border-slate-400 shadow-md flex items-center gap-2.5 transition-all hover:scale-102 active:scale-98 cursor-pointer"
        title="Open Interactive User Guides & Step-by-Step SOPs"
      >
        <div className="relative flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-blue-600 group-hover:scale-105 transition-transform" />
        </div>

        <span className="tracking-tight text-slate-800">
          User Guides
        </span>

        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-600 border border-slate-200 hidden sm:inline">
          SOP-802
        </span>
      </button>
    </aside>
  )
}

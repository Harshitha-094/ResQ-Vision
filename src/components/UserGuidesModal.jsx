import React, { useState } from 'react'
import {
  X,
  BookOpen,
  Camera,
  Ambulance,
  Building2,
  Shield,
  Activity,
  CreditCard,
  Lock,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  ExternalLink,
  Sparkles,
  Compass,
  Radio,
  FileText,
  Smartphone,
  Eye,
  Check
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'

const USER_GUIDES_DATA = [
  {
    id: 'citizen',
    title: 'Citizen Live Reporting Guide',
    shortTitle: 'Citizen Report',
    icon: Smartphone,
    color: 'rose',
    targetRole: 'citizen',
    targetDesk: 'citizen',
    summary: 'How bystanders report road crashes with verified live camera photos and real-time GPS coordinates.',
    steps: [
      {
        stepNumber: 1,
        title: 'Grant Live Camera Permission',
        subtitle: 'Hardware lens access required · Pre-existing gallery uploads disabled',
        description: 'Open the Citizen Report portal and tap "Open Device Camera to Take Photo". Emergency protocol strictly blocks gallery uploads to prevent stale, forwarded, or fake crash pictures.',
        tip: 'If camera permission is prompted by your browser, tap Allow. You can also test with the simulated test shutter button.',
        badge: 'ANTI-TAMPER POLICY'
      },
      {
        stepNumber: 2,
        title: 'Instant GPS Coordinate Lock',
        subtitle: 'Precision within ±3.4 meters locked via satellite telemetry',
        description: 'The moment your camera opens, ResQVision captures your exact physical coordinates (Latitude, Longitude, and Roadside Milestone), performing high-accuracy reverse geocoding.',
        tip: 'Ensure location services are active. On highway corridors, the system maps the nearest expressway kilometer marker.',
        badge: 'AUTOMATIC GPS'
      },
      {
        stepNumber: 3,
        title: 'Snap Incident Photo & Telemetry Stamp',
        subtitle: 'Live image burned with tamper-proof EXIF watermark',
        description: 'Point at the collision scene and press the capture button. The application burns a permanent cryptographic watermark containing the UTC timestamp, latitude, longitude, and corridor name directly onto the image.',
        tip: 'The original image you snap is preserved without modification. ResQVision never substitutes demo photos for citizen submissions.',
        badge: 'ORIGINAL CAPTURE'
      },
      {
        stepNumber: 4,
        title: 'Send Report to Multi-Agency Grid',
        subtitle: 'Ambulance 04, BTP Patrol 11, and Traffic TMC alerted concurrently',
        description: 'Review the preview and tap "Send report to emergency grid". In under 2 seconds, your report creates active dispatch tickets for the nearest available ambulance, highway police patrol, and traffic signal controller.',
        tip: 'You can immediately inspect live dispatch status and track Ambulance 04\'s turn-by-turn ETA on the live map.',
        badge: '< 2s DISPATCH'
      },
      {
        stepNumber: 5,
        title: 'Good Samaritan Legal Immunity',
        subtitle: 'Protected under Section 134A of the Motor Vehicles Act',
        description: 'You are legally protected under India\'s Good Samaritan law. You are not required to disclose personal credentials, make repeated station visits, or appear in court proceedings.',
        tip: 'Your contribution saves lives during the critical first 15 minutes of the Golden Hour.',
        badge: 'LEGAL IMMUNITY'
      }
    ]
  },
  {
    id: 'ambulance',
    title: '108 Ambulance Field Response Guide',
    shortTitle: 'Ambulance 108',
    icon: Ambulance,
    color: 'emerald',
    targetRole: 'ambulance',
    targetDesk: 'ambulances',
    summary: 'Turn-by-turn emergency navigation, on-scene casualty triage, and clinical hospital handover procedures.',
    steps: [
      {
        stepNumber: 1,
        title: 'Acknowledge CAD Dispatch Alert',
        subtitle: '15-second mandatory response window for ALS units',
        description: 'When an accident is detected by roadside AI cameras or citizen reporting, your Mobile CAD Terminal flashes an immediate priority alert with casualty count and exact road milestone.',
        tip: 'Click "Acknowledge CAD Alert" to broadcast immediate en-route telemetry to Central Command.',
        badge: 'CAD ALERT'
      },
      {
        stepNumber: 2,
        title: 'Turn-by-Turn Navigation & Signal Preemption',
        subtitle: 'Automated Green Corridor clears opposing intersection traffic',
        description: 'Follow the high-definition GPS route. As Ambulance 07 approaches traffic junctions along Hosur Road, Traffic Management signals preempt to Green Priority automatically.',
        tip: 'Maintain siren beacon active; highway VMS advisory boards will warn drivers 2 km ahead to merge right.',
        badge: 'GREEN CORRIDOR'
      },
      {
        stepNumber: 3,
        title: 'On-Scene START Casualty Triage',
        subtitle: 'Rapid triage classification (Red, Yellow, Green, Black)',
        description: 'Upon scene arrival, stabilize cervical spine, assess airway and circulation, and categorize casualties. Connect patient monitors to transmit real-time vitals to the receiving hospital.',
        tip: 'Update the casualty count on your console so the Trauma ER can reserve adequate surgical bays.',
        badge: 'TRIAGE PROTOCOL'
      },
      {
        stepNumber: 4,
        title: 'Confirm Hospital Emergency Arrival',
        subtitle: 'Click upon entering St. John\'s Hospital trauma spur',
        description: 'As your vehicle reaches the hospital gate, click "Confirm Arrival at Hospital". This triggers immediate surgical team standby and prepares Trauma Bay 1.',
        tip: 'Arrival verification synchronizes the hospital\'s emergency gurney team and blood bank cross-match.',
        badge: 'ARRIVAL CONFIRM'
      },
      {
        stepNumber: 5,
        title: 'Execute Clinical Handover & Case Closure',
        subtitle: 'Mandatory handover receipt signoff with Trauma CMO',
        description: 'Transfer casualties to Trauma Bay 1. Review vitals with Dr. A. Mathew, click "Confirm Handover & Close Case", and generate the legal handover receipt (REC-2026-RQ1048-SJ).',
        tip: 'An ambulance cannot close a case without clinical handover signoff. Once signed, unit KA 01 AB 1234 resets to AVAILABLE.',
        badge: 'OFFICIAL RECEIPT'
      }
    ]
  },
  {
    id: 'hospital',
    title: 'Hospital Emergency Trauma Desk Guide',
    shortTitle: 'Hospital Desk',
    icon: Building2,
    color: 'blue',
    targetRole: 'hospital',
    targetDesk: 'hospitals',
    summary: 'Inbound patient telemetry monitoring, trauma bay allocation, blood priming, and admission signoff.',
    steps: [
      {
        stepNumber: 1,
        title: 'Monitor Inbound Casualty Telemetry',
        subtitle: 'Live ETA countdown and casualty severity tracking',
        description: 'The Hospital Trauma Desk displays inbound ambulance units, casualty counts, preliminary vitals (SpO2, Blood Pressure, Glasgow Coma Scale), and estimated time to gate.',
        tip: 'Click "Acknowledge Inbound Case" to confirm your trauma receiving team is on active standby.',
        badge: 'TELEMETRY'
      },
      {
        stepNumber: 2,
        title: 'Prepare Trauma Bay 1 & Blood Reserves',
        subtitle: 'Sterilize surgical gurney and prime rapid infusers',
        description: 'Click "Prepare Trauma Bay 1". This alerts scrub nurses, primes rapid blood infusers, and instructs the blood bank to cross-match 2 units of uncrossed O-Negative packed red cells.',
        tip: 'Early bay preparation saves an average of 11 critical minutes once the ambulance docks.',
        badge: 'BAY ALLOCATION'
      },
      {
        stepNumber: 3,
        title: 'Broadcast Ready for Arrival Status',
        subtitle: 'Alert ambulance crew that surgical team is in position',
        description: 'Once Trauma Bay 1 is pre-cleared, click "Mark Ready for Arrival". Ambulance 07 receives an instant confirmation that no gate hold will occur.',
        tip: 'Green status indicates surgeons and radiographers are scrubbed at the gurney bay.',
        badge: 'ZERO-WAIT DOCK'
      },
      {
        stepNumber: 4,
        title: 'Sign Clinical Handover Receipt',
        subtitle: 'Official signoff between Paramedic and CMO',
        description: 'When the ambulance docks, receive casualties, verify IV infusions, and countersign the Clinical Handover Receipt with Paramedic S. Nair to officially close the mission.',
        tip: 'The signed receipt is permanently archived in forensic audit logs with timestamp and doctor ID.',
        badge: 'LEGAL HANDOVER'
      }
    ]
  },
  {
    id: 'police',
    title: 'Police Highway Interceptor Guide',
    shortTitle: 'Police Patrol',
    icon: Shield,
    color: 'indigo',
    targetRole: 'police',
    targetDesk: 'police',
    summary: 'Crash scene perimeter security, traffic diversion cordons, and digital FIR evidence dockets.',
    steps: [
      {
        stepNumber: 1,
        title: 'Acknowledge Interceptor Alert',
        subtitle: 'Highway Interceptor 04 dispatched to NH-44 KM 42.4',
        description: 'Review the crash location and initial CCTV feed or citizen photo. Click "Acknowledge Alert" and dispatch Interceptor unit 04 with an estimated arrival time under 4 minutes.',
        tip: 'Use the surveillance camera view to check if hazardous chemical tankers or overturned vehicles are blocking lanes.',
        badge: 'DISPATCH'
      },
      {
        stepNumber: 2,
        title: 'Deploy Perimeter Cordon & Traffic Cones',
        subtitle: 'Establish secondary crash defense zone',
        description: 'Upon scene arrival, deploy reflective rubber cones 100 meters upstream. Divert trailing vehicles into Lane 3 to protect paramedics and extrication teams from secondary collisions.',
        tip: 'Click "Mark Arrived on Scene" to update the Central CAD operational dashboard.',
        badge: 'SCENE CORDON'
      },
      {
        stepNumber: 3,
        title: 'Enforce Good Samaritan Protection',
        subtitle: 'Section 134A Motor Vehicles Amendment Act compliance',
        description: 'Ensure bystander citizens who reported the crash or provided first aid are not detained, questioned aggressively, or subjected to legal harassment.',
        tip: 'The citizen report is fully authenticated by the live camera timestamp and GPS coordinates.',
        badge: 'SEC 134A COMPLIANCE'
      },
      {
        stepNumber: 4,
        title: 'Generate Digital FIR Evidence Docket',
        subtitle: 'Cryptographic case docket with camera snapshots',
        description: 'Review vehicle registration numbers, skid marks, and CCTV stills. The system compiles docket FIR-2026-NH44-01048 for accident reconstruction and insurance forensic audit.',
        tip: 'Police personnel cannot view patient medical files, maintaining strict legal separation of duties.',
        badge: 'DIGITAL FIR'
      }
    ]
  },
  {
    id: 'traffic',
    title: 'Traffic Management Center (TMC) Guide',
    shortTitle: 'Traffic Desk',
    icon: Activity,
    color: 'amber',
    targetRole: 'traffic',
    targetDesk: 'traffic',
    summary: 'Automated Green Corridor signal preemption, VMS signboards, and junction queue management.',
    steps: [
      {
        stepNumber: 1,
        title: 'Activate Green Corridor Preemption',
        subtitle: 'Synchronized green wave along Hosur Road Expressway',
        description: 'When Ambulance 07 is rolling, the Traffic Management Center locks an automated green priority corridor across 4 successive signal junctions (SIG-01 through SIG-04).',
        tip: 'Cross-traffic lights are automatically held at RED with countdown timers to prevent intersection gridlock.',
        badge: 'GREEN PRIORITY'
      },
      {
        stepNumber: 2,
        title: 'Broadcast Highway VMS Warning Messages',
        subtitle: 'Overhead LED matrix boards alert upstream motorists',
        description: 'Activate overhead Variable Message Signs (VMS) 2 km before the crash scene: "CAUTION: CRASH 2KM AHEAD AT KM 42 — MERGE RIGHT".',
        tip: 'Early diversion prevents high-speed chain-reaction pileups on expressways.',
        badge: 'VMS BROADCAST'
      },
      {
        stepNumber: 3,
        title: 'Release Corridor upon Hospital Arrival',
        subtitle: 'Return arterial traffic lights to adaptive smart timing',
        description: 'Once Ambulance 07 enters St. John\'s Hospital gates, the system automatically returns traffic signals to standard adaptive split-cycle timing.',
        tip: 'Corridor history is logged with exact time savings for post-incident mobility analytics.',
        badge: 'CYCLE RESET'
      }
    ]
  },
  {
    id: 'toll',
    title: 'Toll Plaza Emergency Bypass Guide',
    shortTitle: 'Toll Authority',
    icon: CreditCard,
    color: 'cyan',
    targetRole: 'toll',
    targetDesk: 'toll',
    summary: 'Automated FASTag RFID auto-lift barriers and zero-delay emergency lane clearance.',
    steps: [
      {
        stepNumber: 1,
        title: 'FASTag Emergency Vehicle Auto-Lift',
        subtitle: 'RFID transceiver detects inbound emergency vehicle 800m ahead',
        description: 'As Ambulance 07 approaches Plaza 17, Lane #1 auto-lifts its boom barrier without requiring manual cashier intervention or RFID account deductions.',
        tip: 'Emergency Lane #1 is permanently reserved for emergency responders, fire tenders, and police interceptors.',
        badge: 'AUTO-LIFT'
      },
      {
        stepNumber: 2,
        title: 'Manual Emergency Barrier Override',
        subtitle: 'Failsafe manual lift button in case of network interruption',
        description: 'In the event of optical fiber disruption, the Toll Operator uses the manual override button on the console to lock the boom barrier in the upright position.',
        tip: 'Zero-stop passage ensures ambulance transit delay through toll plazas is strictly 0 seconds.',
        badge: 'FAILSAFE OVERRIDE'
      }
    ]
  },
  {
    id: 'rbac',
    title: 'Desk Isolation & RBAC Security Guide',
    shortTitle: 'Desk Isolation',
    icon: Lock,
    color: 'purple',
    targetRole: 'dispatcher',
    targetDesk: 'manual',
    summary: 'Why departmental consoles are isolated and how to switch credentials during drills.',
    steps: [
      {
        stepNumber: 1,
        title: 'Understanding "Code 403: Access Denied"',
        subtitle: 'Statutory separation of duties between medical and law enforcement',
        description: 'Ambulances cannot access Hospital desks; Hospitals cannot access Police consoles; Citizens cannot peek into police CAD logs. This is an intentional security design, not a bug.',
        tip: 'Protects patient privacy (HIPAA/DISHA) and prevents unauthorized tampering with criminal evidence.',
        badge: 'CODE 403'
      },
      {
        stepNumber: 2,
        title: 'Testing Roles in Multi-Agency Drills',
        subtitle: 'Use the Role Switcher at the top of the screen',
        description: 'To test another agency\'s console during training or system review, select that department from the "Credentials" dropdown in the Top Bar. The desk unlocks immediately.',
        tip: 'Switching to "Central CAD Supervisor" grants cross-agency visibility across all 5 consoles.',
        badge: 'ROLE SWITCHER'
      },
      {
        stepNumber: 3,
        title: 'Operational Field Manual (SOP-802)',
        subtitle: 'Access full human-crafted field manual anytime',
        description: 'Click "User Guide Manual" in the sidebar or top bar to open the complete, printable 6-chapter operational manual written by Dr. Anand Mathew and dispatch leads.',
        tip: 'Use the Print button to download or print high-resolution field cheat sheets.',
        badge: 'SOP-802 MANUAL'
      }
    ]
  }
]

export default function UserGuidesModal() {
  const {
    userGuidesOpen,
    closeUserGuides,
    userGuidesActiveTopic,
    setUserGuidesActiveTopic,
    setUserRole,
    setActiveView
  } = useEmergencyStore()

  const [activeStepIdx, setActiveStepIdx] = useState(0)
  const [viewAllSteps, setViewAllSteps] = useState(false)
  const [searchFilter, setSearchFilter] = useState('')

  if (!userGuidesOpen) return null

  const currentTopic = USER_GUIDES_DATA.find(g => g.id === userGuidesActiveTopic) || USER_GUIDES_DATA[0]
  const currentStep = currentTopic.steps[activeStepIdx] || currentTopic.steps[0]
  const totalSteps = currentTopic.steps.length

  const handleSelectTopic = (topicId) => {
    setUserGuidesActiveTopic(topicId)
    setActiveStepIdx(0)
    setViewAllSteps(false)
  }

  const handleLaunchDesk = () => {
    setUserRole(currentTopic.targetRole)
    setActiveView(currentTopic.targetDesk)
    closeUserGuides()
  }

  const filteredTopics = USER_GUIDES_DATA.filter(t =>
    t.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    t.summary.toLowerCase().includes(searchFilter.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl h-[90vh] max-h-[720px] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/90 text-white flex items-center justify-center shadow-md">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>ResQVision Interactive User Guides</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono text-[10px] font-bold">
                  SOP-802 INTERACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Step-by-step operational walkthroughs for all 5 emergency consoles and public reporting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={closeUserGuides}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
              aria-label="Close guide modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Left Sidebar Topics + Right Interactive Content */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Left Topic Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/50 flex flex-col shrink-0">
            {/* Search filter */}
            <div className="p-3 border-b border-slate-800">
              <input
                type="text"
                placeholder="Filter guides..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-red-500"
              />
            </div>

            {/* Topic List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredTopics.map((topic) => {
                const Icon = topic.icon
                const isSelected = topic.id === currentTopic.id
                return (
                  <button
                    key={topic.id}
                    onClick={() => handleSelectTopic(topic.id)}
                    className={`w-full p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-red-600 text-white font-bold shadow-md shadow-red-950/40'
                        : 'hover:bg-slate-850 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs truncate font-medium">
                        {topic.shortTitle}
                      </div>
                      <div className={`text-[10px] truncate ${isSelected ? 'text-red-100' : 'text-slate-500'}`}>
                        {topic.steps.length} operational steps
                      </div>
                    </div>
                    {isSelected && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                )
              })}
            </div>

            {/* Quick Link to Full Manual */}
            <div className="p-3 border-t border-slate-800 bg-slate-950">
              <button
                onClick={() => {
                  setActiveView('manual')
                  closeUserGuides()
                }}
                className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[11px] text-slate-300 hover:text-slate-100 font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Read Full SOP Manual</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Right Interactive Walkthrough Area */}
          <div className="flex-1 flex flex-col min-h-0 bg-slate-900/40 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Topic Title & Action Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-red-400 font-bold">
                    OPERATIONAL FIELD GUIDE
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Target: {currentTopic.targetRole.toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-100 mt-0.5">
                  {currentTopic.title}
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  {currentTopic.summary}
                </p>
              </div>

              {/* Action Button: Jump straight into the Desk */}
              <button
                onClick={handleLaunchDesk}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shrink-0 shadow-lg shadow-red-950/30"
              >
                <span>Open {currentTopic.shortTitle} Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Toggle between Step-by-Step and View All Steps */}
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="font-bold text-slate-200">
                  Step {activeStepIdx + 1} of {totalSteps}
                </span>
                <span>·</span>
                <span className="text-emerald-400">{currentStep.badge}</span>
              </div>

              <button
                onClick={() => setViewAllSteps(!viewAllSteps)}
                className="text-slate-400 hover:text-slate-200 underline cursor-pointer text-[11px]"
              >
                {viewAllSteps ? 'Switch to Step-by-Step' : 'Show All Steps Overview'}
              </button>
            </div>

            {/* Mode A: Single Step Spotlight Card */}
            {!viewAllSteps ? (
              <div className="space-y-4">
                {/* Step Progress Dots */}
                <div className="flex items-center gap-1.5">
                  {currentTopic.steps.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveStepIdx(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === activeStepIdx
                          ? 'w-8 bg-red-500'
                          : idx < activeStepIdx
                          ? 'w-3 bg-emerald-500/80'
                          : 'w-3 bg-slate-800'
                      }`}
                      title={`Go to Step ${idx + 1}: ${s.title}`}
                    />
                  ))}
                </div>

                {/* Main Step Detail Card */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl relative overflow-hidden">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-red-950 text-red-300 font-mono text-[10px] font-bold border border-red-800">
                        STEP {currentStep.stepNumber} OF {totalSteps}
                      </span>
                      <h3 className="text-lg font-bold text-slate-100">
                        {currentStep.title}
                      </h3>
                      <div className="text-xs text-slate-400 font-medium">
                        {currentStep.subtitle}
                      </div>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 font-mono font-black text-sm shrink-0">
                      0{currentStep.stepNumber}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-850">
                    {currentStep.description}
                  </p>

                  {/* Pro Tip Box */}
                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-900/50 text-xs text-amber-200/90 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-100 font-semibold">Field Operator Tip: </strong>
                      {currentStep.tip}
                    </div>
                  </div>
                </div>

                {/* Step Navigation Controls */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setActiveStepIdx(Math.max(0, activeStepIdx - 1))}
                    disabled={activeStepIdx === 0}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Step</span>
                  </button>

                  {activeStepIdx < totalSteps - 1 ? (
                    <button
                      onClick={() => setActiveStepIdx(activeStepIdx + 1)}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-red-950/30"
                    >
                      <span>Next Step</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleLaunchDesk}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-950/30"
                    >
                      <Check className="w-4 h-4" />
                      <span>Ready! Launch {currentTopic.shortTitle}</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Mode B: All Steps Overview */
              <div className="space-y-3">
                {currentTopic.steps.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                      <span className="font-bold text-slate-100 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-red-600 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                          {step.stepNumber}
                        </span>
                        <span>{step.title}</span>
                      </span>
                      <span className="font-mono text-[10px] text-emerald-400 font-bold">
                        {step.badge}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {step.description}
                    </p>
                    <div className="text-[11px] text-amber-300/80 font-mono">
                      Tip: {step.tip}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

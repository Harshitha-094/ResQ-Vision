import React, { useState } from 'react'
import {
  BookOpen,
  Camera,
  Shield,
  Ambulance,
  Building2,
  Activity,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Ban,
  Search,
  Printer,
  Smartphone,
  Radio,
  UserCheck,
  HeartPulse,
  Compass
} from 'lucide-react'
import { useEmergencyStore } from '../store/emergencyStore'

export default function UserGuideManualView() {
  const { setActiveView, setUserRole, userRole } = useEmergencyStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')

  const tabs = [
    { id: 'overview', label: '1. Golden Hour & Purpose', icon: HeartPulse },
    { id: 'cameras', label: '2. Public vs. Citizen Photos', icon: Camera },
    { id: 'rbac', label: '3. Desk Isolation (RBAC)', icon: Lock },
    { id: 'gps', label: '4. GPS & Hospital Proximity', icon: Compass },
    { id: 'sops', label: '5. Department Field SOPs', icon: Shield },
    { id: 'faqs', label: '6. Field Operator FAQs', icon: BookOpen }
  ]

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 print:p-0 print:max-w-full text-slate-800">
      {/* ======================================================== */}
      {/* OFFICIAL S.O.P. HEADER                                   */}
      {/* ======================================================== */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-mono text-xs font-semibold">
                SOP-802 · REV 3.4.2
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs font-semibold">
                HUMAN SIGN-OFF CERTIFIED
              </span>
              <span className="text-slate-500 text-xs font-mono">
                KARNATAKA EMERGENCY CAD GRID
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              ResQVision Operating Guide & Field Manual
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Standard Operating Procedures for Inter-Agency Emergency Trauma Coordination,
              Role-Based Desk Isolation, Camera Stream Authentication, and Golden Hour Hospital Handover.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 print:hidden">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Print field manual"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Authorship & Sign-off Dossier */}
        <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
            <span className="text-[10px] uppercase font-mono text-slate-500 block font-semibold">Trauma Medicine Lead</span>
            <span className="text-slate-900 font-bold block">Dr. Anand Mathew, MD</span>
            <span className="text-xs text-slate-600">CMO, St. John's Trauma Center</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
            <span className="text-[10px] uppercase font-mono text-slate-500 block font-semibold">108 Dispatch Coordinator</span>
            <span className="text-slate-900 font-bold block">Rajesh Kumar</span>
            <span className="text-xs text-slate-600">Head of CAD Dispatch, 108 EMS</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
            <span className="text-[10px] uppercase font-mono text-slate-500 block font-semibold">Highway Patrol Liaison</span>
            <span className="text-slate-900 font-bold block">Insp. Mohan Kumar</span>
            <span className="text-xs text-slate-600">Highway Interceptor Unit 04</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
            <span className="text-[10px] uppercase font-mono text-slate-500 block font-semibold">Intelligent Traffic Lead</span>
            <span className="text-slate-900 font-bold block">Priya Sharma, M.Tech</span>
            <span className="text-xs text-slate-600">Traffic Management Center (TMC)</span>
          </div>
        </div>

        {/* Operator Note */}
        <div className="mt-4 p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-950 font-semibold">OPERATOR DIRECTIVE: </strong>
            In vehicular polytrauma, human tissue survives for 60 minutes. Every second lost to sequential phone calls,
            inter-desk confusion, or unverified forwarded photos leads to preventable fatalities. Follow the protocols herein strictly.
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* NAVIGATION TABS & SEARCH                                 */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 print:hidden">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search rules, codes, SOPs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600"
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: GOLDEN HOUR PHILOSOPHY                            */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6 text-sm text-slate-700">
          <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-5 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-red-600" />
              <span>1. The Golden Hour Protocol (00:00 - 60:00 Minutes)</span>
            </h2>
            <p className="leading-relaxed text-slate-600 text-xs sm:text-sm">
              In trauma surgery, the <strong>"Golden Hour"</strong> refers to the first 60 minutes following severe traumatic
              injury. Extensive medical data demonstrates that if a bleeding polytrauma casualty receives definitive surgical
              intervention within 60 minutes of the crash, the survival probability exceeds <strong>85%</strong>. If that care is
              delayed past 90 minutes, mortality rises precipitously above <strong>60%</strong>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-[11px] font-mono text-red-600 font-bold uppercase">Phase 1: Detection</div>
                <div className="text-base font-bold text-slate-900">00:00 — 02:00 Min</div>
                <p className="text-xs text-slate-600">
                  Accident detected via AI Highway Sensor Camera or Citizen Bystander live camera snap.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-[11px] font-mono text-amber-700 font-bold uppercase">Phase 2: Simultaneous CAD</div>
                <div className="text-base font-bold text-slate-900">02:00 — 15:00 Min</div>
                <p className="text-xs text-slate-600">
                  Ambulance, Police Interceptor, Traffic TMC Green Corridor, and Toll FastTag bypass triggered concurrently.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-[11px] font-mono text-emerald-700 font-bold uppercase">Phase 3: Resuscitation</div>
                <div className="text-base font-bold text-slate-900">15:00 — 60:00 Min</div>
                <p className="text-xs text-slate-600">
                  Trauma bay pre-cleared, O-negative blood cross-matched, emergency handover completed, and patient into surgery.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-200 space-y-2 text-xs">
              <div className="font-bold text-blue-900 flex items-center gap-1.5 font-mono">
                <Activity className="w-4 h-4 text-blue-700" />
                <span>WHY RESQVISION REPLACED SEQUENTIAL CALL DISPATCH</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Traditional Indian emergency systems operate sequentially: a citizen dials 112 or 108; the operator talks for 4 minutes;
                writes on a paper log; then dials the police control room; police dial the nearest station; police reach the scene and finally
                call an ambulance. This serial chain consumed 28 to 45 minutes before an ambulance even turned on its engine.
              </p>
              <p className="text-blue-950 font-semibold leading-relaxed">
                ResQVision operates on synchronized parallel event propagation: When an incident is logged (via Camera or Citizen),
                Ambulance, Hospital, Police, Traffic, and Toll receive the identical GIS payload in under 2 seconds.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PUBLIC CAMERAS VS CITIZEN REAL PHOTO POLICY       */}
      {/* ======================================================== */}
      {activeTab === 'cameras' && (
        <div className="space-y-6 text-sm text-slate-700">
          <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-5 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              <span>2. Camera Integrity Rules: Public Cameras vs. Citizen Photos</span>
            </h2>
            <p className="leading-relaxed text-slate-600 text-xs sm:text-sm">
              A foundational operational principle of ResQVision is <strong>Zero Image Contamination</strong>. We strictly differentiate
              between authorized fixed public infrastructure cameras and spontaneous citizen bystander reports.
            </p>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Box 1: Public Cameras */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 font-mono text-xs">
                    <Radio className="w-4 h-4 text-amber-600" />
                    <span>PUBLIC FIXED SENSORS (DEMONSTRATION)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-mono text-[10px] border border-amber-200">
                    AUTHORIZED FEEDS
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  These represent permanent highway safety cameras deployed at strategic choke points. For operational demonstration and
                  simulation, these feeds utilize verified CCTV imagery:
                </p>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                  <li><strong>Highways:</strong> NH 44 Expressway KM 42.4 (Cam 07)</li>
                  <li><strong>Traffic Junctions:</strong> Silk Board Underpass (Cam 04) & Tumkur Road / Yeshwanthpur (Cam 14)</li>
                  <li><strong>Toll Plazas:</strong> Attibele Toll Plaza 17 (Entry Cam 02)</li>
                  <li><strong>Petrol Bunks:</strong> Indian Oil Highway Fuel Station KM 38 (Cam 09)</li>
                </ul>
                <div className="p-2 rounded bg-white text-[11px] text-slate-500 font-mono border border-slate-200">
                  Tag: "PUBLIC CAMERA DEMONSTRATION STREAM · HIGHWAY/TOLL/TRAFFIC/PETROL"
                </div>
              </div>

              {/* Box 2: Citizen Real Photos */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 font-mono text-xs">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>CITIZEN BYSTANDER (ORIGINAL LIVE PHOTO)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono text-[10px] border border-emerald-200">
                    REAL PHOTO ONLY
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  When a citizen reports an accident, the system enforces a strict <strong>Live Shutter Policy</strong>:
                </p>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                  <li><strong>No Gallery Uploads:</strong> Selecting pre-existing gallery photos is blocked to prevent fake or stale reports.</li>
                  <li><strong>Physical Lens Shutter:</strong> Citizen must open the active hardware camera and click the scene live.</li>
                  <li><strong>Anti-Tamper Telemetry:</strong> Live GPS coordinates and timestamp are embedded directly.</li>
                  <li><strong>Original Photo Retention:</strong> The actual image clicked is delivered directly to emergency responders.</li>
                </ul>
                <div className="p-2 rounded bg-white text-[11px] text-emerald-700 font-mono border border-slate-200">
                  Tag: "ORIGINAL CITIZEN LIVE CAMERA PHOTO · NO DEMO OVERRIDE"
                </div>
              </div>
            </div>

            {/* Why Gallery Uploads are Banned Callout */}
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 space-y-2 text-xs">
              <div className="font-bold text-amber-900 flex items-center gap-1.5 font-mono">
                <Ban className="w-4 h-4 text-amber-700" />
                <span>OPERATIONAL RATIONALE: WHY GALLERY UPLOADS ARE PROHIBITED</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                During highway pilot drills, allowing generic file uploads resulted in well-meaning citizens uploading 3-year-old viral crash pictures forwarded on messaging apps, dispatching ambulances to phantom scenes while real victims waited.
              </p>
              <p className="text-amber-950 font-semibold leading-relaxed">
                By enforcing direct camera capture with verified live GPS acquisition, every single citizen incident is verified as an active, physically present emergency.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: DESK ISOLATION & RBAC (CODE 403)                  */}
      {/* ======================================================== */}
      {activeTab === 'rbac' && (
        <div className="space-y-6 text-sm text-slate-700">
          <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-5 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              <span>3. CAD Desk Isolation & Role-Based Access Control (RBAC)</span>
            </h2>
            <p className="leading-relaxed text-slate-600 text-xs sm:text-sm">
              In high-stress emergency response, <strong>information overload and unauthorized cross-department tampering</strong> are
              fatal hazards. ResQVision enforces strict computer-aided dispatch (CAD) desk isolation.
            </p>

            {/* Isolation Matrix */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                Departmental Desk Boundaries & Restrictions:
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold font-mono">
                    <Ambulance className="w-4 h-4" />
                    <span>Ambulance Desk (EMS-KA01-07 / 04)</span>
                  </div>
                  <p className="text-slate-600">
                    Paramedics control siren telemetry, patient vitals, casualty load count, and turn-by-turn routing.
                  </p>
                  <div className="text-[11px] text-slate-600 font-mono bg-white p-2 rounded border border-slate-200">
                    RESTRICTION: Cannot alter hospital bed reservations or edit police FIR criminal logs.
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-blue-700 font-bold font-mono">
                    <Building2 className="w-4 h-4" />
                    <span>Hospital Trauma Desk (HOSP-TRAUMA-ER)</span>
                  </div>
                  <p className="text-slate-600">
                    ER staff allocate Trauma Bays, ready blood units, sign clinical handover receipts, and admit patients.
                  </p>
                  <div className="text-[11px] text-slate-600 font-mono bg-white p-2 rounded border border-slate-200">
                    RESTRICTION: Cannot override traffic signals, dispatch police interceptors, or drive ambulances.
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-800 font-bold font-mono">
                    <Shield className="w-4 h-4" />
                    <span>Police Desk (KSP-HWY-04 / BTP-11)</span>
                  </div>
                  <p className="text-slate-600">
                    Officers manage highway cordon, vehicle debris clearance, FIR crime dockets, and Good Samaritan legal immunity.
                  </p>
                  <div className="text-[11px] text-slate-600 font-mono bg-white p-2 rounded border border-slate-200">
                    RESTRICTION: Cannot view confidential patient medical histories or alter ambulance hospital destinations.
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-amber-700 font-bold font-mono">
                    <Activity className="w-4 h-4" />
                    <span>Traffic Management Center (TMC-99)</span>
                  </div>
                  <p className="text-slate-600">
                    Traffic engineers control automated Green Corridor signal timing and highway Variable Message Signs (VMS).
                  </p>
                  <div className="text-[11px] text-slate-600 font-mono bg-white p-2 rounded border border-slate-200">
                    RESTRICTION: Cannot sign off patient medical handovers or access closed forensic medical files.
                  </div>
                </div>
              </div>
            </div>

            {/* Code 403 Protocol */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 font-mono">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>WHAT HAPPENS ON A "CODE 403: ACCESS DENIED" SCREEN</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                If an Ambulance paramedic clicks on the Hospital Trauma Desk or a Citizen clicks on the Police Interceptor Console,
                the system displays an immediate <strong>Access Restricted Barrier</strong>.
                This is not a software crash — it is an intentional barrier complying with statutory medical privacy laws (HIPAA/DISHA)
                and police chain-of-custody protocols.
              </p>
              <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-slate-600">
                <span>To test another department:</span>
                <span className="text-blue-700 font-bold">Use the "CAD Role Switcher" in the top bar</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: GPS & HOSPITAL PROXIMITY MATRIX                   */}
      {/* ======================================================== */}
      {activeTab === 'gps' && (
        <div className="space-y-6 text-sm text-slate-700">
          <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-5 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600" />
              <span>4. Exact GPS Geolocation & Trauma Center Proximity</span>
            </h2>
            <p className="leading-relaxed text-slate-600 text-xs sm:text-sm">
              When an accident occurs, navigating to the nearest clinic is often a fatal mistake. Severe road
              polytrauma requires an accredited <strong>Level-1 or Level-2 Trauma Center</strong> equipped with 24/7 neurosurgery,
              orthopedics, blood banks, and surgical suites.
            </p>

            {/* Bangalore Hospital Matrix */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                Geocoded Trauma Facility Network (South Bangalore & NH-44 Grid):
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>St. John's Medical College Hospital</span>
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-mono border border-blue-200">
                        LEVEL-1 TRAUMA CENTER
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] font-mono mt-0.5">
                      Sarjapur Road / Koramangala (12.9312° N, 77.6214° E) · 4.6 km from NH-44 KM 42
                    </div>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-emerald-700 font-bold">14 Bays Clear</span>
                    <span className="text-slate-500">O-Neg In Stock</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>Narayana Health City (Mazumdar Shaw Center)</span>
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-mono border border-blue-200">
                        LEVEL-1 TRAUMA CENTER
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] font-mono mt-0.5">
                      Bommasandra Industrial Area, Hosur Road (12.8184° N, 77.6978° E) · 3.8 km from Attibele
                    </div>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-emerald-700 font-bold">18 Bays Clear</span>
                    <span className="text-slate-500">Cardiothoracic Ready</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>Apollo Hospital Bannerghatta Road</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono border border-slate-200">
                        LEVEL-2 TRAUMA CENTER
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] font-mono mt-0.5">
                      Bannerghatta Main Road (12.8942° N, 77.5985° E) · 7.2 km from Electronic City
                    </div>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-emerald-700 font-bold">8 Bays Clear</span>
                    <span className="text-slate-500">ICU Ready</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Handover & Case Closure SOP */}
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 space-y-2 text-xs">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>CASE CLOSURE REQUIREMENT: THE CLINICAL HANDOVER RECEIPT</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                An ambulance cannot simply "close" an active accident case at will. ResQVision requires physical arrival at the emergency
                gate, followed by an official signoff between the ALS Paramedic and the Hospital Emergency Medical Officer.
              </p>
              <p className="text-emerald-950 font-semibold leading-relaxed">
                Upon signoff, a legally binding Handover Receipt (e.g., <code>REC-2026-RQ1048-SJ</code>) is generated containing arrival timestamp, casualty vitals, admitted bay, and paramedic badge ID. Only then does the ambulance unit return to AVAILABLE status.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: DEPARTMENT FIELD S.O.P.S                          */}
      {/* ======================================================== */}
      {activeTab === 'sops' && (
        <div className="space-y-6 text-sm text-slate-700">
          <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-5 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>5. Step-by-Step Department Field Action S.O.P.s</span>
            </h2>

            {/* SOP 1: Ambulance */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <Ambulance className="w-4 h-4" />
                <span>SOP-AMB: 108 Ambulance Field Crew Protocol</span>
              </h3>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
                <ol className="list-decimal list-inside space-y-1.5 text-slate-700">
                  <li><strong>CAD Alert Acceptance:</strong> Acknowledge CAD dispatch alert within 15 seconds. GPS route auto-loads.</li>
                  <li><strong>En-Route Navigation:</strong> Drive with siren beacon active; green corridor signals preempt automatically.</li>
                  <li><strong>On-Scene Triage:</strong> Perform START triage (Immediate Red, Delayed Yellow, Minor Green, Deceased Black).</li>
                  <li><strong>Patient Loading:</strong> Collar cervical spine, establish IV line, load into mobile ICU gurney.</li>
                  <li><strong>Hospital Gate Arrival:</strong> Click "Confirm Arrival at Hospital" upon passing emergency bay gate.</li>
                  <li><strong>Clinical Handover Signoff:</strong> Review casualties with ER Doctor, sign digital receipt, close CAD docket.</li>
                </ol>
              </div>
            </div>

            {/* SOP 2: Hospital ER */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                <span>SOP-HOSP: Hospital Trauma ER Desk Protocol</span>
              </h3>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
                <ol className="list-decimal list-inside space-y-1.5 text-slate-700">
                  <li><strong>Inbound Telemetry Monitor:</strong> Monitor inbound Ambulance ETA and casualty count on Trauma Dashboard.</li>
                  <li><strong>Trauma Bay Prep:</strong> Click "Prepare Trauma Bay 1" to sterilize gurney, prime rapid infuser, and alert surgeons.</li>
                  <li><strong>Blood Cross-Match:</strong> Reserve 2 units O-Negative uncrossmatched packed red blood cells.</li>
                  <li><strong>Ready for Arrival:</strong> Click "Ready for Arrival" when surgical staff are scrubbed in position.</li>
                  <li><strong>Casualty Acceptance:</strong> Receive casualties, verify vitals, countersign Handover Receipt.</li>
                </ol>
              </div>
            </div>

            {/* SOP 3: Police & Traffic */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                <span>SOP-POL & TMC: Highway Patrol & Traffic Center Protocol</span>
              </h3>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
                <ol className="list-decimal list-inside space-y-1.5 text-slate-700">
                  <li><strong>Police Interceptor Dispatch:</strong> Interceptor 04 deploys immediately to secure scene perimeter and deploy cones.</li>
                  <li><strong>Good Samaritan Protection:</strong> Under Motor Vehicles Act Section 134A, citizen reporters are immune from harassment, questioning, or mandatory court appearances.</li>
                  <li><strong>TMC Green Corridor:</strong> Activate green corridor priority along Hosur Road / Silk Board / Sarjapur spurs.</li>
                  <li><strong>VMS Warning Signboards:</strong> Broadcast live overhead road advisory: <em>"CAUTION: CRASH AHEAD — MERGE RIGHT"</em>.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: OPERATOR FIELD FAQS                               */}
      {/* ======================================================== */}
      {activeTab === 'faqs' && (
        <div className="space-y-6 text-sm text-slate-700">
          <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-4 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>6. Field Operator Frequently Asked Questions</span>
            </h2>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 text-sm">
                  Q: Why did the system block me from uploading an existing photo from my phone gallery?
                </div>
                <p className="text-slate-600 leading-relaxed">
                  <strong>A:</strong> To prevent fake reports, malicious spam, or forwarded WhatsApp crash photos from years ago, ResQVision disallows gallery file pickers. The citizen must click the photo live through their device camera lens with active GPS coordinates.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 text-sm">
                  Q: Why does the citizen report show the original photo, while highway cameras show demo feeds?
                </div>
                <p className="text-slate-600 leading-relaxed">
                  <strong>A:</strong> Roadside public cameras (Highways, Tolls, Traffic Junctions, Petrol Bunks) use authorized demo streams to simulate fixed infrastructure sensors for operator training. In contrast, citizen reports preserve the exact, original image clicked by the bystander to deliver real visual evidence to paramedics and police.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 text-sm">
                  Q: What should an ambulance crew do if the hospital trauma bay is occupied?
                </div>
                <p className="text-slate-600 leading-relaxed">
                  <strong>A:</strong> The Ambulance Console displays real-time trauma center capacity. If St. John's is at 100% occupancy, the Central Dispatch Supervisor reroutes the ambulance to Narayana Health City (3.8 km away) before the unit reaches the highway gate, avoiding fatal secondary inter-hospital transfers.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 text-sm">
                  Q: Why can't the ambulance paramedic click on the Police Desk?
                </div>
                <p className="text-slate-600 leading-relaxed">
                  <strong>A:</strong> Role-Based Access Control (Code 403). Paramedics are legally prohibited from interfering with police FIR investigation dockets, and police officers cannot alter clinical patient records. If you are conducting a demonstration or drill, switch badges using the Role Switcher at the top of the screen.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 text-sm">
                  Q: How is the citizen bystander legally protected after clicking a photo?
                </div>
                <p className="text-slate-600 leading-relaxed">
                  <strong>A:</strong> Under the Indian Motor Vehicles (Amendment) Act 2019, Section 134A ("Protection of Good Samaritans"), any citizen who assists or reports an accident cannot be subjected to civil or criminal liability. They are not required to disclose personal identifying information or appear in court.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* QUICK ROLE SHORTCUTS FOOTER                              */}
      {/* ======================================================== */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-slate-600">
            Active Role: <strong className="text-slate-900">{userRole.toUpperCase()}</strong>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setUserRole('citizen')
              setActiveView('citizen')
            }}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Test Citizen Camera</span>
          </button>

          <button
            onClick={() => {
              setUserRole('ambulance')
              setActiveView('ambulances')
            }}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Ambulance className="w-3.5 h-3.5" />
            <span>Open Ambulance Desk</span>
          </button>

          <button
            onClick={() => {
              setUserRole('hospital')
              setActiveView('hospitals')
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Open Hospital Desk</span>
          </button>
        </div>
      </div>
    </div>
  )
}

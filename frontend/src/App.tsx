import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Bone,
  Brain,
  Check,
  ChevronDown,
  CircleUserRound,
  ClipboardCheck,
  CloudOff,
  Droplets,
  Dumbbell,
  Eye,
  FileHeart,
  FlaskConical,
  Gauge,
  HeartPulse,
  History,
  House,
  Info,
  Leaf,
  LifeBuoy,
  Menu,
  Moon,
  MoreHorizontal,
  Radio,
  Search,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Thermometer,
  Timer,
  TrendingUp,
  Utensils,
  Waves,
  Wind,
  X,
  Zap,
} from "lucide-react";
import AnatomyMap from "./features/body-explorer/components/AnatomyMap";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  bodySystems,
  environmentReadings,
  healthReadings,
  radiationRecord,
  trendData,
  type BodyRegion,
  type ReadingMethod,
} from "./data";

type Page =
  | "Mission Overview"
  | "Body Explorer"
  | "Health Check-in"
  | "Research & Environment"
  | "Emergency";

const nav: { label: Page; icon: typeof House }[] = [
  { label: "Mission Overview", icon: House },
  { label: "Body Explorer", icon: CircleUserRound },
  { label: "Health Check-in", icon: ClipboardCheck },
  { label: "Research & Environment", icon: FlaskConical },
];

const iconMap = {
  heart: HeartPulse,
  pressure: Gauge,
  glucose: Droplets,
  temperature: Thermometer,
  oxygen: Wind,
  sleep: Moon,
};

function DemoBadge() {
  return <span className="demo-badge">Demonstration data</span>;
}

function SalorisMark({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      className={compact ? "saloris-mark compact" : "saloris-mark"}
      viewBox="0 0 52 52"
      role="img"
      aria-label="SALORIS"
    >
      <path className="saloris-orbit" d="M7 28C11 12 30 4 43 14c8 7 5 18-6 24C26 44 12 39 7 28Z" />
      <path className="saloris-horizon" d="M9 30c8-5 14-7 22-5 5 1 8 4 12 8" />
      <path className="saloris-pulse" d="M10 29h8l3-7 5 15 5-10 3 4h9" />
      <circle cx="40.5" cy="13.5" r="2.5" />
    </svg>
  );
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`panel ${className}`}>{children}</section>;
}

function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}

function ReadingCard({
  reading,
  index,
}: {
  reading: (typeof healthReadings)[number];
  index: number;
}) {
  const Icon = iconMap[reading.icon];
  return (
    <motion.article
      className="reading-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.045 }}
    >
      <div className="reading-top">
        <span className="metric-icon">
          <Icon size={18} />
        </span>
        <span className={`status status-${reading.status.toLowerCase().replace(" ", "-")}`}>
          {reading.status === "Attention" ? (
            <AlertTriangle size={12} />
          ) : reading.status === "Insufficient data" ? (
            <Info size={12} />
          ) : (
            <Check size={12} />
          )}
          {reading.status}
        </span>
      </div>
      <div className="metric-label">{reading.label}</div>
      <div className="metric-value">
        {reading.value} <span>{reading.unit}</span>
      </div>
      <div className="metric-meta">
        <span>{reading.method}</span>
        <span>
          {reading.source} Â· {reading.timestamp}
        </span>
      </div>
      {reading.simulated && <span className="simulation-label">SIMULATED Â· NOT VERIFIED</span>}
    </motion.article>
  );
}

function TrendChart({ mode = "area" }: { mode?: "area" | "line" }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      {mode === "area" ? (
        <AreaChart data={trendData} margin={{ top: 12, right: 4, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="trend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#28d9c2" stopOpacity=".32" />
              <stop offset="100%" stopColor="#28d9c2" stopOpacity="0" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#203549" vertical={false} strokeDasharray="3 5" />
          <XAxis dataKey="day" stroke="#6f889d" tickLine={false} axisLine={false} fontSize={11} />
          <YAxis
            domain={[60, 80]}
            stroke="#6f889d"
            tickLine={false}
            axisLine={false}
            fontSize={11}
          />
          <Tooltip
            contentStyle={{ background: "#102233", border: "1px solid #28445a", borderRadius: 10 }}
          />
          <Area
            type="monotone"
            dataKey="heart"
            stroke="#28d9c2"
            strokeWidth={2.5}
            fill="url(#trend)"
          />
        </AreaChart>
      ) : (
        <LineChart data={trendData} margin={{ top: 12, right: 8, left: -25, bottom: 0 }}>
          <CartesianGrid stroke="#203549" vertical={false} strokeDasharray="3 5" />
          <XAxis dataKey="day" stroke="#6f889d" tickLine={false} axisLine={false} fontSize={11} />
          <YAxis stroke="#6f889d" tickLine={false} axisLine={false} fontSize={11} />
          <Tooltip
            contentStyle={{ background: "#102233", border: "1px solid #28445a", borderRadius: 10 }}
          />
          <Line
            type="monotone"
            dataKey="sleep"
            stroke="#70a7ff"
            strokeWidth={2.5}
            dot={{ fill: "#70a7ff", r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="stress"
            stroke="#f4b860"
            strokeWidth={2.5}
            dot={{ fill: "#f4b860", r: 3 }}
          />
        </LineChart>
      )}
    </ResponsiveContainer>
  );
}

function Overview({ navigate }: { navigate: (p: Page) => void }) {
  const attentionCount = healthReadings.filter((reading) => reading.status === "Attention").length;
  const staleCount = healthReadings.filter((reading) => reading.freshness !== "Current").length;
  return (
    <>
      <PageHeader
        eyebrow="Mission day 184 Â· Sol transit phase"
        title="Good morning, Commander Chen."
        description="Review recorded measurements, data quality and pending actions for Ares Transit 01."
        action={
          <button className="primary-btn" onClick={() => navigate("Health Check-in")}>
            <ClipboardCheck size={17} /> Start check-in
          </button>
        }
      />
      <div className="demo-strip">
        <Info size={15} />
        <span>
          This prototype uses clearly labelled demonstration data. It does not provide a diagnosis
          or replace mission medical personnel.
        </span>
        <DemoBadge />
      </div>
      <div className="mission-summary">
        <Panel className="astronaut-summary">
          <div className="profile-avatar">MC</div>
          <div>
            <span className="eyebrow">Active crew profile</span>
            <h2>Commander Maya Chen</h2>
            <p>Flight crew Â· Ares Transit 01</p>
          </div>
          <div className="mission-duration">
            <small>Mission duration</small>
            <strong>184 days</strong>
            <span>Transit phase Â· 61% complete</span>
          </div>
        </Panel>
        <Panel className="data-coverage-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Measurement coverage</span>
              <h2>Transparent record status</h2>
            </div>
            <Activity />
          </div>
          <div className="coverage-grid">
            <div>
              <strong>{healthReadings.length}</strong>
              <span>sample readings available</span>
            </div>
            <div className="attention">
              <strong>{attentionCount}</strong>
              <span>requires attention</span>
            </div>
            <div className="stale">
              <strong>{staleCount}</strong>
              <span>outdated or missing</span>
            </div>
          </div>
          <p className="coverage-note">
            <Info size={15} /> Statuses describe data availability in this prototype, not medical
            clearance.
          </p>
        </Panel>
      </div>
      <div className="overview-grid overview-context">
        <Panel className="mission-card">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Artemis transit habitat</span>
              <h2>Cabin environment</h2>
            </div>
            <span className="demo-badge">Simulated snapshot</span>
          </div>
          <div className="environment-values">
            {environmentReadings.map((r) => (
              <div key={r.label}>
                <small>{r.label}</small>
                <b>
                  {r.value}
                  <span> {r.unit}</span>
                </b>
              </div>
            ))}
          </div>
          <div className="radiation">
            <Zap size={17} />
            <div>
              <small>Radiation exposure Â· {radiationRecord.period}</small>
              <b>
                {radiationRecord.dose} {radiationRecord.unit}
              </b>
            </div>
            <span>No operational threshold applied</span>
          </div>
          <div className="source-line">
            <Radio size={13} /> Simulated environmental dataset Â· not a live sensor feed
          </div>
        </Panel>
        <Panel className="recent-checkin">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Recent check-in</span>
              <h2>Morning assessment</h2>
            </div>
            <span className="status status-normal">
              <Check size={12} /> Recorded
            </span>
          </div>
          <dl>
            <div>
              <dt>Recorded</dt>
              <dd>Today Â· 08:42</dd>
            </div>
            <div>
              <dt>Method</dt>
              <dd>Demonstration record</dd>
            </div>
            <div>
              <dt>Coverage</dt>
              <dd>5 vitals Â· sleep Â· mood</dd>
            </div>
          </dl>
          <button className="secondary-btn wide" onClick={() => navigate("Health Check-in")}>
            Review or enter measurements <ArrowRight size={16} />
          </button>
        </Panel>
      </div>
      <div className="section-title">
        <div>
          <span className="eyebrow">Latest measurements</span>
          <h2>Health snapshot</h2>
        </div>
        <DemoBadge />
      </div>
      <div className="readings-grid">
        {healthReadings.map((r, i) => (
          <ReadingCard key={r.label} reading={r} index={i} />
        ))}
      </div>
      <div className="dashboard-lower">
        <Panel>
          <div className="panel-heading">
            <div>
              <span className="eyebrow">7-day trend</span>
              <h2>Resting heart rate</h2>
            </div>
            <span className="chart-value">
              72 <small>bpm</small>
            </span>
          </div>
          <TrendChart />
          <div className="chart-foot">
            <span>
              <i className="cyan-dot" /> Heart rate
            </span>
            <span>Historical simulated series Â· bpm</span>
          </div>
        </Panel>
        <Panel>
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Crew attention</span>
              <h2>Recent alerts</h2>
            </div>
            <Bell size={19} />
          </div>
          <div className="alert-item warning">
            <Moon />
            <div>
              <b>Sleep consistency</b>
              <p>Triggered by two simulated sleep entries below the crewâ€™s planned duration.</p>
              <small>Attention Â· latest source entry Today, 07:20</small>
            </div>
          </div>
          <div className="alert-item">
            <Check />
            <div>
              <b>Oxygen saturation is outdated</b>
              <p>
                No verified measurement source is connected. Record with an approved instrument if
                requested.
              </p>
              <small>Insufficient data Â· sample timestamp Today, 08:41</small>
            </div>
          </div>
          <button className="secondary-btn wide" onClick={() => navigate("Research & Environment")}>
            Review 3 pending health tasks <ArrowRight size={15} />
          </button>
        </Panel>
      </div>
    </>
  );
}

const checkFields = [
  [
    "Heart rate",
    "bpm",
    "Sit quietly for 5 minutes, then count or use an approved monitor.",
    "Shows cardiovascular workload and change from your personal baseline.",
  ],
  [
    "Blood pressure",
    "mmHg",
    "Support your arm at heart level and keep both feet still.",
    "Helps monitor cardiovascular adaptation and fluid shifts.",
  ],
  [
    "Blood glucose",
    "mg/dL",
    "Record meal timing and follow approved device instructions.",
    "Provides context for energy regulation and nutrition planning.",
  ],
  [
    "Body temperature",
    "Â°C",
    "Use the same approved method and measurement site when possible.",
    "A change may support review of illness, exertion or environment.",
  ],
  [
    "Oxygen saturation",
    "% SpOâ‚‚",
    "Warm your hand, remove nail obstruction and remain still.",
    "Supports assessment of oxygenation with symptoms and cabin readings.",
  ],
];

type CheckInForm = {
  heartRate: string;
  systolic: string;
  diastolic: string;
  glucose: string;
  temperature: string;
  oxygen: string;
  recordedAt: string;
  source: ReadingMethod;
};

const initialCheckIn: CheckInForm = {
  heartRate: "",
  systolic: "",
  diastolic: "",
  glucose: "",
  temperature: "",
  oxygen: "",
  recordedAt: new Date().toISOString().slice(0, 16),
  source: "Manual entry",
};

function CheckIn() {
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [form, setForm] = useState(initialCheckIn);
  const update = <K extends keyof CheckInForm>(key: K, value: CheckInForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };
  const enteredVitals = Object.entries(form)
    .filter(([key]) => !["recordedAt", "source"].includes(key))
    .some(([, value]) => value !== "");
  const canSubmit = enteredVitals && Boolean(form.recordedAt) && Boolean(form.source);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (!canSubmit) return;
    setSaved(true);
  };
  return (
    <>
      <PageHeader
        eyebrow="Guided collection"
        title="Health check-in"
        description="Record measurements with context. Values are saved locally in this prototype and require crew medical review."
        action={<div className="step-count">Step {step + 1} of 3</div>}
      />
      <div className="stepper">
        {["Vitals", "Recovery & mood", "Symptoms & habits"].map((s, i) => (
          <button
            key={s}
            className={i === step ? "active" : i < step ? "done" : ""}
            onClick={() => setStep(i)}
          >
            <span>{i < step ? <Check size={14} /> : i + 1}</span>
            {s}
          </button>
        ))}
      </div>
      <form onSubmit={submit}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="form-grid"
          >
            {step === 0 && (
              <>
                <Panel className="form-card collection-context">
                  <div>
                    <label htmlFor="measurement-source">Collection method and source</label>
                    <select
                      id="measurement-source"
                      value={form.source}
                      onChange={(event) => update("source", event.target.value as ReadingMethod)}
                    >
                      {[
                        "Manual entry",
                        "Wearable device",
                        "Medical instrument",
                        "Imported data",
                        "Simulated demonstration data",
                      ].map((source) => (
                        <option key={source}>{source}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="recorded-at">Date and time recorded</label>
                    <input
                      id="recorded-at"
                      type="datetime-local"
                      value={form.recordedAt}
                      onChange={(event) => update("recordedAt", event.target.value)}
                    />
                  </div>
                  <p className="form-help">
                    Selecting a device records the stated collection method only. No hardware is
                    connected to this prototype.
                  </p>
                </Panel>
                {checkFields.map(([label, unit, instruction, why]) => {
                  const field =
                    label === "Heart rate"
                      ? "heartRate"
                      : label === "Blood glucose"
                        ? "glucose"
                        : label === "Body temperature"
                          ? "temperature"
                          : "oxygen";
                  if (label === "Blood pressure") {
                    return (
                      <Panel key={label} className="form-card">
                        <label>
                          {label}
                          <span>Optional</span>
                        </label>
                        <div className="blood-pressure-inputs">
                          <label htmlFor="systolic">
                            Systolic
                            <input
                              id="systolic"
                              type="number"
                              inputMode="decimal"
                              value={form.systolic}
                              onChange={(event) => update("systolic", event.target.value)}
                              placeholder="â€”"
                            />
                          </label>
                          <span>/</span>
                          <label htmlFor="diastolic">
                            Diastolic
                            <input
                              id="diastolic"
                              type="number"
                              inputMode="decimal"
                              value={form.diastolic}
                              onChange={(event) => update("diastolic", event.target.value)}
                              placeholder="â€”"
                            />
                          </label>
                          <b>{unit}</b>
                        </div>
                        <details>
                          <summary>
                            <Info size={14} /> How to measure
                          </summary>
                          <p>{instruction}</p>
                          <small>Why it matters: {why}</small>
                        </details>
                      </Panel>
                    );
                  }
                  return (
                    <Panel key={label} className="form-card">
                      <label htmlFor={field}>
                        {label}
                        <span>Optional</span>
                      </label>
                      <div className="input-unit">
                        <input
                          id={field}
                          type="number"
                          inputMode="decimal"
                          step="any"
                          placeholder="Enter value"
                          value={form[field]}
                          onChange={(event) => update(field, event.target.value)}
                        />
                        <b>{unit}</b>
                      </div>
                      <details>
                        <summary>
                          <Info size={14} /> How to measure
                        </summary>
                        <p>{instruction}</p>
                        <small>Why it matters: {why}</small>
                      </details>
                    </Panel>
                  );
                })}
              </>
            )}
            {step === 1 && (
              <>
                <Panel className="form-card">
                  <label>Sleep duration</label>
                  <div className="input-unit">
                    <input type="number" step=".1" placeholder="7.5" />
                    <b>hours</b>
                  </div>
                  <label className="sub-label">Sleep quality</label>
                  <div className="choice-row">
                    {["Poor", "Fair", "Good", "Excellent"].map((x) => (
                      <button type="button" key={x}>
                        {x}
                      </button>
                    ))}
                  </div>
                </Panel>
                <Panel className="form-card">
                  <label>Mood</label>
                  <div className="scale">
                    {[1, 2, 3, 4, 5].map((x) => (
                      <button type="button" key={x}>
                        {x}
                      </button>
                    ))}
                  </div>
                  <small>1 = very low Â· 5 = very positive</small>
                  <label className="sub-label">Perceived stress</label>
                  <input type="range" min="0" max="10" defaultValue="3" />
                </Panel>
                <Panel className="form-card">
                  <label>Recovery note</label>
                  <textarea placeholder="Add context about sleep interruptions, workload or concernsâ€¦" />
                  <p className="form-help">
                    Self-reported wellbeing supports trend review but is not a mental health
                    diagnosis.
                  </p>
                </Panel>
              </>
            )}
            {step === 2 && (
              <>
                <Panel className="form-card">
                  <label>Symptoms</label>
                  <div className="check-list">
                    {[
                      "Headache",
                      "Dizziness",
                      "Nausea",
                      "Pain",
                      "Shortness of breath",
                      "None to report",
                    ].map((x) => (
                      <label key={x}>
                        <input type="checkbox" /> {x}
                      </label>
                    ))}
                  </div>
                </Panel>
                <Panel className="form-card">
                  <label>Exercise & nutrition</label>
                  <div className="stack-input">
                    <span>
                      Exercise
                      <input type="number" placeholder="45" />
                      <b>min</b>
                    </span>
                    <span>
                      Water
                      <input type="number" placeholder="2.1" />
                      <b>L</b>
                    </span>
                    <span>
                      Meals
                      <input type="number" placeholder="3" />
                      <b>logged</b>
                    </span>
                  </div>
                </Panel>
                <Panel className="form-card">
                  <label>Additional context</label>
                  <textarea placeholder="Describe any change from your normal baselineâ€¦" />
                  <p className="form-help">
                    New, severe or rapidly worsening symptoms should be escalated using mission
                    protocol.
                  </p>
                </Panel>
              </>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="form-actions">
          <button
            type="button"
            className="secondary-btn"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </button>
          {step < 2 ? (
            <button type="button" className="primary-btn" onClick={() => setStep((s) => s + 1)}>
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button
              className="primary-btn"
              aria-describedby={!canSubmit ? "save-requirement" : undefined}
            >
              Save local check-in <Check size={16} />
            </button>
          )}
        </div>
        {step === 2 && !canSubmit && (
          <p
            id="save-requirement"
            className={attempted ? "validation-note visible" : "validation-note"}
          >
            <AlertTriangle size={15} /> Enter at least one vital measurement in step 1 before
            saving.
          </p>
        )}
        {saved && (
          <div className="save-note" role="status">
            <Check size={16} /> Check-in stored in this browser session only. No server or medical
            system received it.
          </div>
        )}
      </form>
    </>
  );
}

function BodyExplorer({ navigate }: { navigate: (p: Page) => void }) {
  const [selected, setSelected] = useState<BodyRegion>("Heart");
  const [back, setBack] = useState(false);
  const detail = bodySystems[selected];
  return (
    <>
      <PageHeader
        eyebrow="Human systems"
        title="Interactive body explorer"
        description="Explore spaceflight-related health considerations by body region. Educational guidance only."
        action={<DemoBadge />}
      />
      <div className="body-layout">
        <Panel className="body-canvas">
          <div className="view-toggle">
            <button className={!back ? "active" : ""} onClick={() => setBack(false)}>
              Front
            </button>
            <button className={back ? "active" : ""} onClick={() => setBack(true)}>
              Back
            </button>
          </div>
          <AnatomyMap
            key={back ? "back" : "front"}
            selected={selected}
            onSelect={setSelected}
            view={back ? "back" : "front"}
          />
          <p>Select a highlighted region to explore</p>
        </Panel>
        <Panel className="body-info">
          <motion.div
            className="body-detail-content"
            key={selected}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div className="system-number">
              SALORIS / SYS-
              {String(Object.keys(bodySystems).indexOf(selected) + 1).padStart(2, "0")}
            </div>
            <span className="body-icon">
              <Activity />
            </span>
            <span className="eyebrow">{detail.system}</span>
            <h2>{selected}</h2>
            <div className="function-summary">
              <b>Primary function</b>
              <p>{detail.function}</p>
            </div>
            <div className="info-block risk">
              <AlertTriangle size={18} />
              <div>
                <b>Spaceflight consideration</b>
                <p>{detail.risk}</p>
              </div>
            </div>
            <div className="detail-list">
              <div>
                <b>Relevant hazards</b>
                <p>{detail.hazards}</p>
              </div>
              <div>
                <b>Relevant indicators</b>
                <p>{detail.indicators}</p>
              </div>
              <div>
                <b>Collection methods</b>
                <p>{detail.collection}</p>
              </div>
              <div>
                <b>Assessment limitations</b>
                <p>{detail.limits}</p>
              </div>
              <div>
                <b>Prevention and monitoring guidance</b>
                <p>{detail.guidance}</p>
              </div>
            </div>
            <div className="education-note">
              <Info size={16} />
              <p>
                Anatomical motion is illustrative only and is not a physiological measurement.
                Compare changes with your individual baseline and mission context.
              </p>
            </div>
            <button className="primary-btn wide" onClick={() => navigate("Health Check-in")}>
              Open {detail.assessment} <ArrowRight size={16} />
            </button>
          </motion.div>
        </Panel>
        <div className="region-pills">
          {(Object.keys(bodySystems) as BodyRegion[]).map((r) => (
            <button
              className={selected === r ? "active" : ""}
              onClick={() => setSelected(r)}
              key={r}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

const emergencies = [
  [
    "Cardiac emergency",
    "Stop activity, notify a crewmate and contact mission medical support immediately. Follow the approved chest-pain protocol.",
  ],
  [
    "Collapse or unconsciousness",
    "Call for crew assistance, initiate the mission emergency response and follow basic life-support protocol if trained.",
  ],
  [
    "Breathing difficulty",
    "Stop activity, move to a safe atmosphere if directed and contact mission medical support immediately.",
  ],
  [
    "Severe injury",
    "Activate crew emergency response and follow the authorised injury procedure using approved equipment.",
  ],
  [
    "Suspected hypoxia",
    "Alert the crew, verify cabin atmosphere using approved instrumentation and follow the hypoxia response protocol.",
  ],
  [
    "Other serious symptoms",
    "Stop activity, alert a crewmate and contact designated medical support using the mission priority channel.",
  ],
];

function Emergency() {
  const [active, setActive] = useState(0);
  const [activation, setActivation] = useState<"idle" | "confirm" | "demo">("idle");
  return (
    <>
      <div className="emergency-banner">
        <ShieldAlert />
        <div>
          <b>For immediate or life-threatening danger</b>
          <p>Activate your missionâ€™s emergency communication and crew response procedure now.</p>
        </div>
        <button onClick={() => setActivation("confirm")}>Activate SOS demo</button>
      </div>
      <PageHeader
        eyebrow="Crew medical response"
        title="Emergency assistance"
        description="Pre-authored quick-reference guidance. Follow the current, approved mission medical checklist over this prototype."
      />
      <div className="emergency-layout">
        <div className="emergency-list">
          {emergencies.map((e, i) => (
            <button
              className={active === i ? "active" : ""}
              onClick={() => setActive(i)}
              key={e[0]}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <b>{e[0]}</b>
              <ArrowRight size={17} />
            </button>
          ))}
        </div>
        <Panel className="protocol">
          <div className="protocol-head">
            <span>
              <AlertTriangle />
            </span>
            <div>
              <small>Quick protocol Â· {String(active + 1).padStart(2, "0")}</small>
              <h2>{emergencies[active][0]}</h2>
            </div>
          </div>
          <div className="do-now">
            <b>Immediate actions</b>
            <p>{emergencies[active][1]}</p>
          </div>
          <ol>
            <li>
              <span>1</span>
              <div>
                <b>Ensure scene safety</b>
                <p>Confirm the area is safe for the affected crewmember and responders.</p>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <b>Call and escalate</b>
                <p>
                  Notify the crew medical officer and mission control using the priority channel.
                </p>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <b>Use the approved checklist</b>
                <p>Open the current onboard procedure. Record onset time and observable changes.</p>
              </div>
            </li>
          </ol>
          <div className="source-box">
            <FileHeart size={18} />
            <div>
              <b>Protocol governance</b>
              <p>
                Prototype wording for demonstration. Operational content must be authored, sourced,
                version-controlled and approved by mission medical leadership.
              </p>
              <small>Review status: DEMO ONLY Â· Version 0.9</small>
            </div>
          </div>
          <p className="no-medication">
            SALORIS does not provide medication or dosing instructions and does not infer a
            diagnosis.
          </p>
          <div className="incident-summary">
            <div>
              <span className="eyebrow">Structured incident summary</span>
              <h3>{emergencies[active][0]}</h3>
            </div>
            <dl>
              <div>
                <dt>Category</dt>
                <dd>{emergencies[active][0]}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>Ares Transit 01 Â· crew habitat</dd>
              </div>
              <div>
                <dt>Communication</dt>
                <dd>
                  {activation === "demo" ? "Demonstration event created locally" : "Not activated"}
                </dd>
              </div>
              <div>
                <dt>Operational status</dt>
                <dd>No emergency signal has been transmitted</dd>
              </div>
            </dl>
          </div>
        </Panel>
      </div>
      {activation === "confirm" && (
        <div className="confirmation-backdrop" role="presentation">
          <section
            className="confirmation-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-sos-title"
          >
            <ShieldAlert size={28} />
            <span className="eyebrow">Deliberate confirmation</span>
            <h2 id="confirm-sos-title">Create a demonstration SOS event?</h2>
            <p>
              This prototype cannot contact mission control, medical support, or emergency services.
              Use the authorised mission communication system for a real emergency.
            </p>
            <div>
              <button className="secondary-btn" onClick={() => setActivation("idle")}>
                Cancel
              </button>
              <button className="danger-btn" onClick={() => setActivation("demo")}>
                Confirm demo event
              </button>
            </div>
          </section>
        </div>
      )}
      {activation === "demo" && (
        <div className="demo-emergency-status" role="status">
          <Info size={17} />
          <div>
            <b>Demonstration event created locally</b>
            <p>
              No signal was transmitted. Follow authorised mission protocol for a real emergency.
            </p>
          </div>
          <button onClick={() => setActivation("idle")} aria-label="Dismiss demonstration status">
            <X size={17} />
          </button>
        </div>
      )}
    </>
  );
}

function Analytics() {
  const [range, setRange] = useState("7 days");
  return (
    <>
      <PageHeader
        eyebrow="Longitudinal review"
        title="Health analytics"
        description="Compare trends against your individual baseline and add mission context before drawing conclusions."
        action={
          <div className="filter-row">
            {["7 days", "30 days", "Mission"].map((x) => (
              <button className={range === x ? "active" : ""} onClick={() => setRange(x)} key={x}>
                {x}
              </button>
            ))}
          </div>
        }
      />
      <div className="analytics-summary">
        {[
          ["72", "bpm", "Avg resting HR", "âˆ’2.1%"],
          ["7.3", "hours", "Avg sleep", "+4.2%"],
          ["3.1", "/ 10", "Avg stress", "âˆ’0.8"],
          ["97.8", "%", "Avg SpOâ‚‚", "Stable"],
        ].map((x) => (
          <Panel key={x[2]}>
            <small>{x[2]}</small>
            <strong>
              {x[0]} <span>{x[1]}</span>
            </strong>
            <b>{x[3]}</b>
          </Panel>
        ))}
      </div>
      <div className="analytics-grid">
        <Panel className="large-chart">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Physiological trend</span>
              <h2>Resting heart rate</h2>
            </div>
            <DemoBadge />
          </div>
          <TrendChart />
          <div className="baseline">
            <span>Personal demo baseline</span>
            <b>70 bpm</b>
          </div>
        </Panel>
        <Panel>
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Recovery</span>
              <h2>Sleep & stress</h2>
            </div>
            <MoreHorizontal />
          </div>
          <TrendChart mode="line" />
          <div className="legend">
            <span>
              <i className="blue-dot" /> Sleep (hours)
            </span>
            <span>
              <i className="amber-dot" /> Stress (/10)
            </span>
          </div>
        </Panel>
      </div>
      <Panel>
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Recorded history</span>
            <h2>Recent readings</h2>
          </div>
          <button className="secondary-btn">
            <History size={15} /> Export demo record
          </button>
        </div>
        <div className="data-table">
          <div className="table-head">
            <span>Measurement</span>
            <span>Reading</span>
            <span>Method & source</span>
            <span>Recorded</span>
            <span>Status</span>
          </div>
          {healthReadings.map((r) => (
            <div className="table-row" key={r.label}>
              <b>{r.label}</b>
              <span>
                {r.value} {r.unit}
              </span>
              <span>
                <small>{r.method}</small>
                {r.source}
              </span>
              <span>{r.timestamp}</span>
              <span className="status">
                <i />
                {r.status}
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

function Wellbeing() {
  const [mood, setMood] = useState(4);
  return (
    <>
      <PageHeader
        eyebrow="Behavioural health"
        title="Mental wellbeing"
        description="Private, routine reflection to notice changes in mood, stress, sleep and connection over time."
        action={<DemoBadge />}
      />
      <div className="wellbeing-grid">
        <Panel className="mood-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Todayâ€™s reflection</span>
              <h2>How are you feeling?</h2>
            </div>
            <Sparkles />
          </div>
          <div className="mood-picker">
            {["Very low", "Low", "Neutral", "Good", "Strong"].map((x, i) => (
              <button className={mood === i ? "active" : ""} onClick={() => setMood(i)} key={x}>
                <span>{i + 1}</span>
                {x}
              </button>
            ))}
          </div>
          <label>Whatâ€™s influencing this today?</label>
          <textarea placeholder="Optional private noteâ€¦" />
          <button className="primary-btn">Save reflection</button>
        </Panel>
        <Panel>
          <span className="eyebrow">Wellbeing pulse</span>
          <h2>7-day balance</h2>
          <div className="wellbeing-score">
            <strong>78</strong>
            <span>
              Stable
              <br />
              <small>+6 this week</small>
            </span>
          </div>
          <div className="well-bars">
            <div>
              <span>Sleep consistency</span>
              <i>
                <b style={{ width: "74%" }} />
              </i>
              <strong>74%</strong>
            </div>
            <div>
              <span>Stress recovery</span>
              <i>
                <b style={{ width: "81%" }} />
              </i>
              <strong>81%</strong>
            </div>
            <div>
              <span>Social connection</span>
              <i>
                <b style={{ width: "86%" }} />
              </i>
              <strong>86%</strong>
            </div>
          </div>
        </Panel>
      </div>
      <div className="resource-grid">
        <Panel>
          <Waves />
          <h3>2-minute reset</h3>
          <p>Follow a paced breathing guide before your next task block.</p>
          <button className="text-btn">
            Begin exercise <ArrowRight size={14} />
          </button>
        </Panel>
        <Panel>
          <CircleUserRound />
          <h3>Crew connection</h3>
          <p>Schedule a short check-in with a crewmate or support contact.</p>
          <button className="text-btn">
            View connection plan <ArrowRight size={14} />
          </button>
        </Panel>
        <Panel>
          <Moon />
          <h3>Sleep wind-down</h3>
          <p>Reduce stimulation and prepare your scheduled sleep environment.</p>
          <button className="text-btn">
            Open routine <ArrowRight size={14} />
          </button>
        </Panel>
      </div>
      <div className="support-note">
        <LifeBuoy />
        <div>
          <b>You do not have to manage distress alone.</b>
          <p>
            For persistent low mood, severe distress, thoughts of self-harm or concern about a
            crewmate, contact mission medical support using the approved confidential pathway.
          </p>
        </div>
      </div>
    </>
  );
}

function Tasks() {
  const [done, setDone] = useState([true, true, false, false, false]);
  const tasks = [
    [Dumbbell, "Resistance exercise", "45 min Â· before 13:00"],
    [Droplets, "Hydration target", "2.0 of 2.5 L"],
    [Utensils, "Nutrition log", "Log midday meal"],
    [Moon, "Sleep preparation", "Begin at 21:30"],
    [Stethoscope, "Evening measurements", "HR Â· BP Â· symptoms"],
  ];
  return (
    <>
      <PageHeader
        eyebrow="Mission day 184"
        title="Daily health tasks"
        description="Small, consistent actions protect performance and make changes easier to notice."
        action={
          <div className="streak">
            <Zap size={17} /> 12 day streak
          </div>
        }
      />
      <div className="task-progress">
        <div>
          <span className="eyebrow">Todayâ€™s progress</span>
          <strong>
            {done.filter(Boolean).length}
            <small> / {tasks.length} complete</small>
          </strong>
        </div>
        <div
          className="ring"
          style={
            {
              "--progress": `${(done.filter(Boolean).length / tasks.length) * 360}deg`,
            } as React.CSSProperties
          }
        >
          <span>{Math.round((done.filter(Boolean).length / tasks.length) * 100)}%</span>
        </div>
        <div>
          <b>Keep your rhythm</b>
          <p>Complete 3 more tasks to close todayâ€™s health plan.</p>
        </div>
      </div>
      <div className="tasks-layout">
        <Panel>
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Schedule</span>
              <h2>Todayâ€™s plan</h2>
            </div>
            <span>Local mission time</span>
          </div>
          <div className="task-list">
            {tasks.map(([Icon, label, meta], i) => (
              <button
                className={done[i] ? "done" : ""}
                onClick={() => setDone((d) => d.map((x, j) => (j === i ? !x : x)))}
                key={label as string}
              >
                <span className="task-check">{done[i] && <Check size={15} />}</span>
                <span className="task-icon">
                  <Icon size={18} />
                </span>
                <span>
                  <b>{label as string}</b>
                  <small>{meta as string}</small>
                </span>
                <ChevronDown size={16} />
              </button>
            ))}
          </div>
        </Panel>
        <Panel>
          <span className="eyebrow">Weekly mission</span>
          <h2>Countermeasure consistency</h2>
          <div className="week-grid">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <span className={i < 5 ? "complete" : i === 5 ? "today" : ""} key={i}>
                {d}
                <i>{i < 5 ? <Check size={13} /> : i + 1}</i>
              </span>
            ))}
          </div>
          <div className="achievement">
            <Bone />
            <div>
              <b>Steady foundation</b>
              <p>5 days of exercise and nutrition consistency.</p>
            </div>
          </div>
          <div className="points">
            <span>Weekly health points</span>
            <strong>
              840 <small>/ 1,000</small>
            </strong>
            <i>
              <b />
            </i>
          </div>
        </Panel>
      </div>
    </>
  );
}

const locations = [
  ["Spacecraft", "Confined volume, elevated COâ‚‚ pockets, radiation and disrupted day/night cues."],
  ["Space station", "Long-duration microgravity, deconditioning, isolation and equipment noise."],
  ["Rover", "Restricted movement, suit operations, dust transfer and communication delay."],
  ["Lunar base", "Partial gravity, abrasive dust, radiation and pressure-boundary operations."],
  ["Mars base", "Partial gravity, high autonomy, communication delay, radiation and isolation."],
];

function Environment() {
  const [place, setPlace] = useState(0);
  return (
    <>
      <PageHeader
        eyebrow="Context-aware monitoring"
        title="Mission environment"
        description="Health data gains meaning when considered alongside habitat, workload and environmental exposure."
        action={
          <span className="live-indicator">
            <i /> Sensor feed Â· demo live
          </span>
        }
      />
      <div className="location-tabs">
        {locations.map((l, i) => (
          <button className={place === i ? "active" : ""} onClick={() => setPlace(i)} key={l[0]}>
            {l[0]}
          </button>
        ))}
      </div>
      <Panel className="habitat-hero">
        <div>
          <span className="eyebrow">Active environment</span>
          <h2>{locations[place][0]}</h2>
          <p>{locations[place][1]}</p>
          <div className="hazard-tags">
            <span>Radiation</span>
            <span>Atmosphere</span>
            <span>Deconditioning</span>
          </div>
        </div>
        <div className="habitat-visual">
          <Radio />
          <span className="orbit one" />
          <span className="orbit two" />
          <small>HAB / 04</small>
        </div>
      </Panel>
      <div className="environment-grid">
        {environmentReadings.map((r, i) => (
          <Panel key={r.label}>
            <div className="metric-icon">
              {i === 0 ? <Wind /> : i === 1 ? <CloudOff /> : <Gauge />}
            </div>
            <small>{r.label}</small>
            <strong>
              {r.value} <span>{r.unit}</span>
            </strong>
            <b className="normal">
              <i /> Within demo range
            </b>
            <div className="metric-meta">
              <span>{r.source}</span>
              <span>{r.timestamp}</span>
            </div>
          </Panel>
        ))}
      </div>
      <div className="env-lower">
        <Panel>
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Exposure</span>
              <h2>Radiation record</h2>
            </div>
            <Zap />
          </div>
          <div className="radiation-big">
            <strong>{radiationRecord.dose}</strong>
            <span>
              {radiationRecord.unit}
              <small>{radiationRecord.period}</small>
            </span>
          </div>
          <div className="progress">
            <i style={{ width: "42%" }} />
          </div>
          <p className="form-help">
            {radiationRecord.method} Â· {radiationRecord.source} Â· {radiationRecord.timestamp}
          </p>
        </Panel>
        <Panel>
          <span className="eyebrow">Monitoring priorities</span>
          <h2>{locations[place][0]} health context</h2>
          <ul className="priority-list">
            <li>
              <Check /> Review atmosphere alongside respiratory symptoms.
            </li>
            <li>
              <Check /> Track cumulative radiation exposure.
            </li>
            <li>
              <Check /> Maintain scheduled exercise countermeasures.
            </li>
            <li>
              <Check /> Note workload, suit use and sleep disruption.
            </li>
          </ul>
        </Panel>
      </div>
    </>
  );
}

const hazards = [
  [
    "Radiation",
    "Beyond Earthâ€™s protective magnetic field, ionising radiation can increase long-term health risks.",
  ],
  [
    "Isolation & confinement",
    "Limited space, separation and operational stress can affect behavioural health and team performance.",
  ],
  [
    "Distance from Earth",
    "Communication delays and limited evacuation increase the need for crew autonomy and robust procedures.",
  ],
  [
    "Gravity fields",
    "Transitions between microgravity and partial gravity affect bones, muscles, balance and cardiovascular function.",
  ],
  [
    "Hostile environments",
    "Closed habitats, dust, pressure boundaries and limited resources create complex exposure risks.",
  ],
];

function Research() {
  const [query, setQuery] = useState("");
  const filtered = hazards.filter((h) => h.join(" ").toLowerCase().includes(query.toLowerCase()));
  return (
    <>
      <PageHeader
        eyebrow="Evidence library"
        title="Research centre"
        description="Plain-language learning grounded in public human spaceflight research from NASA and the Canadian Space Agency."
      />
      <div className="research-search">
        <Search size={18} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search hazards, body systems or monitoring methodsâ€¦"
        />
        <span>Offline library available</span>
      </div>
      <div className="five-hazards">
        <span className="eyebrow">The five hazards of human spaceflight</span>
        <h2>Understand the mission context</h2>
        <div className="hazard-grid">
          {filtered.map((h, i) => (
            <article key={h[0]}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <h3>{h[0]}</h3>
              <p>{h[1]}</p>
              <button className="text-btn">
                Explore evidence <ArrowRight size={14} />
              </button>
            </article>
          ))}
        </div>
      </div>
      <div className="reference-grid">
        <Panel>
          <div className="source-logo">NASA</div>
          <div>
            <span className="eyebrow">Public reference</span>
            <h3>Human Research Program</h3>
            <p>Research on risks to human health and performance during space exploration.</p>
            <a href="https://www.nasa.gov/hrp/" target="_blank" rel="noreferrer">
              Visit source <ArrowRight size={13} />
            </a>
          </div>
        </Panel>
        <Panel>
          <div className="source-logo csa">CSA</div>
          <div>
            <span className="eyebrow">Public reference</span>
            <h3>Health science in space</h3>
            <p>Canadian research into astronaut health, ageing and the effects of spaceflight.</p>
            <a
              href="https://www.asc-csa.gc.ca/eng/sciences/health.asp"
              target="_blank"
              rel="noreferrer"
            >
              Visit source <ArrowRight size={13} />
            </a>
          </div>
        </Panel>
      </div>
      <div className="research-disclaimer">
        <Info />
        <p>
          References are provided for education and traceability. SALORIS is an independent concept
          and is not endorsed by NASA or the Canadian Space Agency. Content for operational use
          requires formal medical and mission review.
        </p>
      </div>
    </>
  );
}

const healthRisks = [
  "Immune-system changes",
  "Sensorimotor and vestibular changes",
  "Cardiovascular adaptations",
  "Decompression sickness",
  "Hypoxia",
  "Nutrition challenges",
  "Bone and muscle loss",
  "Spaceflight-associated neuro-ocular syndrome (SANS)",
  "Radiation exposure",
  "Sleep and circadian disruption",
  "Mental and behavioural health",
  "Teamwork and operational challenges",
];

function ResearchEnvironment() {
  const [query, setQuery] = useState("");
  const [done, setDone] = useState([true, false, false]);
  const filtered = hazards.filter((hazard) =>
    hazard.join(" ").toLowerCase().includes(query.toLowerCase()),
  );
  const tasks = [
    "Complete resistance exercise block",
    "Review hydration and nutrition log",
    "Record evening measurements",
  ];
  return (
    <>
      <PageHeader
        eyebrow="Mission context and evidence"
        title="Research & environment"
        description="Review spaceflight hazards, demonstration habitat indicators, health risks, evidence sources and todayâ€™s countermeasure tasks."
        action={<DemoBadge />}
      />
      <div className="research-search">
        <Search size={18} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search research library"
          placeholder="Search the five hazardsâ€¦"
        />
        <span>Offline references available</span>
      </div>
      <Panel className="environment-overview">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Habitat snapshot</span>
            <h2>Environmental indicators</h2>
          </div>
          <span className="simulation-label">SIMULATED Â· NOT A LIVE FEED</span>
        </div>
        <div className="environment-values environment-detailed">
          {environmentReadings.map((reading) => (
            <div key={reading.label}>
              <small>{reading.label}</small>
              <b>
                {reading.value} <span>{reading.unit}</span>
              </b>
              <p>
                {reading.source} Â· {reading.timestamp}
              </p>
            </div>
          ))}
          <div>
            <small>Radiation exposure</small>
            <b>
              {radiationRecord.dose} <span>{radiationRecord.unit}</span>
            </b>
            <p>
              {radiationRecord.source} Â· {radiationRecord.period}
            </p>
          </div>
        </div>
        <p className="coverage-note">
          <Info size={15} /> Values are demonstration records. SALORIS does not apply operational
          limits or medical thresholds.
        </p>
      </Panel>
      <div className="section-title">
        <div>
          <span className="eyebrow">NASA human research framework</span>
          <h2>The five hazards of human spaceflight</h2>
        </div>
      </div>
      <div className="hazard-grid">
        {filtered.map((hazard, index) => (
          <article key={hazard[0]}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{hazard[0]}</h3>
            <p>{hazard[1]}</p>
          </article>
        ))}
      </div>
      <div className="research-lower">
        <Panel>
          <span className="eyebrow">Physiological and behavioural risks</span>
          <h2>Monitoring priorities</h2>
          <div className="risk-list">
            {healthRisks.map((risk) => (
              <span key={risk}>
                <Activity size={14} />
                {risk}
              </span>
            ))}
          </div>
        </Panel>
        <Panel>
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Mission day 184</span>
              <h2>Pending health tasks</h2>
            </div>
            <b>
              {done.filter(Boolean).length}/{tasks.length}
            </b>
          </div>
          <div className="compact-task-list">
            {tasks.map((task, index) => (
              <button
                key={task}
                className={done[index] ? "done" : ""}
                onClick={() =>
                  setDone((current) =>
                    current.map((item, itemIndex) => (itemIndex === index ? !item : item)),
                  )
                }
              >
                <span>{done[index] && <Check size={15} />}</span>
                {task}
              </button>
            ))}
          </div>
          <p className="form-help">
            Task completion is stored only in the current browser session.
          </p>
        </Panel>
      </div>
      <div className="reference-grid">
        <Panel>
          <div className="source-logo">NASA</div>
          <div>
            <span className="eyebrow">Public reference</span>
            <h3>Human Research Program</h3>
            <p>Human health and performance risks during exploration missions.</p>
            <a href="https://www.nasa.gov/hrp/" target="_blank" rel="noreferrer">
              Visit source <ArrowRight size={13} />
            </a>
          </div>
        </Panel>
        <Panel>
          <div className="source-logo csa">CSA</div>
          <div>
            <span className="eyebrow">Public reference</span>
            <h3>Health science in space</h3>
            <p>Canadian research into astronaut health and spaceflight effects.</p>
            <a
              href="https://www.asc-csa.gc.ca/eng/sciences/health.asp"
              target="_blank"
              rel="noreferrer"
            >
              Visit source <ArrowRight size={13} />
            </a>
          </div>
        </Panel>
      </div>
    </>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("Mission Overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 650);
    return () => window.clearTimeout(timer);
  }, []);
  const Current = useMemo(() => {
    if (page === "Mission Overview") return <Overview navigate={setPage} />;
    if (page === "Health Check-in") return <CheckIn />;
    if (page === "Body Explorer") return <BodyExplorer navigate={setPage} />;
    if (page === "Emergency") return <Emergency />;
    return <ResearchEnvironment />;
  }, [page]);
  const navigate = (next: Page) => {
    setPage(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <div className={`app-shell ${page === "Emergency" ? "emergency-mode" : ""}`}>
      <AnimatePresence>
        {loading && (
          <motion.div
            className="saloris-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <SalorisMark />
            <b>SALORIS</b>
            <span>Human Resilience Beyond the Horizon.</span>
            <i />
          </motion.div>
        )}
      </AnimatePresence>
      <aside className={menuOpen ? "open" : ""}>
        <div className="brand">
          <SalorisMark compact />
          <div className="brand-wordmark">
            <b>SALORIS</b>
            <small>HUMAN HEALTH SYSTEM</small>
          </div>
          <button className="mobile-close" onClick={() => setMenuOpen(false)}>
            <X />
          </button>
        </div>
        <div className="mission-id">
          <span>ACTIVE MISSION</span>
          <b>ARES / TRANSIT 01</b>
          <small>
            <i /> Mission day 184
          </small>
        </div>
        <nav aria-label="Primary navigation">
          {nav.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={page === label ? "active" : ""}
              onClick={() => navigate(label)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="sync-card" onClick={() => setOffline(!offline)}>
            {offline ? <CloudOff /> : <Radio />}
            <span>
              <b>{offline ? "Offline mode" : "Demo dataset ready"}</b>
              <small>{offline ? "Local library available" : "No backend connected"}</small>
            </span>
            <MoreHorizontal />
          </button>
          <div className="profile">
            <span>MC</span>
            <div>
              <b>Maya Chen</b>
              <small>Mission commander</small>
            </div>
            <ChevronDown size={15} />
          </div>
        </div>
      </aside>
      {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} />}
      <div className="main-column">
        <div className="topbar">
          <button className="menu-btn" onClick={() => setMenuOpen(true)}>
            <Menu />
          </button>
          <div className="breadcrumb">
            <span>SALORIS</span>
            <b>/</b>
            {page}
          </div>
          <div className="top-actions">
            <button className="persistent-sos" onClick={() => navigate("Emergency")}>
              <ShieldAlert />
              SOS
            </button>
            <button aria-label="Search">
              <Search />
            </button>
            <button aria-label="Notifications">
              <Bell />
              <i />
            </button>
            <span className={offline ? "offline" : ""}>
              {offline ? <CloudOff /> : <Radio />}
              {offline ? "Offline Â· local mode" : "Local Â· demonstration data"}
            </span>
          </div>
        </div>
        <main id="main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.22 }}
            >
              {Current}
            </motion.div>
          </AnimatePresence>
        </main>
        <footer>
          <span>SALORIS Â· Human Resilience Beyond the Horizon.</span>
          <span>Independent decision support Â· Not NASA-endorsed Â· Not a diagnostic system</span>
        </footer>
      </div>
    </div>
  );
}


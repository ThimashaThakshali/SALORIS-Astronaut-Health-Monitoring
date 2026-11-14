import { useState } from "react";
import { Activity, ArrowRight, Check, Info } from "lucide-react";

import { DemoBadge } from "../../components/common/DemoBadge";
import { PageHeader } from "../../components/common/PageHeader";
import { Panel } from "../../components/common/Panel";

import { environmentReadings, radiationRecord } from "../../data";

// Describes the five major hazards of human spaceflight.
const hazards = [
  [
    "Radiation",
    "Beyond Earth's protective magnetic field, ionising radiation can increase long-term health risks.",
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

// Lists health risks associated with spaceflight.
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

// Displays research information and environmental context.
export function ResearchEnvironment() {
  // Stores the text entered into the research search box.
  const [query, setQuery] = useState("");

  // Stores the completion status of the three health tasks.
  const [done, setDone] = useState([true, false, false]);

  // Filters hazards based on the search text.
  const filtered = hazards.filter((hazard) =>
    hazard.join(" ").toLowerCase().includes(query.toLowerCase()),
  );

  // The health tasks displayed on this page.
  const tasks = [
    "Complete resistance exercise block",
    "Review hydration and nutrition log",
    "Record evening measurements",
  ];

  // Updates the completion status of one task.
  function toggleTask(index: number) {
    setDone((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? !item : item)),
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Mission context and evidence"
        title="Research & environment"
        description="Review spaceflight hazards, demonstration habitat indicators, health risks, evidence sources and today's countermeasure tasks."
        action={<DemoBadge />}
      />

      <div className="research-search">
        <Info size={18} />

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search research library"
          placeholder="Search the five hazards..."
        />

        <span>Offline references available</span>
      </div>

      <Panel className="environment-overview">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Habitat snapshot</span>
            <h2>Environmental indicators</h2>
          </div>

          <span className="simulation-label">SIMULATED · NOT A LIVE FEED</span>
        </div>

        <div className="environment-values environment-detailed">
          {environmentReadings.map((reading) => (
            <div key={reading.label}>
              <small>{reading.label}</small>

              <b>
                {reading.value} <span>{reading.unit}</span>
              </b>

              <p>
                {reading.source} · {reading.timestamp}
              </p>
            </div>
          ))}

          <div>
            <small>Radiation exposure</small>

            <b>
              {radiationRecord.dose} <span>{radiationRecord.unit}</span>
            </b>

            <p>
              {radiationRecord.source} · {radiationRecord.period}
            </p>
          </div>
        </div>

        <p className="coverage-note">
          <Info size={15} />
          Values are demonstration records. SALORIS does not apply operational
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

      {filtered.length === 0 && (
        <p>No matching hazards found. Try another search term.</p>
      )}

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
                onClick={() => toggleTask(index)}
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
            <p>
              Human health and performance risks during exploration missions.
            </p>

            <a
              href="https://www.nasa.gov/hrp/"
              target="_blank"
              rel="noreferrer"
            >
              Visit source <ArrowRight size={13} />
            </a>
          </div>
        </Panel>

        <Panel>
          <div className="source-logo csa">CSA</div>

          <div>
            <span className="eyebrow">Public reference</span>
            <h3>Health science in space</h3>
            <p>
              Canadian research into astronaut health and spaceflight effects.
            </p>

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

import { useState } from "react";
import { Check, CloudOff, Gauge, Radio, Wind, Zap } from "lucide-react";

import { PageHeader } from "../../components/common/PageHeader";
import { Panel } from "../../components/common/Panel";
import { environmentReadings, radiationRecord } from "../../data";

// Describes the different environments astronauts may work in.
const locations = [
  [
    "Spacecraft",
    "Confined volume, elevated CO₂ pockets, radiation and disrupted day/night cues.",
  ],
  [
    "Space station",
    "Long-duration microgravity, deconditioning, isolation and equipment noise.",
  ],
  [
    "Rover",
    "Restricted movement, suit operations, dust transfer and communication delay.",
  ],
  [
    "Lunar base",
    "Partial gravity, abrasive dust, radiation and pressure-boundary operations.",
  ],
  [
    "Mars base",
    "Partial gravity, high autonomy, communication delay, radiation and isolation.",
  ],
];

// Displays environmental readings and mission exposure information.
export function Environment() {
  // Stores the currently selected mission environment.
  const [place, setPlace] = useState(0);

  return (
    <>
      <PageHeader
        eyebrow="Context-aware monitoring"
        title="Mission environment"
        description="Health data gains meaning when considered alongside habitat, workload and environmental exposure."
        action={
          <span className="live-indicator">
            <i /> Sensor feed · demo live
          </span>
        }
      />

      <div className="location-tabs">
        {locations.map((location, index) => (
          <button
            className={place === index ? "active" : ""}
            onClick={() => setPlace(index)}
            key={location[0]}
          >
            {location[0]}
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
        {environmentReadings.map((reading, index) => (
          <Panel key={reading.label}>
            <div className="metric-icon">
              {index === 0 ? <Wind /> : index === 1 ? <CloudOff /> : <Gauge />}
            </div>

            <small>{reading.label}</small>

            <strong>
              {reading.value} <span>{reading.unit}</span>
            </strong>

            <b className="normal">
              <i /> Within demo range
            </b>

            <div className="metric-meta">
              <span>{reading.source}</span>
              <span>{reading.timestamp}</span>
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
            {radiationRecord.method} · {radiationRecord.source} ·{" "}
            {radiationRecord.timestamp}
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

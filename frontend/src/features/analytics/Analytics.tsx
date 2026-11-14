import { useState } from "react";
import { History, MoreHorizontal } from "lucide-react";

import { DemoBadge } from "../../components/common/DemoBadge";
import { PageHeader } from "../../components/common/PageHeader";
import { Panel } from "../../components/common/Panel";
import { TrendChart } from "../../components/common/TrendChart";
import { healthReadings } from "../../data";

// Displays health trends and previously recorded demonstration readings.
export function Analytics() {
  // Stores the currently selected time-range button.
  const [range, setRange] = useState("7 days");

  return (
    <>
      <PageHeader
        eyebrow="Longitudinal review"
        title="Health analytics"
        description="Compare trends against your individual baseline and add mission context before drawing conclusions."
        action={
          <div className="filter-row">
            {["7 days", "30 days", "Mission"].map((option) => (
              <button
                className={range === option ? "active" : ""}
                onClick={() => setRange(option)}
                key={option}
              >
                {option}
              </button>
            ))}
          </div>
        }
      />

      <div className="analytics-summary">
        {[
          ["72", "bpm", "Avg resting HR", "−2.1%"],
          ["7.3", "hours", "Avg sleep", "+4.2%"],
          ["3.1", "/ 10", "Avg stress", "−0.8"],
          ["97.8", "%", "Avg SpO₂", "Stable"],
        ].map((reading) => (
          <Panel key={reading[2]}>
            <small>{reading[2]}</small>

            <strong>
              {reading[0]} <span>{reading[1]}</span>
            </strong>

            <b>{reading[3]}</b>
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

          {healthReadings.map((reading) => (
            <div className="table-row" key={reading.label}>
              <b>{reading.label}</b>

              <span>
                {reading.value} {reading.unit}
              </span>

              <span>
                <small>{reading.method}</small>
                {reading.source}
              </span>

              <span>{reading.timestamp}</span>

              <span className="status">
                <i />
                {reading.status}
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

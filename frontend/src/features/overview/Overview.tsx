import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bell,
  Check,
  ClipboardCheck,
  Info,
  Radio,
  Moon,
  Zap,
} from "lucide-react";

import { DemoBadge } from "../../components/common/DemoBadge";
import { Panel } from "../../components/common/Panel";
import { PageHeader } from "../../components/common/PageHeader";
import { ReadingCard } from "../../components/common/ReadingCard";
import { TrendChart } from "../../components/common/TrendChart";

import { environmentReadings, healthReadings, radiationRecord } from "../../data";
import { getLatestHealthCheckIn } from "../../services/storage/localStorage";
import {
  acknowledgeAlert,
  ensureAstronaut,
  getAlerts,
  type HealthAlert,
} from "../../services/api/client";

import type { Page } from "../../types/navigation";

interface OverviewProps {
  navigate: (page: Page) => void;
}

// Displays the main mission dashboard.
export function Overview({ navigate }: OverviewProps) {
  const [backendAlerts, setBackendAlerts] = useState<HealthAlert[]>([]);
  const latestCheckIn = getLatestHealthCheckIn();

  useEffect(() => {
    let active = true;
    void ensureAstronaut()
      .then((astronaut) => getAlerts(astronaut.id))
      .then((alerts) => {
        if (active) setBackendAlerts(alerts);
      })
      .catch(() => {
        if (active) setBackendAlerts([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId);
      setBackendAlerts((alerts) =>
        alerts.map((alert) =>
          alert.id === alertId ? { ...alert, acknowledged: true } : alert,
        ),
      );
    } catch {
      // The static dashboard remains available when acknowledgement fails.
    }
  };

  const latestVitalsCount = latestCheckIn
    ? Object.values(latestCheckIn.vitals).filter((value) => value !== null).length
    : 0;

  // Count readings that need attention or are not current.
  const attentionCount = healthReadings.filter(
    (reading) => reading.status === "Attention",
  ).length;

  const staleCount = healthReadings.filter(
    (reading) => reading.freshness !== "Current",
  ).length;

  return (
    <>
      <PageHeader
        eyebrow="Mission day 184 Â· Sol transit phase"
        title="Good morning, Commander Chen."
        description="Review recorded measurements, data quality and pending actions for Ares Transit 01."
        action={
          <button
            className="primary-btn"
            onClick={() => navigate("Health Check-in")}
          >
            <ClipboardCheck size={17} />
            Start check-in
          </button>
        }
      />

      <div className="demo-strip">
        <Info size={15} />
        <span>
          This prototype uses clearly labelled demonstration data. It does not
          provide a diagnosis or replace mission medical personnel.
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
            <Info size={15} />
            Statuses describe data availability in this prototype, not medical
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
            {environmentReadings.map((reading) => (
              <div key={reading.label}>
                <small>{reading.label}</small>
                <b>
                  {reading.value}
                  <span> {reading.unit}</span>
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
            <Radio size={13} />
            Simulated environmental dataset Â· not a live sensor feed
          </div>
        </Panel>

        <Panel className="recent-checkin">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Recent check-in</span>
              <h2>{latestCheckIn ? "Latest saved assessment" : "No check-in yet"}</h2>
            </div>

            <span className="status status-normal">
              {latestCheckIn ? (
                <>
                  <Check size={12} />
                  Recorded
                </>
              ) : (
                "Not recorded"
              )}
            </span>
          </div>

          {latestCheckIn ? (
            <dl>
              <div>
                <dt>Recorded</dt>
                <dd>{new Date(latestCheckIn.recordedAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt>Method</dt>
                <dd>{latestCheckIn.source}</dd>
              </div>
              <div>
                <dt>Coverage</dt>
                <dd>{latestVitalsCount} vital measurements</dd>
              </div>
              <div>
                <dt>Data type</dt>
                <dd>{latestCheckIn.simulated ? "Simulated" : "Entered measurement"}</dd>
              </div>
            </dl>
          ) : (
            <p className="form-help">
              No locally saved check-in is available. Record measurements to see your latest entry here.
            </p>
          )}

          <button
            className="secondary-btn wide"
            onClick={() => navigate("Health Check-in")}
          >
            Review or enter measurements
            <ArrowRight size={16} />
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
        {healthReadings.map((reading, index) => (
          <ReadingCard key={reading.label} reading={reading} index={index} />
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

          {backendAlerts.length > 0
            ? backendAlerts.map((alert) => (
                <div
                  className={`alert-item ${
                    alert.severity.toLowerCase() === "warning" ? "warning" : ""
                  }`}
                  key={alert.id}
                >
                  <Bell />
                  <div>
                    <b>{alert.severity}</b>
                    <p>{alert.message}</p>
                    <small>
                      {alert.acknowledged ? "Acknowledged" : "Needs acknowledgement"}
                    </small>
                    {!alert.acknowledged && (
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => void handleAcknowledge(alert.id)}
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              ))
            : (
                <>
                  <div className="alert-item warning">
                    <Moon />
                    <div>
                      <b>Sleep consistency</b>
                      <p>
                        Triggered by two simulated sleep entries below the crew's
                        planned duration.
                      </p>
                      <small>Attention Â· latest source entry Today, 07:20</small>
                    </div>
                  </div>

                  <div className="alert-item">
                    <Check />
                    <div>
                      <b>Oxygen saturation is outdated</b>
                      <p>
                        No verified measurement source is connected. Record with an
                        approved instrument if requested.
                      </p>
                      <small>Insufficient data Â· sample timestamp Today, 08:41</small>
                    </div>
                  </div>
                </>
              )}

          <button
            className="secondary-btn wide"
            onClick={() => navigate("Research & Environment")}
          >
            Review 3 pending health tasks
            <ArrowRight size={15} />
          </button>
        </Panel>
      </div>
    </>
  );
}

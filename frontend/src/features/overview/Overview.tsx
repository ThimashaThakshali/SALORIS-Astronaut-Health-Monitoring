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

import {
  environmentReadings,
  healthReadings,
  radiationRecord,
  type ReadingMethod,
} from "../../data";
import { getLatestHealthCheckIn } from "../../services/storage/localStorage";
import {
  acknowledgeAlert,
  ensureAstronaut,
  getAlerts,
  getHealthReadings,
  type Astronaut,
  type HealthReadingRecord,
  type HealthAlert,
} from "../../services/api/client";

import type { Page } from "../../types/navigation";

interface OverviewProps {
  navigate: (page: Page) => void;
}

type AlertLoadState = "loading" | "loaded" | "unavailable";
type ReadingLoadState = "loading" | "loaded" | "unavailable";

function mapCollectionMethod(method: string): ReadingMethod {
  const normalized = method.toUpperCase();
  if (normalized.includes("WEARABLE")) return "Wearable device";
  if (normalized.includes("MEDICAL")) return "Medical instrument";
  if (normalized.includes("NASA")) return "Imported data";
  if (normalized.includes("SIMULATED")) return "Simulated demonstration data";
  return "Manual entry";
}

// Displays the main mission dashboard.
export function Overview({ navigate }: OverviewProps) {
  const [astronaut, setAstronaut] = useState<Astronaut | null>(null);
  const [backendAlerts, setBackendAlerts] = useState<HealthAlert[]>([]);
  const [backendReadings, setBackendReadings] = useState<HealthReadingRecord[]>(
    [],
  );
  const [alertLoadState, setAlertLoadState] =
    useState<AlertLoadState>("loading");
  const [readingLoadState, setReadingLoadState] =
    useState<ReadingLoadState>("loading");
  const [alertActionError, setAlertActionError] = useState("");
  const latestCheckIn = getLatestHealthCheckIn();

  useEffect(() => {
    let active = true;
    void ensureAstronaut().then(async (astronaut) => {
      const results = await Promise.allSettled([
        getAlerts(astronaut.id),
        getHealthReadings(astronaut.id),
      ]);

      if (!active) return;

      setAstronaut(astronaut);
      const [alertsResult, readingsResult] = results;
      if (alertsResult.status === "fulfilled") {
        setBackendAlerts(alertsResult.value);
        setAlertLoadState("loaded");
      } else {
        setBackendAlerts([]);
        setAlertLoadState("unavailable");
      }

      if (readingsResult.status === "fulfilled") {
        setBackendReadings(readingsResult.value);
        setReadingLoadState("loaded");
      } else {
        setBackendReadings([]);
        setReadingLoadState("unavailable");
      }
    }).catch(() => {
      if (active) {
        setBackendAlerts([]);
        setBackendReadings([]);
        setAlertLoadState("unavailable");
        setReadingLoadState("unavailable");
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const handleAcknowledge = async (alertId: string) => {
    setAlertActionError("");
    try {
      await acknowledgeAlert(alertId);
      setBackendAlerts((alerts) =>
        alerts.map((alert) =>
          alert.id === alertId ? { ...alert, acknowledged: true } : alert,
        ),
      );
    } catch {
      setAlertActionError(
        "This alert could not be acknowledged. Check the backend connection and try again.",
      );
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

  const latestBackendReadings = Array.from(
    backendReadings.reduce((latest, reading) => {
      const previous = latest.get(reading.indicator);
      if (
        !previous ||
        new Date(reading.recordedAt).getTime() >
          new Date(previous.recordedAt).getTime()
      ) {
        latest.set(reading.indicator, reading);
      }
      return latest;
    }, new Map<string, HealthReadingRecord>()),
  ).map(([, reading]) => reading);

  return (
    <>
      <PageHeader
        eyebrow="Mission day 184 Â· Sol transit phase"
        title={
          astronaut
            ? `Good morning, ${astronaut.callsign}.`
            : "Mission overview"
        }
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
          <div className="profile-avatar">{astronaut?.callsign ?? "—"}</div>

          <div>
            <span className="eyebrow">Active crew profile</span>
          <h2>
            {astronaut?.fullName ?? "Backend crew profile unavailable"}
          </h2>
          <p>
            {astronaut
              ? `Flight crew · ${astronaut.missionName}`
              : "Connect to the backend to load mission identity"}
          </p>
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

      {readingLoadState === "loaded" && latestBackendReadings.length > 0 ? (
        <div className="readings-grid">
          {latestBackendReadings.map((reading, index) => {
            const isStale =
              Date.now() - new Date(reading.recordedAt).getTime() >
              24 * 60 * 60 * 1000;
            return (
              <ReadingCard
                key={reading.id}
                index={index}
                reading={{
                  label: reading.indicator.replaceAll("_", " "),
                  value: String(reading.value),
                  unit: reading.unit,
                  status: "Insufficient data",
                  source: reading.source,
                  method: mapCollectionMethod(reading.collectionMethod),
                  timestamp: new Date(reading.recordedAt).toLocaleString(),
                  freshness: isStale ? "Outdated" : "Current",
                  simulated: reading.source === "SIMULATED",
                  icon: "heart",
                }}
              />
            );
          })}
        </div>
      ) : (
        <>
          {readingLoadState === "unavailable" && (
            <div className="demo-strip">
              <Info size={15} />
              <span>
                Backend readings are unavailable. The health snapshot below is
                simulated demonstration data, not a backend record.
              </span>
              <DemoBadge />
            </div>
          )}
          {readingLoadState === "loading" && (
            <p className="form-help">Loading backend readings...</p>
          )}
          <div className="readings-grid">
            {healthReadings.map((reading, index) => (
              <ReadingCard key={reading.label} reading={reading} index={index} />
            ))}
          </div>
        </>
      )}

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

          {alertLoadState === "loading" ? (
            <p className="form-help">Loading backend alerts...</p>
          ) : alertLoadState === "unavailable" ? (
            <>
              <div className="alert-item">
                <Info />
                <div>
                  <b>Backend alerts unavailable</b>
                  <p>
                    The following examples are simulated dashboard information,
                    not records from the Java backend.
                  </p>
                </div>
              </div>
              <div className="alert-item warning">
                <Moon />
                <div>
                  <b>Simulated example: sleep consistency</b>
                  <p>
                    Triggered by two simulated sleep entries below the crew's
                    planned duration.
                  </p>
                  <small>Demonstration data only</small>
                </div>
              </div>
              <div className="alert-item">
                <Check />
                <div>
                  <b>Simulated example: oxygen saturation outdated</b>
                  <p>
                    No verified measurement source is connected. Record with an
                    approved instrument if requested.
                  </p>
                  <small>Demonstration data only</small>
                </div>
              </div>
            </>
          ) : backendAlerts.length > 0
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
            : <p className="form-help">No backend alerts are recorded.</p>}

          {alertActionError && (
            <p className="field-error" role="alert">
              {alertActionError}
            </p>
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

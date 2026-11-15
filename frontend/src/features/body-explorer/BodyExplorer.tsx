import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Info,
  MousePointerClick,
} from "lucide-react";

import { DemoBadge } from "../../components/common/DemoBadge";
import { PageHeader } from "../../components/common/PageHeader";
import { Panel } from "../../components/common/Panel";
import AnatomyMap from "./components/AnatomyMap";
import { bodySystems, type BodyRegion } from "../../data";
import type { Page } from "../../types/navigation";
import {
  ensureAstronaut,
  getHealthReadings,
  type HealthReadingRecord,
} from "../../services/api/client";

const BODY_READING_INDICATORS: Partial<Record<BodyRegion, string[]>> = {
  Heart: [
    "HEART_RATE",
    "SYSTOLIC_BLOOD_PRESSURE",
    "DIASTOLIC_BLOOD_PRESSURE",
  ],
  Lungs: ["OXYGEN_SATURATION", "SPO2"],
  Blood: ["BLOOD_GLUCOSE", "BLOOD_SUGAR"],
};

// Displays the interactive human body explorer.
export function BodyExplorer({ navigate }: { navigate: (page: Page) => void }) {
  const [selected, setSelected] = useState<BodyRegion>("Heart");
  const [back, setBack] = useState(false);
  const [readings, setReadings] = useState<HealthReadingRecord[]>([]);
  const [readingsUnavailable, setReadingsUnavailable] = useState(false);

  const detail = bodySystems[selected];

  useEffect(() => {
    let active = true;
    void ensureAstronaut()
      .then((astronaut) => getHealthReadings(astronaut.id))
      .then((records) => {
        if (active) setReadings(records);
      })
      .catch(() => {
        if (active) setReadingsUnavailable(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const latestReadings = Array.from(
    readings.reduce((latest, reading) => {
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
  const relevantReadings = BODY_READING_INDICATORS[selected]
    ? latestReadings.filter((reading) =>
        BODY_READING_INDICATORS[selected]?.includes(reading.indicator),
      )
    : [];

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
          <div className="canvas-toolbar">
            <div className="view-toggle" role="group" aria-label="Body view">
              <button
                type="button"
                className={!back ? "active" : ""}
                aria-pressed={!back}
                onClick={() => setBack(false)}
              >
                Front
              </button>

              <button
                type="button"
                className={back ? "active" : ""}
                aria-pressed={back}
                onClick={() => setBack(true)}
              >
                Back
              </button>
            </div>

            <div className="canvas-hint">
              <MousePointerClick size={14} aria-hidden="true" />
              <span>Select a region to explore</span>
            </div>
          </div>

          <AnatomyMap
            key={back ? "back" : "front"}
            selected={selected}
            onSelect={setSelected}
            view={back ? "back" : "front"}
          />
        </Panel>

        <Panel className="body-info">
          <AnimatePresence mode="wait">
            <motion.div
              className="body-detail-content"
              key={selected}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.22 }}
            >
              <div className="system-number">
                SALORIS / SYS-
                {String(
                  Object.keys(bodySystems).indexOf(selected) + 1,
                ).padStart(2, "0")}
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

              <div className="info-block">
                <Activity size={18} />
                <div>
                  <b>Latest available readings</b>
                  {relevantReadings.length > 0 ? (
                    <ul>
                      {relevantReadings.map((reading) => {
                        const stale =
                          Date.now() - new Date(reading.recordedAt).getTime() >
                          24 * 60 * 60 * 1000;
                        return (
                          <li key={reading.id}>
                            {reading.indicator.replaceAll("_", " ")}:{" "}
                            {reading.value} {reading.unit} · {reading.source} ·{" "}
                            {stale ? "outdated" : "current"} ·{" "}
                            {new Date(reading.recordedAt).toLocaleString()}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p>
                      {readingsUnavailable
                        ? "Backend readings are unavailable. No live measurement is shown."
                        : BODY_READING_INDICATORS[selected]
                          ? "No relevant backend readings are available yet."
                          : "No direct backend indicator is mapped to this region yet."}
                    </p>
                  )}
                </div>
              </div>

              <div className="education-note">
                <Info size={16} />

                <p>
                  Original SALORIS schematic for educational use. Anatomical
                  motion is illustrative only and is not a physiological
                  measurement or telemetry. Compare changes with your individual
                  baseline and mission context.
                </p>
              </div>

              <button
                className="primary-btn wide"
                onClick={() => navigate("Health Check-in")}
              >
                Open {detail.assessment}
                <ArrowRight size={16} />
              </button>
            </motion.div>
          </AnimatePresence>
        </Panel>

        <div className="region-pills">
          {(Object.keys(bodySystems) as BodyRegion[]).map((region) => (
            <button
              type="button"
              className={selected === region ? "active" : ""}
              aria-pressed={selected === region}
              onClick={() => setSelected(region)}
              key={region}
            >
              {region}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

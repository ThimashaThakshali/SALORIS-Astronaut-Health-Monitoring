import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, ArrowRight, Check, Info } from "lucide-react";

import { Panel } from "../../components/common/Panel";
import { PageHeader } from "../../components/common/PageHeader";

import type { ReadingMethod } from "../../data";

// Instructions for collecting each vital measurement.
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
    "°C",
    "Use the same approved method and measurement site when possible.",
    "A change may support review of illness, exertion or environment.",
  ],
  [
    "Oxygen saturation",
    "% SpO₂",
    "Warm your hand, remove nail obstruction and remain still.",
    "Supports assessment of oxygenation with symptoms and cabin readings.",
  ],
];

// Describes the data collected in the vital measurements step.
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

// Initial values for a new check-in.
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

// Displays the three-step health check-in form.
export function CheckIn() {
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [form, setForm] = useState(initialCheckIn);

  // Updates one vital measurement without changing the other values.
  const update = <K extends keyof CheckInForm>(
    key: K,
    value: CheckInForm[K],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
  };

  // Check whether at least one vital measurement was entered.
  const enteredVitals = Object.entries(form)
    .filter(([key]) => !["recordedAt", "source"].includes(key))
    .some(([, value]) => value !== "");

  const canSubmit =
    enteredVitals && Boolean(form.recordedAt) && Boolean(form.source);

  // Handles the final form submission.
  const submit = (event: FormEvent) => {
    event.preventDefault();
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
        {["Vitals", "Recovery & mood", "Symptoms & habits"].map(
          (section, index) => (
            <button
              key={section}
              className={index === step ? "active" : index < step ? "done" : ""}
              onClick={() => setStep(index)}
            >
              <span>{index < step ? <Check size={14} /> : index + 1}</span>
              {section}
            </button>
          ),
        )}
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
            {/* Step 1: Record vital measurements. */}
            {step === 0 && (
              <>
                <Panel className="form-card collection-context">
                  <div>
                    <label htmlFor="measurement-source">
                      Collection method and source
                    </label>

                    <select
                      id="measurement-source"
                      value={form.source}
                      onChange={(event) =>
                        update("source", event.target.value as ReadingMethod)
                      }
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
                      onChange={(event) =>
                        update("recordedAt", event.target.value)
                      }
                    />
                  </div>

                  <p className="form-help">
                    Selecting a device records the stated collection method
                    only. No hardware is connected to this prototype.
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

                  // Blood pressure has two separate input fields.
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
                              onChange={(event) =>
                                update("systolic", event.target.value)
                              }
                              placeholder="—"
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
                              onChange={(event) =>
                                update("diastolic", event.target.value)
                              }
                              placeholder="—"
                            />
                          </label>

                          <b>{unit}</b>
                        </div>

                        <details>
                          <summary>
                            <Info size={14} />
                            How to measure
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
                          onChange={(event) =>
                            update(field, event.target.value)
                          }
                        />

                        <b>{unit}</b>
                      </div>

                      <details>
                        <summary>
                          <Info size={14} />
                          How to measure
                        </summary>

                        <p>{instruction}</p>
                        <small>Why it matters: {why}</small>
                      </details>
                    </Panel>
                  );
                })}
              </>
            )}

            {/* Step 2: Collect recovery and wellbeing information. */}
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
                    {["Poor", "Fair", "Good", "Excellent"].map((quality) => (
                      <button type="button" key={quality}>
                        {quality}
                      </button>
                    ))}
                  </div>
                </Panel>

                <Panel className="form-card">
                  <label>Mood</label>

                  <div className="scale">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button type="button" key={value}>
                        {value}
                      </button>
                    ))}
                  </div>

                  <small>1 = very low · 5 = very positive</small>

                  <label className="sub-label">Perceived stress</label>

                  <input type="range" min="0" max="10" defaultValue="3" />
                </Panel>

                <Panel className="form-card">
                  <label>Recovery note</label>

                  <textarea placeholder="Add context about sleep interruptions, workload or concerns…" />

                  <p className="form-help">
                    Self-reported wellbeing supports trend review but is not a
                    mental health diagnosis.
                  </p>
                </Panel>
              </>
            )}

            {/* Step 3: Record symptoms and daily habits. */}
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
                    ].map((symptom) => (
                      <label key={symptom}>
                        <input type="checkbox" />
                        {symptom}
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

                  <textarea placeholder="Describe any change from your normal baseline…" />

                  <p className="form-help">
                    New, severe or rapidly worsening symptoms should be
                    escalated using mission protocol.
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
            onClick={() => setStep((current) => current - 1)}
          >
            Back
          </button>

          {step < 2 ? (
            <button
              type="button"
              className="primary-btn"
              onClick={() => setStep((current) => current + 1)}
            >
              Continue
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              className="primary-btn"
              aria-describedby={!canSubmit ? "save-requirement" : undefined}
            >
              Save local check-in
              <Check size={16} />
            </button>
          )}
        </div>

        {step === 2 && !canSubmit && (
          <p
            id="save-requirement"
            className={
              attempted ? "validation-note visible" : "validation-note"
            }
          >
            <AlertTriangle size={15} />
            Enter at least one vital measurement in step 1 before saving.
          </p>
        )}

        {saved && (
          <div className="save-note" role="status">
            <Check size={16} />
            Check-in stored in this browser session only. No server or medical
            system received it.
          </div>
        )}
      </form>
    </>
  );
}

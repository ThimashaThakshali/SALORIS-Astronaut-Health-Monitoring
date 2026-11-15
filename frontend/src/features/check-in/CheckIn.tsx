import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, ArrowRight, Check, Info } from "lucide-react";

import { Panel } from "../../components/common/Panel";
import { PageHeader } from "../../components/common/PageHeader";
import type { ReadingMethod } from "../../data";
import {
  saveHealthCheckIn,
  type HealthCheckIn,
} from "../../services/storage/localStorage";
import {
  assessHealth,
  createHealthReading,
  createSymptom,
  createWellbeingCheckin,
  ensureAstronaut,
} from "../../services/api/client";

interface FormState {
  heartRate: string;
  systolic: string;
  diastolic: string;
  glucose: string;
  temperature: string;
  oxygen: string;
  recordedAt: string;
  source: ReadingMethod;
  sleepHours: string;
  sleepQuality: string;
  mood: string;
  stress: number;
  fatigue: number;
  recoveryNote: string;
  symptoms: string[];
  exerciseMinutes: string;
  waterLitres: string;
  meals: string;
  context: string;
}

function getLocalDateTimeInputValue(date = new Date()): string {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

const initialForm = (): FormState => ({
  heartRate: "",
  systolic: "",
  diastolic: "",
  glucose: "",
  temperature: "",
  oxygen: "",
  recordedAt: getLocalDateTimeInputValue(),
  source: "Manual entry",
  sleepHours: "",
  sleepQuality: "",
  mood: "",
  stress: 3,
  fatigue: 3,
  recoveryNote: "",
  symptoms: [],
  exerciseMinutes: "",
  waterLitres: "",
  meals: "",
  context: "",
});

const measurementFields = [
  {
    key: "heartRate",
    label: "Heart rate",
    unit: "bpm",
    instruction:
      "Sit quietly for 5 minutes, then count or use an approved monitor.",
    why: "Shows cardiovascular workload and changes from a personal baseline.",
    min: 20,
    max: 250,
  },
  {
    key: "glucose",
    label: "Blood glucose",
    unit: "mg/dL",
    instruction: "Record meal timing and follow approved device instructions.",
    why: "Provides context for energy regulation and nutrition planning.",
    min: 20,
    max: 600,
  },
  {
    key: "temperature",
    label: "Body temperature",
    unit: "°C",
    instruction:
      "Use the same approved method and measurement site when possible.",
    why: "Changes may support review of illness, exertion or environment.",
    min: 30,
    max: 45,
  },
  {
    key: "oxygen",
    label: "Oxygen saturation",
    unit: "% SpO2",
    instruction: "Warm your hand, remove nail obstruction and remain still.",
    why: "Supports assessment of oxygenation alongside symptoms and cabin readings.",
    min: 50,
    max: 100,
  },
] as const;

type MeasurementKey = (typeof measurementFields)[number]["key"];

function parseOptionalNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function CheckIn() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [attempted, setAttempted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [pendingSubmissionId, setPendingSubmissionId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
    setPendingSubmissionId(null);
    setSaveError("");
  };

  const numericFields = [
    { label: "Heart rate", value: form.heartRate, min: 20, max: 250 },
    { label: "Blood glucose", value: form.glucose, min: 20, max: 600 },
    { label: "Body temperature", value: form.temperature, min: 30, max: 45 },
    { label: "Oxygen saturation", value: form.oxygen, min: 50, max: 100 },
    { label: "Systolic pressure", value: form.systolic, min: 40, max: 300 },
    { label: "Diastolic pressure", value: form.diastolic, min: 20, max: 200 },
    { label: "Sleep duration", value: form.sleepHours, min: 0, max: 24 },
    {
      label: "Exercise duration",
      value: form.exerciseMinutes,
      min: 0,
      max: 1440,
    },
    { label: "Water intake", value: form.waterLitres, min: 0, max: 20 },
    { label: "Meals", value: form.meals, min: 0, max: 20 },
  ];

  const validationErrors = numericFields
    .filter(({ value, min, max }) => {
      if (value.trim() === "") return false;
      const number = Number(value);
      return !Number.isFinite(number) || number < min || number > max;
    })
    .map(
      ({ label, min, max }) => `${label} must be between ${min} and ${max}.`,
    );

  if ((form.systolic.trim() === "") !== (form.diastolic.trim() === "")) {
    validationErrors.push(
      "Enter both systolic and diastolic blood pressure values.",
    );
  }

  if (
    form.systolic.trim() !== "" &&
    form.diastolic.trim() !== "" &&
    Number(form.systolic) <= Number(form.diastolic)
  ) {
    validationErrors.push(
      "Systolic pressure must be greater than diastolic pressure.",
    );
  }

  const enteredVitals = [
    form.heartRate,
    form.systolic,
    form.diastolic,
    form.glucose,
    form.temperature,
    form.oxygen,
  ].some((value) => value.trim() !== "");

  const validDate =
    Boolean(form.recordedAt) &&
    !Number.isNaN(new Date(form.recordedAt).getTime()) &&
    new Date(form.recordedAt).getTime() <= Date.now();

  const fieldError = (label: string) =>
    validationErrors.find((error) => error.startsWith(`${label} `));

  const dateError = !validDate
    ? "Enter a valid recorded date and time that is not in the future."
    : "";

  const vitalLabels = [
    "Heart rate",
    "Blood glucose",
    "Body temperature",
    "Oxygen saturation",
    "Systolic pressure",
    "Diastolic pressure",
  ];

  const stepErrors =
    step === 0
      ? validationErrors.filter(
          (error) =>
            vitalLabels.some((label) => error.startsWith(label)) ||
            error.includes("blood pressure") ||
            error.includes("Systolic pressure must"),
        )
      : step === 1
        ? validationErrors.filter((error) => error.startsWith("Sleep duration"))
        : validationErrors;

  const canSubmit = enteredVitals && validDate && validationErrors.length === 0;

  // Explicitly move through the three existing steps.
  const handleContinue = () => {
    setAttempted(true);

    const hasStepError =
      stepErrors.length > 0 || (step === 0 && (!enteredVitals || !validDate));

    if (hasStepError) return;

    setAttempted(false);

    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      setStep(2);
    }
  };

  const toggleSymptom = (symptom: string) => {
    setForm((current) => {
      const selected = current.symptoms.includes(symptom)
        ? current.symptoms.filter((item) => item !== symptom)
        : [
            ...current.symptoms.filter((item) => item !== "None to report"),
            symptom,
          ];

      return {
        ...current,
        symptoms:
          symptom === "None to report"
            ? current.symptoms.includes(symptom)
              ? []
              : ["None to report"]
            : selected,
      };
    });
  };

  const saveCheckIn = async () => {
    setAttempted(true);
    setSaved(false);
    setSaveError("");

    if (step !== 2) {
      return;
    }

    if (!canSubmit) {
      setSaveError(
        "Please check your entries. At least one valid vital measurement and a valid recorded date are required, and entered values must be within the allowed ranges.",
      );
      return;
    }

    if (isSyncing) return;

    const submissionId = pendingSubmissionId ?? crypto.randomUUID();
    setPendingSubmissionId(submissionId);

    const record: HealthCheckIn = {
      id: submissionId,
      recordedAt: new Date(form.recordedAt).toISOString(),
      savedAt: new Date().toISOString(),
      source: form.source,
      simulated: form.source === "Simulated demonstration data",
      vitals: {
        heartRate: parseOptionalNumber(form.heartRate),
        systolic: parseOptionalNumber(form.systolic),
        diastolic: parseOptionalNumber(form.diastolic),
        glucose: parseOptionalNumber(form.glucose),
        temperature: parseOptionalNumber(form.temperature),
        oxygen: parseOptionalNumber(form.oxygen),
      },
      recovery: {
        sleepHours: parseOptionalNumber(form.sleepHours),
        sleepQuality: form.sleepQuality,
        mood: parseOptionalNumber(form.mood),
        stress: form.stress,
        fatigue: form.fatigue,
        note: form.recoveryNote.trim(),
      },
      symptoms: form.symptoms,
      habits: {
        exerciseMinutes: parseOptionalNumber(form.exerciseMinutes),
        waterLitres: parseOptionalNumber(form.waterLitres),
        meals: parseOptionalNumber(form.meals),
      },
      context: form.context.trim(),
    };

    try {
      saveHealthCheckIn(record);
    } catch {
      setSaveError(
        "The check-in could not be saved locally. Check your browser storage settings and try again.",
      );
      return;
    }

    setIsSyncing(true);
    try {
      const astronaut = await ensureAstronaut();
      const recordedAt = record.recordedAt;
      const source =
        form.source === "Manual entry"
          ? "MANUAL"
          : form.source === "Wearable device"
            ? "WEARABLE"
            : form.source === "Medical instrument"
              ? "MEDICAL_DEVICE"
              : form.source === "Imported data"
                ? "NASA_DATA"
                : "SIMULATED";
      const sleepQualityScore = {
        Poor: 1,
        Fair: 2,
        Good: 3,
        Excellent: 4,
      }[record.recovery.sleepQuality];
      const readings = [
        ["HEART_RATE", record.vitals.heartRate, "BPM"],
        ["SYSTOLIC_BLOOD_PRESSURE", record.vitals.systolic, "MMHG"],
        ["DIASTOLIC_BLOOD_PRESSURE", record.vitals.diastolic, "MMHG"],
        ["BLOOD_GLUCOSE", record.vitals.glucose, "MG/DL"],
        ["BODY_TEMPERATURE", record.vitals.temperature, "C"],
        ["OXYGEN_SATURATION", record.vitals.oxygen, "%"],
      ] as const;
      const readingResponses = await Promise.all(
        readings
          .filter(([, value]) => value !== null)
          .map(([indicator, value, unit]) =>
            createHealthReading({
              astronautId: astronaut.id,
              indicator,
              value: value as number,
              unit,
              recordedAt,
              source,
              collectionMethod: source === "MANUAL" ? "MANUAL_ENTRY" : source,
              context: record.context,
              idempotencyKey: `${record.id}:${indicator}`,
            }),
          ),
      );
      const wellbeingResponse = await createWellbeingCheckin({
        astronautId: astronaut.id,
        sleepHours: record.recovery.sleepHours ?? undefined,
        sleepQuality: sleepQualityScore,
        mood: record.recovery.mood ?? undefined,
        stress: record.recovery.stress,
        fatigue: record.recovery.fatigue,
        recordedAt,
        source,
        idempotencyKey: `${record.id}:wellbeing`,
      });
      const symptomResponses = await Promise.all(
        record.symptoms
          .filter((symptom) => symptom !== "None to report")
          .map((symptom, index) =>
            createSymptom({
              astronautId: astronaut.id,
              symptom,
              severity: 3,
              reportedAt: recordedAt,
              source,
              idempotencyKey: `${record.id}:symptom:${index}`,
            }),
          ),
      );
      await assessHealth({
        astronautId: astronaut.id,
        healthReadingIds: readingResponses.map((reading) => reading.id),
        wellbeingCheckinIds: [wellbeingResponse.id],
        symptomReportIds: symptomResponses.map((symptom) => symptom.id),
      });

      setSaved(true);
      setPendingSubmissionId(null);
      setAttempted(false);
      setForm(initialForm());
      setStep(0);
    } catch {
      setSaveError(
        "Saved locally, but the backend could not accept this check-in. Check the backend connection and try again.",
      );
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Guided collection"
        title="Health check-in"
        description="Record measurements with context. Entries are stored locally in this prototype and require crew medical review."
        action={<div className="step-count">Step {step + 1} of 3</div>}
      />

      <div className="stepper">
        {["Vitals", "Recovery & mood", "Symptoms & habits"].map(
          (section, index) => (
            <button
              key={section}
              type="button"
              className={index === step ? "active" : index < step ? "done" : ""}
              disabled={index > step}
              onClick={() => {
                if (index <= step) {
                  setAttempted(false);
                  setStep(index);
                }
              }}
            >
              <span>{index < step ? <Check size={14} /> : index + 1}</span>
              {section}
            </button>
          ),
        )}
      </div>

      <form onSubmit={(event) => event.preventDefault()}>
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
                      max={getLocalDateTimeInputValue()}
                      value={form.recordedAt}
                      onChange={(event) =>
                        update("recordedAt", event.target.value)
                      }
                    />
                    {attempted && dateError && (
                      <p className="field-error" role="alert">
                        {dateError}
                      </p>
                    )}
                  </div>

                  <p className="form-help">
                    Selecting a device records the stated collection method
                    only. No hardware is connected to this prototype.
                  </p>
                </Panel>

                {measurementFields.map((field) => (
                  <Panel key={field.key} className="form-card">
                    <label htmlFor={field.key}>
                      {field.label}
                      <span>Optional</span>
                    </label>

                    <div className="input-unit">
                      <input
                        id={field.key}
                        type="number"
                        inputMode="decimal"
                        step="any"
                        min={field.min}
                        max={field.max}
                        placeholder="Enter value"
                        value={form[field.key]}
                        onChange={(event) =>
                          update(
                            field.key as MeasurementKey,
                            event.target.value,
                          )
                        }
                      />
                      <b>{field.unit}</b>
                    </div>
                    {attempted && fieldError(field.label) && (
                      <p className="field-error" role="alert">
                        {fieldError(field.label)}
                      </p>
                    )}

                    <details>
                      <summary>
                        <Info size={14} /> How to measure
                      </summary>
                      <p>{field.instruction}</p>
                      <small>Why it matters: {field.why}</small>
                    </details>
                  </Panel>
                ))}

                <Panel className="form-card">
                  <label>
                    Blood pressure <span>Optional</span>
                  </label>
                  <div className="blood-pressure-inputs">
                    <label htmlFor="systolic">
                      Systolic
                      <input
                        id="systolic"
                        type="number"
                        min="40"
                        max="300"
                        value={form.systolic}
                        onChange={(event) =>
                          update("systolic", event.target.value)
                        }
                        placeholder="Enter value"
                      />
                    </label>
                    <span>/</span>
                    <label htmlFor="diastolic">
                      Diastolic
                      <input
                        id="diastolic"
                        type="number"
                        min="20"
                        max="200"
                        value={form.diastolic}
                        onChange={(event) =>
                          update("diastolic", event.target.value)
                        }
                        placeholder="Enter value"
                      />
                    </label>
                    <b>mmHg</b>
                  </div>
                  {attempted && fieldError("Systolic pressure") && (
                    <p className="field-error" role="alert">
                      {fieldError("Systolic pressure")}
                    </p>
                  )}
                  {attempted && fieldError("Diastolic pressure") && (
                    <p className="field-error" role="alert">
                      {fieldError("Diastolic pressure")}
                    </p>
                  )}
                  {attempted &&
                    validationErrors.some(
                      (error) =>
                        error.includes("blood pressure") ||
                        error.includes("Systolic pressure must"),
                    ) && (
                      <p className="field-error" role="alert">
                        {validationErrors.find(
                          (error) =>
                            error.includes("blood pressure") ||
                            error.includes("Systolic pressure must"),
                        )}
                      </p>
                    )}
                  <details>
                    <summary>
                      <Info size={14} /> How to measure
                    </summary>
                    <p>
                      Support your arm at heart level and keep both feet still.
                    </p>
                    <small>
                      Why it matters: Helps monitor cardiovascular adaptation
                      and fluid shifts.
                    </small>
                  </details>
                </Panel>
              </>
            )}

            {step === 1 && (
              <>
                <Panel className="form-card">
                  <label htmlFor="sleep-hours">Sleep duration</label>
                  <div className="input-unit">
                    <input
                      id="sleep-hours"
                      type="number"
                      min="0"
                      max="24"
                      step="0.1"
                      placeholder="7.5"
                      value={form.sleepHours}
                      onChange={(event) =>
                        update("sleepHours", event.target.value)
                      }
                    />
                    <b>hours</b>
                  </div>
                  {attempted && fieldError("Sleep duration") && (
                    <p className="field-error" role="alert">
                      {fieldError("Sleep duration")}
                    </p>
                  )}

                  <label className="sub-label">Sleep quality</label>
                  <div className="choice-row">
                    {["Poor", "Fair", "Good", "Excellent"].map((quality) => (
                      <button
                        type="button"
                        key={quality}
                        className={
                          form.sleepQuality === quality ? "active" : ""
                        }
                        aria-pressed={form.sleepQuality === quality}
                        onClick={() => update("sleepQuality", quality)}
                      >
                        {quality}
                      </button>
                    ))}
                  </div>
                </Panel>

                <Panel className="form-card">
                  <label>Mood</label>
                  <div className="scale">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        type="button"
                        key={value}
                        className={form.mood === String(value) ? "active" : ""}
                        aria-pressed={form.mood === String(value)}
                        onClick={() => update("mood", String(value))}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <small>1 = very low | 5 = very positive</small>

                  <label className="sub-label" htmlFor="stress">
                    Perceived stress: {form.stress}/5
                  </label>
                  <input
                    id="stress"
                    type="range"
                    min="1"
                    max="5"
                    value={form.stress}
                    onChange={(event) =>
                      update("stress", Number(event.target.value))
                    }
                  />
                  <label className="sub-label" htmlFor="fatigue">
                    Fatigue: {form.fatigue}/5
                  </label>
                  <input
                    id="fatigue"
                    type="range"
                    min="1"
                    max="5"
                    value={form.fatigue}
                    onChange={(event) =>
                      update("fatigue", Number(event.target.value))
                    }
                  />
                </Panel>

                <Panel className="form-card">
                  <label htmlFor="recovery-note">Recovery note</label>
                  <textarea
                    id="recovery-note"
                    value={form.recoveryNote}
                    onChange={(event) =>
                      update("recoveryNote", event.target.value)
                    }
                    placeholder="Add context about sleep interruptions, workload or concernsÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦"
                  />
                  <p className="form-help">
                    Self-reported wellbeing supports trend review but is not a
                    mental health diagnosis.
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
                    ].map((symptom) => (
                      <label key={symptom}>
                        <input
                          type="checkbox"
                          checked={form.symptoms.includes(symptom)}
                          onChange={() => toggleSymptom(symptom)}
                        />
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
                      <input
                        type="number"
                        min="0"
                        max="1440"
                        value={form.exerciseMinutes}
                        onChange={(event) =>
                          update("exerciseMinutes", event.target.value)
                        }
                        placeholder="45"
                      />
                      <b>min</b>
                    </span>
                    <span>
                      Water
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.1"
                        value={form.waterLitres}
                        onChange={(event) =>
                          update("waterLitres", event.target.value)
                        }
                        placeholder="2.1"
                      />
                      <b>L</b>
                    </span>
                    <span>
                      Meals
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={form.meals}
                        onChange={(event) =>
                          update("meals", event.target.value)
                        }
                        placeholder="3"
                      />
                      <b>logged</b>
                    </span>
                  </div>
                  {attempted && fieldError("Exercise duration") && (
                    <p className="field-error" role="alert">
                      {fieldError("Exercise duration")}
                    </p>
                  )}

                  {attempted && fieldError("Water intake") && (
                    <p className="field-error" role="alert">
                      {fieldError("Water intake")}
                    </p>
                  )}

                  {attempted && fieldError("Meals") && (
                    <p className="field-error" role="alert">
                      {fieldError("Meals")}
                    </p>
                  )}
                </Panel>

                <Panel className="form-card">
                  <label htmlFor="additional-context">Additional context</label>
                  <textarea
                    id="additional-context"
                    value={form.context}
                    onChange={(event) => update("context", event.target.value)}
                    placeholder="Describe any change from your normal baselineÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦"
                  />
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
            onClick={() => {
              setAttempted(false);
              setStep((current) => Math.max(current - 1, 0));
            }}
          >
            Back
          </button>

          {step < 2 ? (
            <button
              type="button"
              className="primary-btn"
              onClick={handleContinue}
            >
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              className="primary-btn"
              onClick={saveCheckIn}
              disabled={isSyncing}
            >
              {isSyncing ? "Synchronizing..." : "Save and sync check-in"}{" "}
              <Check size={16} />
            </button>
          )}
        </div>

        {saved && (
          <div className="save-note" role="status">
            <Check size={16} />
            Check-in saved locally and successfully synchronized with the SALORIS backend. This prototype is not a medical record.
          </div>
        )}

        {saveError && (
          <div className="validation-note visible" role="alert">
            <AlertTriangle size={15} />
            {saveError}
          </div>
        )}
      </form>
    </>
  );
}

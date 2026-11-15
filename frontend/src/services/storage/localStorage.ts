import type { ReadingMethod } from "../../data";

export interface HealthCheckIn {
  id: string;
  recordedAt: string;
  savedAt: string;
  source: ReadingMethod;
  simulated: boolean;

  vitals: {
    heartRate: number | null;
    systolic: number | null;
    diastolic: number | null;
    glucose: number | null;
    temperature: number | null;
    oxygen: number | null;
  };

  recovery: {
    sleepHours: number | null;
    sleepQuality: string;
    mood: number | null;
    stress: number;
    note: string;
  };

  symptoms: string[];

  habits: {
    exerciseMinutes: number | null;
    waterLitres: number | null;
    meals: number | null;
  };

  context: string;
}

const STORAGE_KEY = "saloris-health-checkins-v1";
const MAX_RECORDS = 500;

export function getHealthCheckIns(): HealthCheckIn[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) return [];

    const records: unknown = JSON.parse(stored);

    if (!Array.isArray(records)) return [];

    return records as HealthCheckIn[];
  } catch {
    return [];
  }
}

export function saveHealthCheckIn(
  record: HealthCheckIn,
): void {
  const records = getHealthCheckIns();

  const updatedRecords = [
    record,
    ...records.filter((item) => item.id !== record.id),
  ].slice(0, MAX_RECORDS);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedRecords),
  );
}

export function getLatestHealthCheckIn(): HealthCheckIn | null {
  return getHealthCheckIns()[0] ?? null;
}

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api"
).replace(/\/$/, "");
const ASTRONAUT_STORAGE_KEY = "saloris-astronaut-id";

export interface Astronaut {
  id: string;
  fullName: string;
  callsign: string;
  missionName: string;
}

export interface HealthReadingPayload {
  astronautId: string;
  indicator: string;
  value: number;
  unit: string;
  recordedAt: string;
  source: string;
  collectionMethod: string;
  context?: string;
  idempotencyKey: string;
}

export interface HealthReadingRecord {
  id: string;
  astronautId: string;
  indicator: string;
  value: number;
  unit: string;
  recordedAt: string;
  source: string;
  collectionMethod: string;
  context?: string;
}

export interface WellbeingPayload {
  astronautId: string;
  sleepHours?: number;
  sleepQuality?: number;
  mood?: number;
  stress?: number;
  fatigue?: number;
  recordedAt: string;
  source: string;
  idempotencyKey: string;
}

export interface SymptomPayload {
  astronautId: string;
  symptom: string;
  severity: number;
  description?: string;
  reportedAt: string;
  source: string;
  idempotencyKey: string;
}

export interface AssessmentResponse {
  assessmentId: string;
  astronautId: string;
  status: string;
  explanation: string;
  assessedAt: string;
  triggeredRules: string[];
}

export interface HealthAlert {
  id: string;
  severity: string;
  message: string;
  acknowledged: boolean;
  createdAt: string;
}

export interface EmergencyEvent {
  id: string;
  astronautId: string;
  description: string;
  status: string;
  reportedAt: string;
  resolvedAt?: string;
  idempotencyKey: string;
}

export type EmergencyEventStatus = "OPEN" | "ACKNOWLEDGED" | "RESOLVED";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getApiErrorMessage(body: string, status: number): string {
  if (!body) return `SALORIS backend request failed (${status}).`;
  try {
    const parsed = JSON.parse(body) as {
      detail?: string;
      message?: string;
      error?: string;
    };
    return parsed.detail ?? parsed.message ?? parsed.error ?? body;
  } catch {
    return body;
  }
}

export function getAstronauts(): Promise<Astronaut[]> {
  return request("/astronauts");
}

export function createAstronaut(payload: {
  fullName: string;
  callsign: string;
  missionName: string;
}): Promise<Astronaut> {
  return request("/astronauts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getSelectedAstronautId(): string | null {
  return localStorage.getItem(ASTRONAUT_STORAGE_KEY);
}

export function selectAstronaut(astronautId: string): void {
  localStorage.setItem(ASTRONAUT_STORAGE_KEY, astronautId);
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(
      "The SALORIS backend is unavailable. Local data was kept.",
      0,
    );
  }

  if (!response.ok) {
    const body = await response.text();
    throw new ApiError(getApiErrorMessage(body, response.status), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function ensureAstronaut(): Promise<Astronaut> {
  const cachedId = localStorage.getItem(ASTRONAUT_STORAGE_KEY);

  let astronauts: Astronaut[];
  try {
    astronauts = await getAstronauts();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "The SALORIS backend is unavailable. Local data was kept.",
      0,
    );
  }

  const existing = astronauts.find((astronaut) => astronaut.id === cachedId);
  if (existing) {
    localStorage.setItem(ASTRONAUT_STORAGE_KEY, existing.id);
    return existing;
  }

  localStorage.removeItem(ASTRONAUT_STORAGE_KEY);
  throw new ApiError(
    "Select or create an astronaut profile before using SALORIS.",
    400,
  );
}

export function createHealthReading(
  payload: HealthReadingPayload,
): Promise<{ id: string }> {
  return request("/health/readings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getHealthReadings(
  astronautId: string,
): Promise<HealthReadingRecord[]> {
  return request(`/health/readings/${astronautId}`);
}

export function createWellbeingCheckin(
  payload: WellbeingPayload,
): Promise<{ id: string }> {
  return request("/health/wellbeing", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getWellbeingCheckins(
  astronautId: string,
): Promise<WellbeingPayload[]> {
  return request(`/health/wellbeing/${astronautId}`);
}

export function createSymptom(
  payload: SymptomPayload,
): Promise<{ id: string }> {
  return request("/health/symptoms", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getSymptoms(astronautId: string): Promise<SymptomPayload[]> {
  return request(`/health/symptoms/${astronautId}`);
}

export function assessHealth(payload: {
  astronautId: string;
  healthReadingIds: string[];
  wellbeingCheckinIds: string[];
  symptomReportIds: string[];
}): Promise<AssessmentResponse> {
  return request("/health/assess", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAlerts(astronautId: string): Promise<HealthAlert[]> {
  return request(`/health/alerts/${astronautId}`);
}

export function acknowledgeAlert(alertId: string): Promise<HealthAlert> {
  return request(`/health/alerts/${alertId}/acknowledge`, { method: "PATCH" });
}

export function createEmergencyEvent(payload: {
  astronautId: string;
  description: string;
  idempotencyKey: string;
}): Promise<EmergencyEvent> {
  return request("/health/emergency-events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getEmergencyEvents(
  astronautId: string,
): Promise<EmergencyEvent[]> {
  return request(`/health/emergency-events/${astronautId}`);
}

export function acknowledgeEmergencyEvent(
  eventId: string,
): Promise<EmergencyEvent> {
  return request(`/health/emergency-events/${eventId}/acknowledge`, {
    method: "PATCH",
  });
}

export function resolveEmergencyEvent(eventId: string): Promise<EmergencyEvent> {
  return request(`/health/emergency-events/${eventId}/resolve`, {
    method: "PATCH",
  });
}
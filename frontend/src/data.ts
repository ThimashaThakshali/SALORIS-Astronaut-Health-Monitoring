export type ReadingMethod =
  | "Manual entry"
  | "Wearable device"
  | "Medical instrument"
  | "Imported data"
  | "Simulated demonstration data"
  | "Environmental sensor";

export type ReadingStatus = "Normal" | "Attention" | "Emergency" | "Insufficient data";

export interface HealthReading {
  label: string;
  value: string;
  unit: string;
  status: ReadingStatus;
  source: string;
  method: ReadingMethod;
  timestamp: string;
  freshness: "Current" | "Outdated" | "Missing";
  simulated: boolean;
  icon: "heart" | "pressure" | "glucose" | "temperature" | "oxygen" | "sleep";
}

export interface EnvironmentalReading {
  label: string;
  value: string;
  unit: string;
  source: string;
  timestamp: string;
  method: "Environmental sensor";
}

export interface RadiationRecord {
  dose: number;
  unit: "mSv";
  period: string;
  source: string;
  timestamp: string;
  method: "Personal dosimeter";
}

export const healthReadings: HealthReading[] = [
  {
    label: "Heart rate",
    value: "72",
    unit: "bpm",
    status: "Normal",
    source: "SALORIS demonstration dataset",
    method: "Simulated demonstration data",
    timestamp: "Today, 08:42",
    freshness: "Current",
    simulated: true,
    icon: "heart",
  },
  {
    label: "Blood pressure",
    value: "118/76",
    unit: "mmHg",
    status: "Normal",
    source: "SALORIS demonstration dataset",
    method: "Simulated demonstration data",
    timestamp: "Today, 08:40",
    freshness: "Current",
    simulated: true,
    icon: "pressure",
  },
  {
    label: "Blood glucose",
    value: "94",
    unit: "mg/dL",
    status: "Normal",
    source: "SALORIS demonstration dataset",
    method: "Simulated demonstration data",
    timestamp: "Today, 07:55",
    freshness: "Current",
    simulated: true,
    icon: "glucose",
  },
  {
    label: "Body temperature",
    value: "36.7",
    unit: "°C",
    status: "Normal",
    source: "SALORIS demonstration dataset",
    method: "Simulated demonstration data",
    timestamp: "Today, 08:39",
    freshness: "Current",
    simulated: true,
    icon: "temperature",
  },
  {
    label: "Oxygen saturation",
    value: "98",
    unit: "% SpO₂",
    status: "Insufficient data",
    source: "No verified source connected",
    method: "Simulated demonstration data",
    timestamp: "Today, 08:41",
    freshness: "Outdated",
    simulated: true,
    icon: "oxygen",
  },
  {
    label: "Sleep",
    value: "7h 24m",
    unit: "duration",
    status: "Attention",
    source: "SALORIS demonstration dataset",
    method: "Simulated demonstration data",
    timestamp: "Today, 07:20",
    freshness: "Current",
    simulated: true,
    icon: "sleep",
  },
];

export const environmentReadings: EnvironmentalReading[] = [
  {
    label: "Cabin O₂",
    value: "20.9",
    unit: "%",
    source: "Habitat sensor array",
    timestamp: "08:44 UTC",
    method: "Environmental sensor",
  },
  {
    label: "Cabin CO₂",
    value: "0.39",
    unit: "%",
    source: "Habitat sensor array",
    timestamp: "08:44 UTC",
    method: "Environmental sensor",
  },
  {
    label: "Pressure",
    value: "101.2",
    unit: "kPa",
    source: "Habitat sensor array",
    timestamp: "08:44 UTC",
    method: "Environmental sensor",
  },
];

export const radiationRecord: RadiationRecord = {
  dose: 0.42,
  unit: "mSv",
  period: "Last 24 hours",
  source: "Demo personal dosimeter",
  timestamp: "08:30 UTC",
  method: "Personal dosimeter",
};

export const trendData = [
  { day: "D178", heart: 68, sleep: 6.8, stress: 4 },
  { day: "D179", heart: 70, sleep: 7.2, stress: 3 },
  { day: "D180", heart: 69, sleep: 7.8, stress: 2 },
  { day: "D181", heart: 74, sleep: 6.4, stress: 5 },
  { day: "D182", heart: 72, sleep: 7.1, stress: 3 },
  { day: "D183", heart: 71, sleep: 7.6, stress: 2 },
  { day: "D184", heart: 72, sleep: 7.4, stress: 3 },
];

export const bodySystems = {
  Brain: {
    system: "Central nervous system",
    function:
      "Coordinates cognition, attention, sleep-wake regulation, sensation and voluntary movement.",
    hazards: "Isolation and confinement, altered light cycles, radiation and operational workload.",
    risk: "Sleep disruption, isolation, altered sensory input and radiation may affect cognition and performance.",
    indicators: "Sleep quality, mood, reaction time, headache and cognitive self-assessment.",
    collection: "Crew check-in, cognitive task and clinician-reviewed examination.",
    guidance:
      "Protect scheduled sleep, document change from baseline and use approved cognitive assessments consistently.",
    assessment: "Recovery & wellbeing",
    limits: "Self-reported symptoms and brief tasks cannot diagnose neurological conditions.",
  },
  Eyes: {
    system: "Visual system",
    function: "Provides visual acuity, contrast perception, depth cues and ocular coordination.",
    hazards: "Altered gravity, headward fluid shift and radiation exposure.",
    risk: "Spaceflight-associated neuro-ocular changes may affect visual acuity during long missions.",
    indicators: "Visual acuity, contrast, eye discomfort and change from individual baseline.",
    collection: "Vision chart, symptom log and scheduled medical examination.",
    guidance: "Record visual changes promptly and complete scheduled, approved ocular assessments.",
    assessment: "Symptoms & observations",
    limits: "Screening does not replace a complete ophthalmic examination.",
  },
  Heart: {
    system: "Cardiovascular system",
    function: "Circulates oxygen and nutrients and supports blood pressure during activity and gravity transitions.",
    hazards: "Altered gravity, deconditioning, fluid redistribution and workload.",
    risk: "Fluid shifts and deconditioning can alter cardiovascular function and exercise tolerance.",
    indicators: "Heart rate, blood pressure, rhythm symptoms and exercise recovery.",
    collection: "Wearable trend, manual cuff and scheduled medical examination.",
    guidance: "Follow approved exercise countermeasures and compare readings with the individual pre-mission baseline.",
    assessment: "Cardiovascular measurements",
    limits: "Single readings are context-dependent and do not establish a diagnosis.",
  },
  Lungs: {
    system: "Respiratory system",
    function: "Exchanges oxygen and carbon dioxide between the cabin atmosphere and the bloodstream.",
    hazards: "Closed atmosphere, particulates, pressure events and toxic exposure.",
    risk: "Cabin atmosphere, particulates and pressure events can affect respiratory health.",
    indicators: "Oxygen saturation, respiratory rate, symptoms and cabin O₂/CO₂.",
    collection: "Pulse oximetry, crew observation and environmental sensors.",
    guidance: "Consider symptoms together with verified cabin readings and follow authorised atmosphere protocols.",
    assessment: "Respiratory measurements",
    limits: "Pulse oximetry may be affected by motion, circulation and sensor placement.",
  },
  Blood: {
    system: "Hematologic system",
    function: "Transports oxygen, nutrients, immune cells and metabolic products throughout the body.",
    hazards: "Radiation, altered gravity, immune changes and nutrition challenges.",
    risk: "Fluid redistribution and mission duration can change plasma volume and red-cell mass.",
    indicators: "Complete blood count, glucose, hydration markers and bleeding symptoms.",
    collection: "Medical examination, point-of-care test and symptom check.",
    guidance: "Maintain planned hydration and nutrition and use only approved sample-collection procedures.",
    assessment: "Metabolic measurements",
    limits: "Field tests require quality control and clinician interpretation.",
  },
  "Digestive system": {
    system: "Gastrointestinal system",
    function: "Processes food, absorbs nutrients and water, and supports metabolic and immune health.",
    hazards: "Constrained food systems, stress, altered routines and microbial changes.",
    risk: "Diet changes, stress and altered routines can affect appetite and gastrointestinal function.",
    indicators: "Nutrition intake, hydration, appetite, pain and bowel changes.",
    collection: "Food log, symptom journal and medical examination.",
    guidance: "Track intake, hydration and persistent changes using the approved nutrition log.",
    assessment: "Nutrition & hydration",
    limits: "Food and symptom logs may be incomplete and are not diagnostic.",
  },
  Bones: {
    system: "Skeletal system",
    function: "Provides structural support, protects organs and stores minerals used throughout the body.",
    hazards: "Reduced mechanical loading and altered calcium metabolism.",
    risk: "Reduced mechanical loading contributes to bone mineral loss during microgravity exposure.",
    indicators: "Exercise adherence, pain, vitamin intake and periodic bone imaging.",
    collection: "Task log, nutrition record and pre/post-flight imaging.",
    guidance: "Complete prescribed resistance exercise and nutrition countermeasures.",
    assessment: "Activity & recovery",
    limits: "Daily monitoring cannot directly measure bone density.",
  },
  Muscles: {
    system: "Musculoskeletal system",
    function: "Produces movement, maintains posture and supports physical work and emergency response.",
    hazards: "Microgravity unloading, inactivity, injury and inadequate nutrition.",
    risk: "Microgravity can reduce muscle mass, strength and endurance without countermeasures.",
    indicators: "Exercise volume, strength trend, soreness, mobility and functional tests.",
    collection: "Exercise equipment, crew check-in and functional assessment.",
    guidance: "Follow the mission exercise prescription and report pain or functional decline.",
    assessment: "Activity & recovery",
    limits: "Performance varies with fatigue, equipment and technique.",
  },
  "Inner ear and balance": {
    system: "Vestibular system",
    function: "Supports orientation, gaze stability, balance and coordinated movement.",
    hazards: "Gravity transitions, conflicting sensory cues and motion exposure.",
    risk: "Gravity transitions can cause disorientation, motion sickness and impaired balance.",
    indicators: "Dizziness, nausea, orientation, balance and gait.",
    collection: "Symptom check, balance task and medical examination.",
    guidance: "Use handholds, avoid unsafe self-testing and report changes that affect operations.",
    assessment: "Symptoms & observations",
    limits: "Self-tests must not be performed where a fall could cause injury.",
  },
  Skin: {
    system: "Integumentary system",
    function: "Protects against the environment, regulates temperature and provides touch sensation.",
    hazards: "Humidity, friction, suit contact, immune change and delayed wound healing.",
    risk: "Humidity, friction, equipment contact and immune changes can affect skin integrity.",
    indicators: "Irritation, wound healing, rash, pressure areas and hydration.",
    collection: "Crew self-examination and clinician-reviewed imagery when appropriate.",
    guidance: "Inspect equipment contact areas and document persistent change using approved imaging.",
    assessment: "Symptoms & observations",
    limits: "Images can misrepresent colour and cannot confirm a cause.",
  },
} as const;

export type BodyRegion = keyof typeof bodySystems;

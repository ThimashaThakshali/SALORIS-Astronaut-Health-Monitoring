-- V1: Core SALORIS database schema
-- 1. Astronaut profiles
CREATE TABLE astronauts (
    id UUID PRIMARY KEY,
    full_name VARCHAR(150),
    callsign VARCHAR(80) UNIQUE,
    mission_name VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- 2. Individual health measurements
CREATE TABLE health_readings (
    id UUID PRIMARY KEY,
    astronaut_id UUID NOT NULL REFERENCES astronauts(id),
    indicator VARCHAR(80) NOT NULL,
    value NUMERIC(12, 4) NOT NULL,
    unit VARCHAR(40) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL,
    source VARCHAR(30) NOT NULL CHECK (
        source IN (
            'MANUAL',
            'SIMULATED',
            'WEARABLE',
            'MEDICAL_DEVICE',
            'NASA_DATA'
        )
    ),
    collection_method VARCHAR(40) NOT NULL,
    context TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_health_readings_astronaut_time ON health_readings (astronaut_id, recorded_at DESC);
-- 3. Daily wellbeing check-ins
CREATE TABLE wellbeing_checkins (
    id UUID PRIMARY KEY,
    astronaut_id UUID NOT NULL REFERENCES astronauts(id),
    sleep_hours NUMERIC(4, 2),
    sleep_quality SMALLINT CHECK (
        sleep_quality BETWEEN 1 AND 5
    ),
    mood SMALLINT CHECK (
        mood BETWEEN 1 AND 5
    ),
    stress SMALLINT CHECK (
        stress BETWEEN 1 AND 5
    ),
    fatigue SMALLINT CHECK (
        fatigue BETWEEN 1 AND 5
    ),
    recorded_at TIMESTAMPTZ NOT NULL,
    source VARCHAR(30) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- 4. Reported symptoms
CREATE TABLE symptom_reports (
    id UUID PRIMARY KEY,
    astronaut_id UUID NOT NULL REFERENCES astronauts(id),
    symptom VARCHAR(120) NOT NULL,
    severity SMALLINT NOT NULL CHECK (
        severity BETWEEN 1 AND 5
    ),
    description TEXT,
    reported_at TIMESTAMPTZ NOT NULL,
    source VARCHAR(30) NOT NULL DEFAULT 'MANUAL',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- 5. Health assessment results
CREATE TABLE health_assessments (
    id UUID PRIMARY KEY,
    astronaut_id UUID NOT NULL REFERENCES astronauts(id),
    status VARCHAR(30) NOT NULL CHECK (
        status IN (
            'NORMAL',
            'ATTENTION',
            'EMERGENCY',
            'INSUFFICIENT_DATA'
        )
    ),
    explanation TEXT NOT NULL,
    assessed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- 6. Health alerts
CREATE TABLE health_alerts (
    id UUID PRIMARY KEY,
    assessment_id UUID NOT NULL REFERENCES health_assessments(id),
    astronaut_id UUID NOT NULL REFERENCES astronauts(id),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('ATTENTION', 'EMERGENCY')),
    message TEXT NOT NULL,
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- 7. Emergency events
CREATE TABLE emergency_events (
    id UUID PRIMARY KEY,
    astronaut_id UUID NOT NULL REFERENCES astronauts(id),
    description TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ACKNOWLEDGED', 'RESOLVED')),
    reported_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ
);
CREATE INDEX idx_health_alerts_astronaut_time ON health_alerts (astronaut_id, created_at DESC);
CREATE INDEX idx_emergency_events_astronaut_time ON emergency_events (astronaut_id, reported_at DESC);
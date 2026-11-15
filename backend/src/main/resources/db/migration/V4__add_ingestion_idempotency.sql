ALTER TABLE wellbeing_checkins
ADD COLUMN idempotency_key VARCHAR(100);

ALTER TABLE symptom_reports
ADD COLUMN idempotency_key VARCHAR(100);

ALTER TABLE emergency_events
ADD COLUMN idempotency_key VARCHAR(100);

CREATE UNIQUE INDEX uq_wellbeing_checkins_astronaut_idempotency
ON wellbeing_checkins (astronaut_id, idempotency_key)
WHERE idempotency_key IS NOT NULL;

CREATE UNIQUE INDEX uq_symptom_reports_astronaut_idempotency
ON symptom_reports (astronaut_id, idempotency_key)
WHERE idempotency_key IS NOT NULL;

CREATE UNIQUE INDEX uq_emergency_events_astronaut_idempotency
ON emergency_events (astronaut_id, idempotency_key)
WHERE idempotency_key IS NOT NULL;

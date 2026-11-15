ALTER TABLE health_readings
ADD COLUMN idempotency_key VARCHAR(100);

CREATE UNIQUE INDEX uq_health_readings_astronaut_idempotency
ON health_readings (astronaut_id, idempotency_key)
WHERE idempotency_key IS NOT NULL;

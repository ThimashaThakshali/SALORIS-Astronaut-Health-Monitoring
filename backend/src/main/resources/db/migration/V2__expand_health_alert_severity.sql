ALTER TABLE health_alerts
DROP CONSTRAINT IF EXISTS health_alerts_severity_check;

ALTER TABLE health_alerts
ADD CONSTRAINT health_alerts_severity_check
CHECK (
    severity IN (
        'DATA_QUALITY',
        'REVIEW',
        'ATTENTION',
        'EMERGENCY'
    )
);

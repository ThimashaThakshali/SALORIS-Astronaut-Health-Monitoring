package com.saloris.backend.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "health_alerts")
public class HealthAlert {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "assessment_id", nullable = false)
    private UUID assessmentId;

    @Column(name = "astronaut_id", nullable = false)
    private UUID astronautId;

    @Column(nullable = false, length = 20)
    private String severity;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private Boolean acknowledged = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    public HealthAlert() {}

    public UUID getId() { return id; }
    public UUID getAssessmentId() { return assessmentId; }
    public void setAssessmentId(UUID v) { assessmentId = v; }
    public UUID getAstronautId() { return astronautId; }
    public void setAstronautId(UUID v) { astronautId = v; }
    public String getSeverity() { return severity; }
    public void setSeverity(String v) { severity = v; }
    public String getMessage() { return message; }
    public void setMessage(String v) { message = v; }
    public Boolean getAcknowledged() { return acknowledged; }
    public void setAcknowledged(Boolean v) { acknowledged = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}

package com.saloris.backend.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "health_assessments")
public class HealthAssessment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "astronaut_id", nullable = false)
    private UUID astronautId;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "assessed_at", insertable = false, updatable = false)
    private OffsetDateTime assessedAt;

    public HealthAssessment() {}

    public UUID getId() { return id; }
    public UUID getAstronautId() { return astronautId; }
    public void setAstronautId(UUID v) { astronautId = v; }
    public String getStatus() { return status; }
    public void setStatus(String v) { status = v; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String v) { explanation = v; }
    public OffsetDateTime getAssessedAt() { return assessedAt; }
}

package com.saloris.backend.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "emergency_events")
public class EmergencyEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "astronaut_id", nullable = false)
    private UUID astronautId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 30)
    private String status = "OPEN";

    @Column(name = "reported_at", insertable = false, updatable = false)
    private OffsetDateTime reportedAt;

    @Column(name = "resolved_at")
    private OffsetDateTime resolvedAt;

    @Column(name = "idempotency_key", length = 100)
    private String idempotencyKey;

    public EmergencyEvent() {}

    public UUID getId() { return id; }
    public UUID getAstronautId() { return astronautId; }
    public void setAstronautId(UUID v) { astronautId = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { description = v; }
    public String getStatus() { return status; }
    public void setStatus(String v) { status = v; }
    public OffsetDateTime getReportedAt() { return reportedAt; }
    public OffsetDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(OffsetDateTime v) { resolvedAt = v; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String v) { idempotencyKey = v; }
}

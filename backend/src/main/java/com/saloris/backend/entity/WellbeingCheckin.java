package com.saloris.backend.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "wellbeing_checkins")
public class WellbeingCheckin {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "astronaut_id", nullable = false)
    private UUID astronautId;

    @Column(name = "sleep_hours", precision = 4, scale = 2)
    private java.math.BigDecimal sleepHours;

    @Column(name = "sleep_quality")
    private Short sleepQuality;

    private Short mood;
    private Short stress;
    private Short fatigue;

    @Column(name = "recorded_at", nullable = false)
    private OffsetDateTime recordedAt;

    @Column(nullable = false, length = 30)
    private String source;

    @Column(name = "idempotency_key", length = 100)
    private String idempotencyKey;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    public WellbeingCheckin() {}

    public UUID getId() { return id; }
    public UUID getAstronautId() { return astronautId; }
    public void setAstronautId(UUID v) { astronautId = v; }
    public java.math.BigDecimal getSleepHours() { return sleepHours; }
    public void setSleepHours(java.math.BigDecimal v) { sleepHours = v; }
    public Short getSleepQuality() { return sleepQuality; }
    public void setSleepQuality(Short v) { sleepQuality = v; }
    public Short getMood() { return mood; }
    public void setMood(Short v) { mood = v; }
    public Short getStress() { return stress; }
    public void setStress(Short v) { stress = v; }
    public Short getFatigue() { return fatigue; }
    public void setFatigue(Short v) { fatigue = v; }
    public OffsetDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(OffsetDateTime v) { recordedAt = v; }
    public String getSource() { return source; }
    public void setSource(String v) { source = v; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String v) { idempotencyKey = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}

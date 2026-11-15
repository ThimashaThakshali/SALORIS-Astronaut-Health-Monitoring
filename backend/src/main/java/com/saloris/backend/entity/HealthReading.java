package com.saloris.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "health_readings")
public class HealthReading {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "astronaut_id", nullable = false)
    private UUID astronautId;

    @Column(nullable = false, length = 80)
    private String indicator;

    @Column(nullable = false, precision = 12, scale = 4)
    private BigDecimal value;

    @Column(nullable = false, length = 40)
    private String unit;

    @Column(name = "recorded_at", nullable = false)
    private OffsetDateTime recordedAt;

    @Column(nullable = false, length = 30)
    private String source;

    @Column(name = "collection_method", nullable = false, length = 40)
    private String collectionMethod;

    @Column(columnDefinition = "TEXT")
    private String context;

    @Column(name = "idempotency_key", length = 100)
    private String idempotencyKey;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    public HealthReading() {}

    public UUID getId() { return id; }
    public UUID getAstronautId() { return astronautId; }
    public void setAstronautId(UUID astronautId) { this.astronautId = astronautId; }
    public String getIndicator() { return indicator; }
    public void setIndicator(String indicator) { this.indicator = indicator; }
    public BigDecimal getValue() { return value; }
    public void setValue(BigDecimal value) { this.value = value; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public OffsetDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(OffsetDateTime recordedAt) { this.recordedAt = recordedAt; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getCollectionMethod() { return collectionMethod; }
    public void setCollectionMethod(String collectionMethod) { this.collectionMethod = collectionMethod; }
    public String getContext() { return context; }
    public void setContext(String context) { this.context = context; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}

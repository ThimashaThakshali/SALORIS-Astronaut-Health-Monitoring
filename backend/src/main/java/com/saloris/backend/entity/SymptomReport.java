package com.saloris.backend.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "symptom_reports")
public class SymptomReport {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "astronaut_id", nullable = false)
    private UUID astronautId;

    @Column(nullable = false, length = 120)
    private String symptom;

    @Column(nullable = false)
    private Short severity;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "reported_at", nullable = false)
    private OffsetDateTime reportedAt;

    @Column(nullable = false, length = 30)
    private String source = "MANUAL";

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    public SymptomReport() {}

    public UUID getId() { return id; }
    public UUID getAstronautId() { return astronautId; }
    public void setAstronautId(UUID v) { astronautId = v; }
    public String getSymptom() { return symptom; }
    public void setSymptom(String v) { symptom = v; }
    public Short getSeverity() { return severity; }
    public void setSeverity(Short v) { severity = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { description = v; }
    public OffsetDateTime getReportedAt() { return reportedAt; }
    public void setReportedAt(OffsetDateTime v) { reportedAt = v; }
    public String getSource() { return source; }
    public void setSource(String v) { source = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}

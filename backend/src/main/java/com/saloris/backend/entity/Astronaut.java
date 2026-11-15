package com.saloris.backend.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "astronauts")
public class Astronaut {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "full_name", length = 150)
    private String fullName;

    @Column(unique = true, length = 80)
    private String callsign;

    @Column(name = "mission_name", length = 150)
    private String missionName;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    public Astronaut() {}

    public UUID getId() { return id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getCallsign() { return callsign; }
    public void setCallsign(String callsign) { this.callsign = callsign; }
    public String getMissionName() { return missionName; }
    public void setMissionName(String missionName) { this.missionName = missionName; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}

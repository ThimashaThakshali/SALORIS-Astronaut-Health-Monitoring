package com.saloris.backend.repository;

import com.saloris.backend.entity.EmergencyEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EmergencyEventRepository extends JpaRepository<EmergencyEvent, UUID> {
    List<EmergencyEvent> findByAstronautIdOrderByReportedAtDesc(UUID astronautId);
}

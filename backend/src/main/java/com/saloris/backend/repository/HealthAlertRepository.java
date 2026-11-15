package com.saloris.backend.repository;

import com.saloris.backend.entity.HealthAlert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HealthAlertRepository extends JpaRepository<HealthAlert, UUID> {
    List<HealthAlert> findByAstronautIdOrderByCreatedAtDesc(UUID astronautId);
}

package com.saloris.backend.repository;

import com.saloris.backend.entity.HealthReading;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HealthReadingRepository extends JpaRepository<HealthReading, UUID> {

    List<HealthReading> findByAstronautIdOrderByRecordedAtDesc(UUID astronautId);

    Optional<HealthReading> findByAstronautIdAndIdempotencyKey(
            UUID astronautId,
            String idempotencyKey
    );
}

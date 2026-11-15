package com.saloris.backend.repository;

import com.saloris.backend.entity.WellbeingCheckin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface WellbeingCheckinRepository extends JpaRepository<WellbeingCheckin, UUID> {
    List<WellbeingCheckin> findByAstronautIdOrderByRecordedAtDesc(UUID astronautId);
}

package com.saloris.backend.repository;

import com.saloris.backend.entity.HealthAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface HealthAssessmentRepository extends JpaRepository<HealthAssessment, UUID> {
}

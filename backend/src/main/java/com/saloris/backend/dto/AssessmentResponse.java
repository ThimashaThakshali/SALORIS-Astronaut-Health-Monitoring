package com.saloris.backend.dto;

import java.util.UUID;
import java.time.OffsetDateTime;
import java.util.List;

public record AssessmentResponse(
    UUID assessmentId,
    UUID astronautId,
    String status,
    String explanation,
    OffsetDateTime assessedAt,
    List<String> triggeredRules
) {}

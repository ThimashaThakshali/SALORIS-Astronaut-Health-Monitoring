package com.saloris.backend.dto;

import java.util.UUID;
import java.util.List;

public record AssessmentRequest(
    UUID astronautId,
    List<UUID> healthReadingIds,
    List<UUID> wellbeingCheckinIds,
    List<UUID> symptomReportIds
) {}

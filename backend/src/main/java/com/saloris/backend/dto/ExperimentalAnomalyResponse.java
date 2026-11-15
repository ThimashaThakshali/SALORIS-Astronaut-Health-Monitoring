package com.saloris.backend.dto;

import java.util.List;

public record ExperimentalAnomalyResponse(
        String dataset,
        String study,
        String status,
        boolean experimental,
        boolean clinical,
        boolean realTime,
        String limitation,
        List<ExperimentalAnomaly> results
) {
}

package com.saloris.backend.dto;

public record ExperimentalAnomaly(
        String subjectId,
        String biomarker,
        String panel,
        String assay,
        String unit,
        String sampleId,
        String timepoint,
        String observedValue,
        String baselineMean,
        String baselineStandardDeviation,
        String deviationScore,
        String anomalyClassification,
        String method,
        String explanation,
        String sourceFile,
        String sourceRow,
        String comparisonStatus
) {
}

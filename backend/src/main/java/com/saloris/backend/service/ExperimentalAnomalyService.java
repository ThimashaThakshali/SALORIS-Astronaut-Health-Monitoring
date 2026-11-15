package com.saloris.backend.service;

import com.saloris.backend.dto.ExperimentalAnomaly;
import com.saloris.backend.dto.ExperimentalAnomalyResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Service
public class ExperimentalAnomalyService {

    private static final List<String> REQUIRED_COLUMNS = List.of(
            "subject_id", "biomarker", "panel", "assay", "unit",
            "sample_id", "timepoint", "observed_value", "baseline_mean",
            "baseline_standard_deviation", "deviation_score",
            "anomaly_classification", "method", "explanation",
            "source_file", "source_row", "comparison_status");

    private final Path resultsPath;

    public ExperimentalAnomalyService(
            @Value("${saloris.ml.anomaly-results-path:../ml/data/processed/anomaly_results.csv}")
            String resultsPath) {
        this.resultsPath = Path.of(resultsPath);
    }

    public ExperimentalAnomalyResponse getResults() {
        if (!Files.isRegularFile(resultsPath)) {
            throw unavailable("Experimental anomaly results are unavailable: file not found");
        }

        try (BufferedReader reader = Files.newBufferedReader(resultsPath)) {
            List<String> headers = parseLine(reader.readLine());
            validateHeaders(headers);

            List<ExperimentalAnomaly> results = new ArrayList<>();
            String line;
            int lineNumber = 1;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (line.isBlank()) {
                    continue;
                }
                List<String> values = parseLine(line);
                if (values.size() != headers.size()) {
                    throw unavailable("Experimental anomaly results are malformed at CSV line " + lineNumber);
                }
                results.add(toResult(headers, values));
            }
            return new ExperimentalAnomalyResponse(
                    "OSD-575 anomaly_results.csv",
                    "NASA OSDR OSD-575 Inspiration4",
                    "available",
                    true,
                    false,
                    false,
                    "Historical exploratory research comparisons from four Inspiration4 subjects; not live astronaut data, clinical validation, diagnosis, or emergency decision support.",
                    List.copyOf(results));
        } catch (IOException | RuntimeException exception) {
            if (exception instanceof ExperimentalAnomalyDataException dataException) {
                throw dataException;
            }
            throw unavailable("Experimental anomaly results could not be read safely");
        }
    }

    private ExperimentalAnomaly toResult(List<String> headers, List<String> values) {
        String[] row = new String[headers.size()];
        for (int index = 0; index < headers.size(); index++) {
            row[index] = values.get(index);
        }
        return new ExperimentalAnomaly(
                value(headers, row, "subject_id"),
                value(headers, row, "biomarker"),
                value(headers, row, "panel"),
                value(headers, row, "assay"),
                value(headers, row, "unit"),
                value(headers, row, "sample_id"),
                value(headers, row, "timepoint"),
                value(headers, row, "observed_value"),
                value(headers, row, "baseline_mean"),
                value(headers, row, "baseline_standard_deviation"),
                value(headers, row, "deviation_score"),
                value(headers, row, "anomaly_classification"),
                value(headers, row, "method"),
                value(headers, row, "explanation"),
                value(headers, row, "source_file"),
                value(headers, row, "source_row"),
                value(headers, row, "comparison_status"));
    }

    private static String value(List<String> headers, String[] row, String name) {
        return row[headers.indexOf(name)];
    }

    private void validateHeaders(List<String> headers) {
        if (headers.isEmpty() || !headers.containsAll(REQUIRED_COLUMNS)) {
            throw unavailable("Experimental anomaly results are missing required columns");
        }
    }

    private static List<String> parseLine(String line) {
        if (line == null) {
            return List.of();
        }
        List<String> values = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean quoted = false;
        for (int index = 0; index < line.length(); index++) {
            char character = line.charAt(index);
            if (character == '"') {
                if (quoted && index + 1 < line.length() && line.charAt(index + 1) == '"') {
                    current.append('"');
                    index++;
                } else {
                    quoted = !quoted;
                }
            } else if (character == ',' && !quoted) {
                values.add(current.toString());
                current.setLength(0);
            } else {
                current.append(character);
            }
        }
        if (quoted) {
            throw unavailable("Experimental anomaly results contain an unterminated CSV quote");
        }
        values.add(current.toString());
        return values;
    }

    private static ExperimentalAnomalyDataException unavailable(String message) {
        return new ExperimentalAnomalyDataException(message);
    }

    public static class ExperimentalAnomalyDataException extends RuntimeException {
        public ExperimentalAnomalyDataException(String message) {
            super(message);
        }
    }
}

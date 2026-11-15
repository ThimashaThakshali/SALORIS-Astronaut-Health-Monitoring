package com.saloris.backend.controller;

import com.saloris.backend.entity.SymptomReport;
import com.saloris.backend.repository.AstronautRepository;
import com.saloris.backend.repository.SymptomReportRepository;
import org.springframework.http.HttpStatus;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;

@RestController
@RequestMapping("/api/health/symptoms")
@CrossOrigin(origins = "*")
public class SymptomController {

    private static final Set<String> ALLOWED_SOURCES = Set.of(
            "MANUAL", "SIMULATED", "WEARABLE", "MEDICAL_DEVICE", "NASA_DATA");

    private final SymptomReportRepository repository;
    private final AstronautRepository astronautRepository;

    public SymptomController(
            SymptomReportRepository repository,
            AstronautRepository astronautRepository) {
        this.repository = repository;
        this.astronautRepository = astronautRepository;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SymptomReport create(@RequestBody SymptomReport report) {

        UUID astronautId = report.getAstronautId();

        if (astronautId == null || !astronautRepository.existsById(astronautId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Astronaut not found");
        }

        String idempotencyKey = requireIdempotencyKey(report.getIdempotencyKey());
        report.setIdempotencyKey(idempotencyKey);
        boolean reportedAtProvided = report.getReportedAt() != null;

        if (report.getSymptom() == null || report.getSymptom().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Symptom is required");
        }

        if (report.getSeverity() == null
                || report.getSeverity() < 1
                || report.getSeverity() > 5) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Severity must be between 1 and 5");
        }

        if (report.getReportedAt() == null) {
            report.setReportedAt(OffsetDateTime.now());
        } else if (report.getReportedAt().isAfter(OffsetDateTime.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Reported time cannot be in the future");
        }

        if (report.getSource() == null || report.getSource().isBlank()) {
            report.setSource("MANUAL");
        } else {
            report.setSource(report.getSource().trim().toUpperCase(Locale.ROOT));
        }

        if (!ALLOWED_SOURCES.contains(report.getSource())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unsupported data source: " + report.getSource());
        }

        var existing = repository.findByAstronautIdAndIdempotencyKey(
                astronautId, idempotencyKey);
        if (existing.isPresent()) {
            if (isSameSubmission(report, existing.get(), reportedAtProvided)) {
                return existing.get();
            }
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This idempotency key was already used for different symptom data");
        }

        try {
            return repository.saveAndFlush(report);
        } catch (DataIntegrityViolationException exception) {
            var duplicate = repository.findByAstronautIdAndIdempotencyKey(
                    astronautId, idempotencyKey);
            if (duplicate.isPresent()
                    && isSameSubmission(report, duplicate.get(), reportedAtProvided)) {
                return duplicate.get();
            }
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Duplicate submission key or database constraint violation");
        }
    }

    @GetMapping("/{astronautId}")
    public List<SymptomReport> getHistory(@PathVariable UUID astronautId) {

        if (!astronautRepository.existsById(astronautId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Astronaut not found");
        }

        return repository.findByAstronautIdOrderByReportedAtDesc(astronautId);
    }

    private String requireIdempotencyKey(String value) {
        if (value == null || value.isBlank() || value.trim().length() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Idempotency key is required and cannot exceed 100 characters");
        }
        return value.trim();
    }

    private boolean isSameSubmission(
            SymptomReport incoming,
            SymptomReport existing,
            boolean reportedAtProvided) {
        return Objects.equals(incoming.getAstronautId(), existing.getAstronautId())
                && sameText(incoming.getSymptom(), existing.getSymptom())
                && Objects.equals(incoming.getSeverity(), existing.getSeverity())
                && Objects.equals(incoming.getDescription(), existing.getDescription())
                && (!reportedAtProvided
                    || Objects.equals(incoming.getReportedAt(), existing.getReportedAt()))
                && Objects.equals(incoming.getSource(), existing.getSource());
    }

    private boolean sameText(String first, String second) {
        return first == null ? second == null : second != null
                && first.trim().equalsIgnoreCase(second.trim());
    }
}

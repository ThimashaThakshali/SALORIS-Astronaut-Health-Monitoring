package com.saloris.backend.controller;

import com.saloris.backend.entity.HealthReading;
import com.saloris.backend.repository.AstronautRepository;
import com.saloris.backend.repository.HealthReadingRepository;
import com.saloris.backend.service.HealthReadingValidator;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/health/readings")
@CrossOrigin(origins = "*")
public class HealthReadingController {

    private static final Set<String> ALLOWED_SOURCES = Set.of(
            "MANUAL",
            "SIMULATED",
            "WEARABLE",
            "MEDICAL_DEVICE",
            "NASA_DATA"
    );

    private final HealthReadingRepository healthReadingRepository;
    private final AstronautRepository astronautRepository;
    private final HealthReadingValidator readingValidator;

    public HealthReadingController(
            HealthReadingRepository healthReadingRepository,
            AstronautRepository astronautRepository,
            HealthReadingValidator readingValidator) {
        this.healthReadingRepository = healthReadingRepository;
        this.astronautRepository = astronautRepository;
        this.readingValidator = readingValidator;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public HealthReading createReading(@RequestBody HealthReading reading) {

        if (reading.getAstronautId() == null ||
                !astronautRepository.existsById(reading.getAstronautId())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Astronaut not found");
        }

        if (reading.getIndicator() == null || reading.getIndicator().isBlank()
                || reading.getValue() == null
                || reading.getUnit() == null || reading.getUnit().isBlank()
                || reading.getSource() == null || reading.getSource().isBlank()
                || reading.getCollectionMethod() == null
                || reading.getCollectionMethod().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Required reading fields are missing");
        }

        if (reading.getIdempotencyKey() == null
                || reading.getIdempotencyKey().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Idempotency key is required");
        }

        String key = reading.getIdempotencyKey().trim();

        if (key.length() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Idempotency key cannot exceed 100 characters");
        }

        reading.setIdempotencyKey(key);
        boolean recordedAtProvided = reading.getRecordedAt() != null;

        String source = reading.getSource()
                .trim().toUpperCase(Locale.ROOT);

        if (!ALLOWED_SOURCES.contains(source)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unsupported data source: " + source);
        }

        String collectionMethod = reading.getCollectionMethod()
                .trim().toUpperCase(Locale.ROOT);

        if (collectionMethod.length() > 40) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Collection method cannot exceed 40 characters");
        }

        reading.setSource(source);
        reading.setCollectionMethod(collectionMethod);

        readingValidator.validateValue(
                reading.getIndicator(),
                reading.getUnit(),
                reading.getValue()
        );

        if (reading.getRecordedAt() == null) {
            reading.setRecordedAt(OffsetDateTime.now());
        }

        if (reading.getRecordedAt().isAfter(OffsetDateTime.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Reading timestamp cannot be in the future");
        }

        var existing = healthReadingRepository
                .findByAstronautIdAndIdempotencyKey(
                        reading.getAstronautId(), key);

        if (existing.isPresent()) {
            HealthReading saved = existing.get();

            if (isSameSubmission(reading, saved, recordedAtProvided)) {
                return saved;
            }

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This idempotency key was already used for different reading data");
        }

        try {
            return healthReadingRepository.saveAndFlush(reading);
        } catch (DataIntegrityViolationException exception) {
            var duplicate = healthReadingRepository
                    .findByAstronautIdAndIdempotencyKey(
                            reading.getAstronautId(), key);

            if (duplicate.isPresent()
                    && isSameSubmission(reading, duplicate.get(), recordedAtProvided)) {
                return duplicate.get();
            }

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Duplicate submission key or database constraint violation");
        }
    }

    private boolean isSameSubmission(
            HealthReading incoming,
            HealthReading existing,
            boolean recordedAtProvided) {

        boolean sameTimestamp = !recordedAtProvided
                || (existing.getRecordedAt() != null
                && incoming.getRecordedAt().isEqual(existing.getRecordedAt()));

        return Objects.equals(
                    incoming.getAstronautId(), existing.getAstronautId())
                && sameText(incoming.getIndicator(), existing.getIndicator())
                && incoming.getValue().compareTo(existing.getValue()) == 0
                && sameText(incoming.getUnit(), existing.getUnit())
                && sameText(incoming.getSource(), existing.getSource())
                && sameText(incoming.getCollectionMethod(),
                            existing.getCollectionMethod())
                && Objects.equals(incoming.getContext(), existing.getContext())
                && sameTimestamp;
    }

    private boolean sameText(String first, String second) {
        if (first == null || second == null) {
            return first == second;
        }

        return first.trim().equalsIgnoreCase(second.trim());
    }

    @GetMapping("/{astronautId}")
    public List<HealthReading> getReadings(@PathVariable UUID astronautId) {

        if (!astronautRepository.existsById(astronautId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Astronaut not found");
        }

        return healthReadingRepository
                .findByAstronautIdOrderByRecordedAtDesc(astronautId);
    }
}

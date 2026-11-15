package com.saloris.backend.controller;

import com.saloris.backend.entity.EmergencyEvent;
import com.saloris.backend.repository.AstronautRepository;
import com.saloris.backend.repository.EmergencyEventRepository;
import org.springframework.http.HttpStatus;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Objects;

@RestController
@RequestMapping("/api/health/emergency-events")
@CrossOrigin(origins = "*")
public class EmergencyEventController {

    private final EmergencyEventRepository repository;
    private final AstronautRepository astronautRepository;

    public EmergencyEventController(
            EmergencyEventRepository repository,
            AstronautRepository astronautRepository) {
        this.repository = repository;
        this.astronautRepository = astronautRepository;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EmergencyEvent create(@RequestBody EmergencyEvent event) {
        UUID astronautId = event.getAstronautId();

        if (astronautId == null || !astronautRepository.existsById(astronautId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Astronaut not found");
        }

        if (event.getDescription() == null || event.getDescription().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Event description is required");
        }

        String idempotencyKey = requireIdempotencyKey(event.getIdempotencyKey());
        event.setIdempotencyKey(idempotencyKey);
        boolean reportedAtProvided = event.getReportedAt() != null;
        event.setDescription(event.getDescription().trim());
        event.setStatus("OPEN");
        event.setResolvedAt(null);

        var existing = repository.findByAstronautIdAndIdempotencyKey(
                astronautId, idempotencyKey);
        if (existing.isPresent()) {
            if (isSameSubmission(event, existing.get(), reportedAtProvided)) {
                return existing.get();
            }
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This idempotency key was already used for different emergency data");
        }

        try {
            return repository.saveAndFlush(event);
        } catch (DataIntegrityViolationException exception) {
            var duplicate = repository.findByAstronautIdAndIdempotencyKey(
                    astronautId, idempotencyKey);
            if (duplicate.isPresent()
                    && isSameSubmission(event, duplicate.get(), reportedAtProvided)) {
                return duplicate.get();
            }
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Duplicate submission key or database constraint violation");
        }
    }

    @GetMapping("/{astronautId}")
    public List<EmergencyEvent> getEvents(@PathVariable UUID astronautId) {
        if (!astronautRepository.existsById(astronautId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Astronaut not found");
        }

        return repository.findByAstronautIdOrderByReportedAtDesc(astronautId);
    }

    @PatchMapping("/{eventId}/acknowledge")
    public EmergencyEvent acknowledge(@PathVariable UUID eventId) {
        EmergencyEvent event = getEvent(eventId);

        if ("RESOLVED".equals(event.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Resolved events cannot be acknowledged");
        }

        event.setStatus("ACKNOWLEDGED");
        return repository.save(event);
    }

    @PatchMapping("/{eventId}/resolve")
    public EmergencyEvent resolve(@PathVariable UUID eventId) {
        EmergencyEvent event = getEvent(eventId);

        if ("RESOLVED".equals(event.getStatus())) {
            return event;
        }

        event.setStatus("RESOLVED");
        event.setResolvedAt(OffsetDateTime.now());

        return repository.save(event);
    }

    private EmergencyEvent getEvent(UUID eventId) {
        return repository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Emergency event not found"));
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
            EmergencyEvent incoming,
            EmergencyEvent existing,
            boolean reportedAtProvided) {

        return Objects.equals(incoming.getAstronautId(), existing.getAstronautId())
                && Objects.equals(incoming.getDescription(), existing.getDescription());
    }
}

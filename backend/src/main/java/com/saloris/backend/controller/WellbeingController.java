package com.saloris.backend.controller;

import com.saloris.backend.entity.WellbeingCheckin;
import com.saloris.backend.repository.AstronautRepository;
import com.saloris.backend.repository.WellbeingCheckinRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/health/wellbeing")
@CrossOrigin(origins = "*")
public class WellbeingController {

    private final WellbeingCheckinRepository repository;
    private final AstronautRepository astronautRepository;

    public WellbeingController(
            WellbeingCheckinRepository repository,
            AstronautRepository astronautRepository) {
        this.repository = repository;
        this.astronautRepository = astronautRepository;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WellbeingCheckin create(@RequestBody WellbeingCheckin checkin) {

        UUID astronautId = checkin.getAstronautId();

        if (astronautId == null || !astronautRepository.existsById(astronautId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Astronaut not found");
        }

        if (checkin.getSleepHours() == null
                && checkin.getSleepQuality() == null
                && checkin.getMood() == null
                && checkin.getStress() == null
                && checkin.getFatigue() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "At least one wellbeing value is required");
        }

        if (checkin.getSleepHours() != null
                && (checkin.getSleepHours().signum() < 0
                || checkin.getSleepHours().doubleValue() > 24)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Sleep hours must be between 0 and 24");
        }

        validateScale(checkin.getSleepQuality(), "Sleep quality");
        validateScale(checkin.getMood(), "Mood");
        validateScale(checkin.getStress(), "Stress");
        validateScale(checkin.getFatigue(), "Fatigue");

        if (checkin.getRecordedAt() == null) {
            checkin.setRecordedAt(OffsetDateTime.now());
        } else if (checkin.getRecordedAt().isAfter(OffsetDateTime.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Recorded time cannot be in the future");
        }

        if (checkin.getSource() == null || checkin.getSource().isBlank()) {
            checkin.setSource("MANUAL");
        } else {
            checkin.setSource(checkin.getSource().trim().toUpperCase());
        }

        return repository.save(checkin);
    }

    @GetMapping("/{astronautId}")
    public List<WellbeingCheckin> getHistory(@PathVariable UUID astronautId) {

        if (!astronautRepository.existsById(astronautId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Astronaut not found");
        }

        return repository.findByAstronautIdOrderByRecordedAtDesc(astronautId);
    }

    private void validateScale(Short value, String field) {
        if (value != null && (value < 1 || value > 5)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    field + " must be between 1 and 5");
        }
    }
}

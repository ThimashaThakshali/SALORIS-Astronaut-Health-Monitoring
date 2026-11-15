package com.saloris.backend.controller;

import com.saloris.backend.entity.SymptomReport;
import com.saloris.backend.repository.AstronautRepository;
import com.saloris.backend.repository.SymptomReportRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/health/symptoms")
@CrossOrigin(origins = "*")
public class SymptomController {

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
        }

        if (report.getSource() == null || report.getSource().isBlank()) {
            report.setSource("MANUAL");
        }

        return repository.save(report);
    }

    @GetMapping("/{astronautId}")
    public List<SymptomReport> getHistory(@PathVariable UUID astronautId) {

        if (!astronautRepository.existsById(astronautId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Astronaut not found");
        }

        return repository.findByAstronautIdOrderByReportedAtDesc(astronautId);
    }
}

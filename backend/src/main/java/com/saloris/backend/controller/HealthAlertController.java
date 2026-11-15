package com.saloris.backend.controller;

import com.saloris.backend.entity.HealthAlert;
import com.saloris.backend.repository.AstronautRepository;
import com.saloris.backend.repository.HealthAlertRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/health/alerts")
@CrossOrigin(origins = "*")
public class HealthAlertController {

    private final HealthAlertRepository repository;
    private final AstronautRepository astronautRepository;

    public HealthAlertController(
            HealthAlertRepository repository,
            AstronautRepository astronautRepository) {
        this.repository = repository;
        this.astronautRepository = astronautRepository;
    }

    @GetMapping("/{astronautId}")
    public List<HealthAlert> getAlerts(@PathVariable UUID astronautId) {
        if (!astronautRepository.existsById(astronautId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Astronaut not found");
        }

        return repository.findByAstronautIdOrderByCreatedAtDesc(astronautId);
    }

    @PatchMapping("/{alertId}/acknowledge")
    public HealthAlert acknowledge(@PathVariable UUID alertId) {
        HealthAlert alert = repository.findById(alertId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Alert not found"));

        alert.setAcknowledged(true);
        return repository.save(alert);
    }
}

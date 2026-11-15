package com.saloris.backend.controller;

import com.saloris.backend.dto.ExperimentalAnomalyResponse;
import com.saloris.backend.service.ExperimentalAnomalyService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/ml/anomalies")
@CrossOrigin(origins = "*")
public class ExperimentalAnomalyController {

    private final ExperimentalAnomalyService service;

    public ExperimentalAnomalyController(ExperimentalAnomalyService service) {
        this.service = service;
    }

    @GetMapping
    public ExperimentalAnomalyResponse getAnomalies() {
        try {
            return service.getResults();
        } catch (ExperimentalAnomalyService.ExperimentalAnomalyDataException exception) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, exception.getMessage());
        }
    }
}

package com.saloris.backend.controller;

import com.saloris.backend.dto.AssessmentRequest;
import com.saloris.backend.dto.AssessmentResponse;
import com.saloris.backend.service.HealthAssessmentService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "*")
public class HealthController {

    private final HealthAssessmentService assessmentService;

    public HealthController(HealthAssessmentService assessmentService) {
        this.assessmentService = assessmentService;
    }

    @PostMapping("/assess")
    public AssessmentResponse assess(@RequestBody AssessmentRequest request) {
        return assessmentService.assess(request);
    }
}

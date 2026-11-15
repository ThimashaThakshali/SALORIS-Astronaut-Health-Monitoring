package com.saloris.backend.service;

import com.saloris.backend.dto.AssessmentRequest;
import com.saloris.backend.dto.AssessmentResponse;
import com.saloris.backend.entity.HealthAssessment;
import com.saloris.backend.entity.HealthAlert;
import com.saloris.backend.entity.HealthReading;
import com.saloris.backend.entity.WellbeingCheckin;
import com.saloris.backend.entity.SymptomReport;
import com.saloris.backend.repository.AstronautRepository;
import com.saloris.backend.repository.HealthAssessmentRepository;
import com.saloris.backend.repository.HealthAlertRepository;
import com.saloris.backend.repository.HealthReadingRepository;
import com.saloris.backend.repository.WellbeingCheckinRepository;
import com.saloris.backend.repository.SymptomReportRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class HealthAssessmentService {

    private final AstronautRepository astronautRepository;
    private final HealthAssessmentRepository assessmentRepository;
    private final HealthAlertRepository alertRepository;
    private final HealthReadingRepository healthReadingRepository;
    private final WellbeingCheckinRepository wellbeingRepository;
    private final SymptomReportRepository symptomRepository;

    private static final Set<String> DATA_QUALITY_RULES = Set.of(
            "MISSING_HEALTH_INDICATORS",
            "NO_HEALTH_READINGS",
            "MISSING_WELLBEING_CHECKIN",
            "INCOMPLETE_WELLBEING_CHECKIN",
            "INVALID_WELLBEING_TIMESTAMP",
            "FUTURE_WELLBEING_TIMESTAMP",
            "STALE_WELLBEING_CHECKIN",
            "STALE_HEALTH_READINGS",
            "FUTURE_HEALTH_TIMESTAMP",
            "MISSING_HEALTH_TIMESTAMP"
    );

    @Value("${saloris.assessment.max-age-hours:24}")
    private long maxAgeHours;

    @Value("${saloris.assessment.required-indicators:HEART_RATE,SYSTOLIC_BLOOD_PRESSURE,DIASTOLIC_BLOOD_PRESSURE,BLOOD_GLUCOSE,BODY_TEMPERATURE}")
    private String requiredIndicators;

    public HealthAssessmentService(
            AstronautRepository astronautRepository,
            HealthAssessmentRepository assessmentRepository,
            HealthAlertRepository alertRepository,
            HealthReadingRepository healthReadingRepository,
            WellbeingCheckinRepository wellbeingRepository,
            SymptomReportRepository symptomRepository) {

        this.astronautRepository = astronautRepository;
        this.assessmentRepository = assessmentRepository;
        this.alertRepository = alertRepository;
        this.healthReadingRepository = healthReadingRepository;
        this.wellbeingRepository = wellbeingRepository;
        this.symptomRepository = symptomRepository;
    }

    @Transactional
    public AssessmentResponse assess(AssessmentRequest request) {

        if (request == null || request.astronautId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Astronaut ID is required");
        }

        UUID astronautId = request.astronautId();

        if (!astronautRepository.existsById(astronautId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Astronaut not found");
        }

        List<UUID> readingIds = request.healthReadingIds() == null
                ? List.of() : request.healthReadingIds();

        List<UUID> wellbeingIds = request.wellbeingCheckinIds() == null
                ? List.of() : request.wellbeingCheckinIds();

        List<UUID> symptomIds = request.symptomReportIds() == null
                ? List.of() : request.symptomReportIds();

        validateIds(readingIds);
        validateIds(wellbeingIds);
        validateIds(symptomIds);

        List<HealthReading> readings =
                healthReadingRepository.findAllById(readingIds);

        List<WellbeingCheckin> wellbeingRecords =
                wellbeingRepository.findAllById(wellbeingIds);

        List<SymptomReport> symptomRecords =
                symptomRepository.findAllById(symptomIds);

        if (readings.size() != readingIds.size()
                || wellbeingRecords.size() != wellbeingIds.size()
                || symptomRecords.size() != symptomIds.size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "One or more submitted record IDs do not exist");
        }

        boolean wrongOwner =
                readings.stream().anyMatch(r ->
                        !astronautId.equals(r.getAstronautId()))
                || wellbeingRecords.stream().anyMatch(r ->
                        !astronautId.equals(r.getAstronautId()))
                || symptomRecords.stream().anyMatch(r ->
                        !astronautId.equals(r.getAstronautId()));

        if (wrongOwner) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "All submitted records must belong to the specified astronaut");
        }

        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime cutoff = now.minusHours(maxAgeHours);

        List<String> triggeredRules = new ArrayList<>();
        List<String> explanations = new ArrayList<>();

        Set<String> receivedIndicators = readings.stream()
                .filter(r -> r.getIndicator() != null)
                .map(r -> normalizeIndicator(r.getIndicator()))
                .collect(Collectors.toSet());

        Set<String> required = new HashSet<>();

        for (String indicator : requiredIndicators.split(",")) {
            if (!indicator.isBlank()) {
                required.add(normalizeIndicator(indicator));
            }
        }

        List<String> missingIndicators = required.stream()
                .filter(indicator -> !receivedIndicators.contains(indicator))
                .sorted()
                .toList();

        if (!missingIndicators.isEmpty()) {
            triggeredRules.add("MISSING_HEALTH_INDICATORS");
            explanations.add("Missing health indicators: "
                    + String.join(", ", missingIndicators) + ".");
        }

        if (readings.isEmpty()) {
            triggeredRules.add("NO_HEALTH_READINGS");
            explanations.add("No health readings were submitted.");
        }

        if (wellbeingRecords.isEmpty()) {
            triggeredRules.add("MISSING_WELLBEING_CHECKIN");
            explanations.add("No wellbeing check-in was submitted.");
        } else {
            WellbeingCheckin latest = wellbeingRecords.stream()
                    .filter(w -> w.getRecordedAt() != null)
                    .max((a, b) ->
                            a.getRecordedAt().compareTo(b.getRecordedAt()))
                    .orElse(null);

            if (latest == null) {
                triggeredRules.add("INVALID_WELLBEING_TIMESTAMP");
                explanations.add("The wellbeing check-in has no valid timestamp.");
            } else {
                List<String> missingWellbeingFields = new ArrayList<>();

                if (latest.getSleepHours() == null)
                    missingWellbeingFields.add("sleep hours");
                if (latest.getSleepQuality() == null)
                    missingWellbeingFields.add("sleep quality");
                if (latest.getMood() == null)
                    missingWellbeingFields.add("mood");
                if (latest.getStress() == null)
                    missingWellbeingFields.add("stress");
                if (latest.getFatigue() == null)
                    missingWellbeingFields.add("fatigue");

                if (!missingWellbeingFields.isEmpty()) {
                    triggeredRules.add("INCOMPLETE_WELLBEING_CHECKIN");
                    explanations.add("Missing wellbeing information: "
                            + String.join(", ", missingWellbeingFields) + ".");
                }

                if (latest.getRecordedAt().isAfter(now)) {
                    triggeredRules.add("FUTURE_WELLBEING_TIMESTAMP");
                    explanations.add("A wellbeing check-in has a future timestamp.");
                } else if (latest.getRecordedAt().isBefore(cutoff)) {
                    triggeredRules.add("STALE_WELLBEING_CHECKIN");
                    explanations.add("The latest wellbeing check-in is older than "
                            + maxAgeHours + " hours.");
                }
            }
        }

        List<String> staleIndicators = readings.stream()
                .filter(r -> r.getRecordedAt() != null
                        && !r.getRecordedAt().isAfter(now)
                        && r.getRecordedAt().isBefore(cutoff))
                .map(HealthReading::getIndicator)
                .distinct()
                .toList();

        if (!staleIndicators.isEmpty()) {
            triggeredRules.add("STALE_HEALTH_READINGS");
            explanations.add("Stale health readings: "
                    + String.join(", ", staleIndicators) + ".");
        }

        boolean futureReading = readings.stream()
                .anyMatch(r -> r.getRecordedAt() != null
                        && r.getRecordedAt().isAfter(now));

        if (futureReading) {
            triggeredRules.add("FUTURE_HEALTH_TIMESTAMP");
            explanations.add("One or more health readings have future timestamps.");
        }

        boolean missingTimestamp = readings.stream()
                .anyMatch(r -> r.getRecordedAt() == null);

        if (missingTimestamp) {
            triggeredRules.add("MISSING_HEALTH_TIMESTAMP");
            explanations.add("One or more health readings have no timestamp.");
        }

        if (!symptomRecords.isEmpty()) {
            triggeredRules.add("SYMPTOMS_REPORTED");
            explanations.add(symptomRecords.size()
                    + " symptom report(s) were submitted and require review.");
        }

        if (triggeredRules.isEmpty()) {
            explanations.add("Submitted records passed the basic completeness "
                    + "and freshness checks. Medical assessment rules are not "
                    + "yet configured, so a normal health status cannot be confirmed.");
        } else {
            explanations.add("Medical assessment rules are not yet configured. "
                    + "These data-quality findings do not establish a medical diagnosis.");
        }

        String explanation = String.join(" ", explanations);

        HealthAssessment assessment = new HealthAssessment();
        assessment.setAstronautId(astronautId);
        assessment.setStatus("INSUFFICIENT_DATA");
        assessment.setExplanation(explanation);

        HealthAssessment saved = assessmentRepository.save(assessment);

        createAlerts(saved, triggeredRules, explanations, symptomRecords.size());

        return new AssessmentResponse(
                saved.getId(),
                saved.getAstronautId(),
                saved.getStatus(),
                saved.getExplanation(),
                saved.getAssessedAt() != null
                        ? saved.getAssessedAt() : now,
                triggeredRules
        );
    }

    private void createAlerts(
            HealthAssessment assessment,
            List<String> triggeredRules,
            List<String> explanations,
            int symptomCount) {

        List<HealthAlert> alerts = new ArrayList<>();

        boolean hasDataQualityIssues = triggeredRules.stream()
                .anyMatch(DATA_QUALITY_RULES::contains);

        if (hasDataQualityIssues) {
            List<String> dataQualityMessages = new ArrayList<>();

            for (int i = 0; i < triggeredRules.size(); i++) {
                if (DATA_QUALITY_RULES.contains(triggeredRules.get(i))) {
                    dataQualityMessages.add(explanations.get(i));
                }
            }

            HealthAlert alert = new HealthAlert();
            alert.setAssessmentId(assessment.getId());
            alert.setAstronautId(assessment.getAstronautId());
            alert.setSeverity("DATA_QUALITY");
            alert.setMessage("Health data quality requires attention: "
                    + String.join(" ", dataQualityMessages));
            alert.setAcknowledged(false);

            alerts.add(alert);
        }

        if (triggeredRules.contains("SYMPTOMS_REPORTED")) {
            HealthAlert alert = new HealthAlert();
            alert.setAssessmentId(assessment.getId());
            alert.setAstronautId(assessment.getAstronautId());
            alert.setSeverity("REVIEW");
            alert.setMessage(symptomCount
                    + " symptom report(s) were submitted and require review.");
            alert.setAcknowledged(false);

            alerts.add(alert);
        }

        if (!alerts.isEmpty()) {
            alertRepository.saveAll(alerts);
        }
    }

    private String normalizeIndicator(String indicator) {
        String normalized = indicator.trim().toUpperCase();

        if (normalized.equals("BLOOD_SUGAR")) {
            return "BLOOD_GLUCOSE";
        }

        return normalized;
    }

    private void validateIds(List<UUID> ids) {
        if (ids.stream().anyMatch(id -> id == null)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Record IDs cannot contain null values");
        }

        if (ids.size() != new HashSet<>(ids).size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Duplicate record IDs are not allowed");
        }
    }
}

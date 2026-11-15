package com.saloris.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Component
public class HealthReadingValidator {

    private static final Map<String, Set<String>> SUPPORTED = Map.ofEntries(
        Map.entry("HEART_RATE", Set.of("BPM")),
        Map.entry("SYSTOLIC_BLOOD_PRESSURE", Set.of("MMHG")),
        Map.entry("DIASTOLIC_BLOOD_PRESSURE", Set.of("MMHG")),
        Map.entry("BLOOD_GLUCOSE", Set.of("MG/DL", "MMOL/L")),
        Map.entry("BLOOD_SUGAR", Set.of("MG/DL", "MMOL/L")),
        Map.entry("BODY_TEMPERATURE",
                Set.of("C", "CELSIUS", "F", "FAHRENHEIT", "°C", "°F")),
        Map.entry("SPO2", Set.of("%")),
        Map.entry("OXYGEN_SATURATION", Set.of("%"))
    );

    public void validate(String indicator, String unit) {

        if (indicator == null || indicator.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Health indicator is required"
            );
        }

        if (unit == null || unit.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Measurement unit is required"
            );
        }

        String normalizedIndicator =
                indicator.trim().toUpperCase(Locale.ROOT);

        String normalizedUnit =
                unit.trim().toUpperCase(Locale.ROOT);

        Set<String> allowedUnits = SUPPORTED.get(normalizedIndicator);

        if (allowedUnits == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Unsupported health indicator: " + indicator
            );
        }

        if (!allowedUnits.contains(normalizedUnit)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid unit '" + unit + "' for indicator '" + indicator
                    + "'. Supported units: " + allowedUnits
            );
        }
    }

    public void validateValue(
            String indicator,
            String unit,
            BigDecimal value) {

        if (value == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Health reading value is required"
            );
        }

        validate(indicator, unit);

        String normalizedIndicator =
                indicator.trim().toUpperCase(Locale.ROOT);

        String normalizedUnit =
                unit.trim().toUpperCase(Locale.ROOT);

        BigDecimal minimum;
        BigDecimal maximum;

        switch (normalizedIndicator) {

            case "HEART_RATE" -> {
                minimum = new BigDecimal("1");
                maximum = new BigDecimal("300");
            }

            case "SYSTOLIC_BLOOD_PRESSURE" -> {
                minimum = new BigDecimal("1");
                maximum = new BigDecimal("300");
            }

            case "DIASTOLIC_BLOOD_PRESSURE" -> {
                minimum = new BigDecimal("1");
                maximum = new BigDecimal("200");
            }

            case "BLOOD_GLUCOSE", "BLOOD_SUGAR" -> {
                minimum = normalizedUnit.equals("MG/DL")
                        ? new BigDecimal("1")
                        : new BigDecimal("0.1");

                maximum = normalizedUnit.equals("MG/DL")
                        ? new BigDecimal("2000")
                        : new BigDecimal("111");
            }

            case "BODY_TEMPERATURE" -> {
                boolean fahrenheit = normalizedUnit.equals("F")
                        || normalizedUnit.equals("FAHRENHEIT")
                        || normalizedUnit.equals("°F");

                minimum = fahrenheit
                        ? new BigDecimal("50")
                        : new BigDecimal("10");

                maximum = fahrenheit
                        ? new BigDecimal("120")
                        : new BigDecimal("50");
            }

            case "SPO2", "OXYGEN_SATURATION" -> {
                minimum = new BigDecimal("0");
                maximum = new BigDecimal("100");
            }

            default -> throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Unsupported health indicator: " + indicator
            );
        }

        if (value.compareTo(minimum) < 0
                || value.compareTo(maximum) > 0) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Physically implausible value for " + normalizedIndicator
                    + ". Accepted engineering range for this unit: "
                    + minimum + " to " + maximum
            );
        }
    }
}

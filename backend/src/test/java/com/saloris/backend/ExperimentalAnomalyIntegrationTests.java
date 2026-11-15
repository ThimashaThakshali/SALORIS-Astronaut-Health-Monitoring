package com.saloris.backend;

import com.saloris.backend.controller.ExperimentalAnomalyController;
import com.saloris.backend.dto.ExperimentalAnomalyResponse;
import com.saloris.backend.service.ExperimentalAnomalyService;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ExperimentalAnomalyIntegrationTests {

    @Test
    void readsActualAnomalyArtifactAsExperimentalHistoricalData() {
        ExperimentalAnomalyResponse response = new ExperimentalAnomalyService(
                "..\\ml\\data\\processed\\anomaly_results.csv").getResults();

        assertEquals("available", response.status());
        assertTrue(response.experimental());
        assertFalse(response.clinical());
        assertFalse(response.realTime());
        assertEquals(4831, response.results().size());
        assertEquals("C001", response.results().get(0).subjectId());
    }

    @Test
    void rejectsMalformedArtifactWithoutReturningPartialData() throws Exception {
        Path file = Files.createTempFile("saloris-anomalies-", ".csv");
        try {
            Files.writeString(file, "subject_id,biomarker\nC001\n");
            ExperimentalAnomalyService service = new ExperimentalAnomalyService(file.toString());

            assertThrows(
                    ExperimentalAnomalyService.ExperimentalAnomalyDataException.class,
                    service::getResults);
        } finally {
            Files.deleteIfExists(file);
        }
    }

    @Test
    void exposesReadOnlyEndpointWithMetadata() throws Exception {
        ExperimentalAnomalyService service = new ExperimentalAnomalyService(
                "..\\ml\\data\\processed\\anomaly_results.csv");
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(new ExperimentalAnomalyController(service))
                .build();

        mockMvc.perform(get("/api/ml/anomalies"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("\"experimental\":true")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("\"clinical\":false")));
    }

    @Test
    void returnsServiceUnavailableWhenArtifactIsMissing() throws Exception {
        ExperimentalAnomalyService service = new ExperimentalAnomalyService(
                "missing-anomaly-results.csv");
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(new ExperimentalAnomalyController(service))
                .build();

        mockMvc.perform(get("/api/ml/anomalies"))
                .andExpect(status().isServiceUnavailable());
    }
}

package com.saloris.backend;

import com.saloris.backend.controller.AstronautController;
import com.saloris.backend.entity.Astronaut;
import com.saloris.backend.repository.AstronautRepository;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AstronautControllerTests {

    @Test
    void createsValidProfile() throws Exception {
        AstronautRepository repository = org.mockito.Mockito.mock(AstronautRepository.class);
        when(repository.save(any(Astronaut.class))).thenAnswer(invocation -> invocation.getArgument(0));
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(new AstronautController(repository))
                .build();

        mockMvc.perform(post("/api/astronauts")
                        .contentType("application/json")
                        .content("""
                                {"fullName":"Ada Lovelace","callsign":"ADA","missionName":"Ares 01"}
                                """))
                .andExpect(status().isCreated());
    }

    @Test
    void rejectsBlankProfileFields() throws Exception {
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(new AstronautController(org.mockito.Mockito.mock(AstronautRepository.class)))
                .build();

        mockMvc.perform(post("/api/astronauts")
                        .contentType("application/json")
                        .content("""
                                {"fullName":" ","callsign":"ADA","missionName":"Ares 01"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void reportsDuplicateCallsignAsConflict() throws Exception {
        AstronautRepository repository = org.mockito.Mockito.mock(AstronautRepository.class);
        when(repository.save(any(Astronaut.class)))
                .thenThrow(new DataIntegrityViolationException("duplicate callsign"));
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(new AstronautController(repository))
                .build();

        mockMvc.perform(post("/api/astronauts")
                        .contentType("application/json")
                        .content("""
                                {"fullName":"Ada Lovelace","callsign":"ADA","missionName":"Ares 01"}
                                """))
                .andExpect(status().isConflict());
    }
}

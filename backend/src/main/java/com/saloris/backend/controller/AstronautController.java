package com.saloris.backend.controller;

import com.saloris.backend.entity.Astronaut;
import com.saloris.backend.repository.AstronautRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.List;

@RestController
@RequestMapping("/api/astronauts")
@CrossOrigin(origins = "*")
public class AstronautController {

    private final AstronautRepository astronautRepository;

    public AstronautController(AstronautRepository astronautRepository) {
        this.astronautRepository = astronautRepository;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Astronaut createAstronaut(@RequestBody Astronaut astronaut) {

        if (astronaut.getFullName() == null
                || astronaut.getFullName().isBlank()
                || astronaut.getCallsign() == null
                || astronaut.getCallsign().isBlank()
                || astronaut.getMissionName() == null
                || astronaut.getMissionName().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Full name, callsign and mission name are required");
        }
        if (astronaut.getFullName().length() > 150
                || astronaut.getCallsign().length() > 80
                || astronaut.getMissionName().length() > 150) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Profile fields exceed the allowed length");
        }

        astronaut.setFullName(astronaut.getFullName().trim());
        astronaut.setCallsign(astronaut.getCallsign().trim());
        astronaut.setMissionName(astronaut.getMissionName().trim());

        try {
            return astronautRepository.save(astronaut);
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "That callsign is already in use");
        }
    }

    @GetMapping
    public List<Astronaut> getAllAstronauts() {
        return astronautRepository.findAll();
    }
}

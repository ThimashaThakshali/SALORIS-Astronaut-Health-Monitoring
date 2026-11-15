package com.saloris.backend.repository;

import com.saloris.backend.entity.Astronaut;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface AstronautRepository extends JpaRepository<Astronaut, UUID> {
}

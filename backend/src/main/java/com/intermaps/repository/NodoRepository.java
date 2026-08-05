package com.intermaps.repository;

import com.intermaps.entity.Nodo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface NodoRepository extends JpaRepository<Nodo, Long> {

    @Query(value = "SELECT * FROM nodo " +
            "ORDER BY (6371000 * acos(" +
            "  cos(radians(:lat)) * cos(radians(latitud)) * " +
            "  cos(radians(longitud) - radians(:lon)) + " +
            "  sin(radians(:lat)) * sin(radians(latitud))" +
            ")) ASC LIMIT 1",
            nativeQuery = true)
    Optional<Nodo> encontrarNodoMasCercano(@Param("lat") double lat, @Param("lon") double lon);
}

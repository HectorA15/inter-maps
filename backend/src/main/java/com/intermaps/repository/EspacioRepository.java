package com.intermaps.repository;

import com.intermaps.entity.Espacio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EspacioRepository extends JpaRepository<Espacio, Long> {

    /**
     * Busca espacios por nombre o alias, utilizando una búsqueda parcial.
     * Utiliza LOWER() para ignorar mayúsculas y minúsculas.
     */
    @Query("SELECT DISTINCT e FROM Espacio e LEFT JOIN e.alias a WHERE LOWER(e.nombre) LIKE LOWER(CONCAT('%', :termino, '%')) OR LOWER(a) LIKE LOWER(CONCAT('%', :termino, '%'))")
    List<Espacio> buscarPorNombreOAlias(@Param("termino") String termino);

    Optional<Espacio> findByNombre(String nombre);
}

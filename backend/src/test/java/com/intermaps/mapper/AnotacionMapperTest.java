package com.intermaps.mapper;

import com.intermaps.dto.AnotacionRequestDTO;
import com.intermaps.entity.Anotacion;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AnotacionMapperTest {

    @Test
    void creaMarcadorVacioConValoresPredeterminados() {
        Anotacion anotacion = AnotacionMapper.toEntity(new AnotacionRequestDTO(
                null,
                "",
                null,
                null,
                null,
                null,
                25.0,
                -100.0,
                null,
                null,
                null,
                null,
                null,
                List.of()
        ));

        assertEquals("", anotacion.getNombre());
        assertEquals("MARCADOR", anotacion.getTipo());
        assertEquals("#e03131", anotacion.getColor());
        assertTrue(anotacion.getTags().isEmpty());
    }

    @Test
    void conservaVinculoYTagsDelMarcador() {
        Anotacion anotacion = AnotacionMapper.toEntity(new AnotacionRequestDTO(
                "Entrada",
                "3",
                "MARCADOR",
                "#1971c2",
                null,
                24,
                25.0,
                -100.0,
                null,
                3L,
                null,
                null,
                null,
                List.of("edificio", "entrada")
        ));

        assertEquals(3L, anotacion.getEdificioId());
        assertEquals(List.of("edificio", "entrada"), anotacion.getTags().stream().toList());
    }
}

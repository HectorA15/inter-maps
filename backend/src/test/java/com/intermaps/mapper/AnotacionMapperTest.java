package com.intermaps.mapper;

import com.intermaps.dto.AnotacionRequestDTO;
import com.intermaps.entity.Anotacion;
import com.intermaps.util.AutorAnotacion;
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
                null,
                25.0,
                -100.0,
                null,
                null,
                null,
                null,
                null,
                List.of(),
                null
        ));

        assertEquals("", anotacion.getNombre());
        assertEquals("MARCADOR", anotacion.getTipo());
        assertEquals("#e03131", anotacion.getColor());
        assertEquals(1, anotacion.getNivelZoom());
        assertEquals(AutorAnotacion.ADMIN, anotacion.getCreadoPor());
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
                null,
                24,
                25.0,
                -100.0,
                null,
                3L,
                null,
                null,
                null,
                List.of("edificio", "entrada"),
                null
        ));

        assertEquals(3L, anotacion.getEdificioId());
        assertEquals(List.of("edificio", "entrada"), anotacion.getTags().stream().toList());
    }

    @Test
    void limitaNivelDeZoomAlRangoPermitido() {
        Anotacion anotacion = AnotacionMapper.toEntity(new AnotacionRequestDTO(
                "Entrada",
                null,
                "MARCADOR",
                null,
                null,
                7,
                null,
                25.0,
                -100.0,
                null,
                null,
                null,
                null,
                null,
                List.of(),
                null
        ));

        assertEquals(5, anotacion.getNivelZoom());
    }
}

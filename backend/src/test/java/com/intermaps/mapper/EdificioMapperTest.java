package com.intermaps.mapper;

import com.intermaps.dto.EdificioDTO;
import com.intermaps.entity.Edificio;
import com.intermaps.entity.Espacio;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class EdificioMapperTest {

    @Test
    void toDTODebeIncluirLosEspaciosDelEdificio() {
        Edificio edificio = new Edificio();
        edificio.setId(1L);
        edificio.setNombre("1");

        Espacio espacio = new Espacio();
        espacio.setId(10L);
        espacio.setNombre("Servicios Escolares");
        espacio.setTipo("oficina");
        espacio.setDescripcion("Atención al alumnado");
        espacio.setAlias(Set.of("se"));
        espacio.setPiso(1);

        edificio.agregarEspacio(espacio);

        EdificioDTO dto = EdificioMapper.toDTO(edificio);

        assertNotNull(dto);
        assertEquals(1L, dto.id());
        assertEquals("1", dto.nombre());
        assertEquals(1, dto.espacios().size());
        assertEquals("Servicios Escolares", dto.espacios().get(0).nombre());
        assertEquals(1, dto.espacios().get(0).piso());
    }
}


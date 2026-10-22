package com.intermaps.mapper;

import com.intermaps.entity.Edificio;
import com.intermaps.entity.Espacio;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class SearchMapperTest {

    @Test
    void agregaElNombreDelEdificioAlMapearUnEspacio() {
        Edificio edificio = new Edificio();
        edificio.setNombre("Edificio 3");

        Espacio espacio = new Espacio();
        espacio.setId(12L);
        espacio.setNombre("Baño");
        espacio.setEdificio(edificio);

        var resultado = SearchMapper.toDTO(espacio);

        assertEquals(12L, resultado.id());
        assertEquals("Baño", resultado.nombre());
        assertEquals("ESPACIO", resultado.tipo());
        assertEquals("Edificio 3", resultado.edificioNombre());
    }

    @Test
    void noAgregaContextoAUnResultadoDeEdificio() {
        Edificio edificio = new Edificio();
        edificio.setId(3L);
        edificio.setNombre("Edificio 3");

        var resultado = SearchMapper.toDTO(edificio);

        assertNull(resultado.edificioNombre());
    }
}

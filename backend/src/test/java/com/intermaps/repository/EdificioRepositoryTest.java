package com.intermaps.repository;

import com.intermaps.entity.Edificio;
import com.intermaps.entity.Espacio;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

@SpringBootTest
class EdificioRepositoryTest {

    @Autowired
    private EdificioRepository edificioRepository;

    @Test
    @Transactional
    void findAllDebeTraerEspacios() {
        Edificio edificio = new Edificio();
        edificio.setNombre("Test");

        Espacio espacio = new Espacio();
        espacio.setNombre("Sala");
        espacio.setTipo("aula");
        espacio.setDescripcion("Prueba");
        espacio.setAlias(Set.of("sala"));
        espacio.setPiso(1);

        edificio.agregarEspacio(espacio);
        edificioRepository.save(edificio);

        Edificio guardado = edificioRepository.findAll().stream()
                .filter(e -> "Test".equals(e.getNombre()))
                .findFirst()
                .orElseThrow();

        assertFalse(guardado.getEspacios().isEmpty());
        assertEquals(1, guardado.getEspacios().size());
        assertEquals("Sala", guardado.getEspacios().get(0).getNombre());
    }
}


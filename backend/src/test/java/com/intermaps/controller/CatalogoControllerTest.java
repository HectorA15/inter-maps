package com.intermaps.controller;

import com.intermaps.dto.EdificioDTO;
import com.intermaps.dto.EspacioDTO;
import com.intermaps.service.CatalogoIngestionService;
import com.intermaps.service.CatalogoService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CatalogoControllerTest {

    @Mock
    private CatalogoService catalogoService;

    @InjectMocks
    private CatalogoController catalogoController;

    @Test
    void obtenerEdificiosDebeIncluirEspacios() {
        EdificioDTO dto = new EdificioDTO(
                1L,
                "Endpoint Test",
                List.of("cafeteria"),
                List.of(new EspacioDTO(2L, "Cubiculo", "oficina", "Prueba HTTP", List.of("cub"), 1))
        );
        when(catalogoService.obtenerEdificios(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(dto)));

        ResponseEntity<Page<EdificioDTO>> response = catalogoController.obtenerEdificios(Pageable.unpaged());

        assertEquals(200, response.getStatusCode().value());
        assert response.getBody() != null;
        assertEquals(1, response.getBody().getContent().get(0).espacios().size());
        assertEquals("Cubiculo", response.getBody().getContent().get(0).espacios().get(0).nombre());
    }
}

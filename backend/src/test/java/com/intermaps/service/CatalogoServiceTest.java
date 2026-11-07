package com.intermaps.service;

import com.intermaps.dto.SearchResultDTO;
import com.intermaps.repository.EdificioRepository;
import com.intermaps.repository.EspacioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.Resource;
import tools.jackson.databind.ObjectMapper;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import org.springframework.test.util.ReflectionTestUtils;

class CatalogoServiceTest {

    @Test
    void obtieneZonasConImagenesDesdeMetadatosSeparados() throws Exception {
        EdificioRepository edificioRepository = mock(EdificioRepository.class);
        EspacioRepository espacioRepository = mock(EspacioRepository.class);
        Resource geoJson = mock(Resource.class);
        Resource zonasJson = mock(Resource.class);

        CatalogoService service = new CatalogoService(
                edificioRepository,
                espacioRepository,
                new ObjectMapper()
        );
        ReflectionTestUtils.setField(service, "edificiosGeoJson", geoJson);
        ReflectionTestUtils.setField(service, "zonasFile", zonasJson);

        when(geoJson.getInputStream()).thenReturn(new ByteArrayInputStream("""
                {"features":[{"properties":{"fid":32,"nombre_zona":"Entrada norte","tipo_edificio":"Entrada"}}]}
                """.getBytes(StandardCharsets.UTF_8)));
        when(zonasJson.getInputStream()).thenReturn(new ByteArrayInputStream("""
                [{"id":32,"nombre":"Entrada norte","tipo":"ENTRADA","imagenes":["/Imagenes/entrada-norte.jpg"]}]
                """.getBytes(StandardCharsets.UTF_8)));

        List<SearchResultDTO> zonas = service.obtenerZonas();

        assertEquals(1, zonas.size());
        assertEquals(32L, zonas.get(0).id());
        assertEquals(List.of("/Imagenes/entrada-norte.jpg"), zonas.get(0).imagenes());
    }
}

package com.intermaps.service;

import com.intermaps.dto.EdificioRaw;
import com.intermaps.dto.EspacioRaw;
import com.intermaps.entity.Edificio;
import com.intermaps.entity.Planta;
import com.intermaps.repository.EdificioRepository;
import com.intermaps.repository.PlantaRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.core.io.Resource;
import org.springframework.test.util.ReflectionTestUtils;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CatalogoIngestionServiceTest {

    @Test
    void runDebePersistirEdificioConEspaciosYPiso() throws Exception {
        ObjectMapper objectMapper = mock(ObjectMapper.class);
        EdificioRepository edificioRepository = mock(EdificioRepository.class);
        PlantaRepository plantaRepository = mock(PlantaRepository.class);
        Resource resource = mock(Resource.class);

        CatalogoIngestionService service = new CatalogoIngestionService(objectMapper, edificioRepository, plantaRepository);
        ReflectionTestUtils.setField(service, "edificiosFile", resource);

        InputStream jsonStream = new ByteArrayInputStream("[]".getBytes());
        when(resource.getInputStream()).thenReturn(jsonStream);

        EdificioRaw raw = new EdificioRaw(1L, "1", List.of("edif-uno"), List.of(new EspacioRaw(10L, "Sala A", "aula", "desc", List.of("sala"), 2)));
        when(objectMapper.readValue(any(InputStream.class), any(TypeReference.class))).thenReturn(List.of(raw));

        when(edificioRepository.save(any(Edificio.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(plantaRepository.save(any(Planta.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.run();

        ArgumentCaptor<Edificio> captor = ArgumentCaptor.forClass(Edificio.class);
        verify(edificioRepository, times(2)).save(captor.capture());

        Edificio finalGuardado = captor.getValue();
        assertEquals("1", finalGuardado.getNombre());
        assertEquals(Set.of("edif-uno"), finalGuardado.getAlias());
        assertFalse(finalGuardado.getEspacios().isEmpty());
        assertEquals(1, finalGuardado.getEspacios().size());
        assertEquals("Sala A", finalGuardado.getEspacios().get(0).getNombre());
        assertEquals(2, finalGuardado.getEspacios().get(0).getPiso());
    }
}


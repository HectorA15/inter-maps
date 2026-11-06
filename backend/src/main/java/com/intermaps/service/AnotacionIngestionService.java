package com.intermaps.service;

import com.intermaps.dto.AnotacionRequestDTO;
import com.intermaps.entity.Anotacion;
import com.intermaps.mapper.AnotacionMapper;
import com.intermaps.repository.AnotacionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.Resource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
@Order(2)
public class AnotacionIngestionService implements CommandLineRunner {

    private final ObjectMapper objectMapper;
    private final AnotacionRepository anotacionRepository;

    @Value("classpath:anotaciones.json")
    private Resource anotacionesFile;

    @Override
    public void run(String @NonNull ... args) {
        if (anotacionRepository.count() > 0) {
            log.info("Los marcadores ya existen en la base de datos. Saltando ingesta.");
            return;
        }

        try {
            List<AnotacionRequestDTO> requests = objectMapper.readValue(
                    anotacionesFile.getInputStream(),
                    new TypeReference<>() {
                    }
            );
            List<Anotacion> anotaciones = requests.stream()
                    .map(AnotacionMapper::toEntity)
                    .toList();
            anotacionRepository.saveAll(anotaciones);
            log.info("Se cargaron {} marcadores iniciales.", anotaciones.size());
        } catch (Exception exception) {
            throw new IllegalStateException(
                    "No se pudieron cargar los marcadores iniciales.",
                    exception
            );
        }
    }
}

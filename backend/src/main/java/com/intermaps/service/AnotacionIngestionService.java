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
import java.util.Objects;

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
        try {
            List<AnotacionRequestDTO> requests = objectMapper.readValue(
                    anotacionesFile.getInputStream(),
                    new TypeReference<>() {
                    }
            );
            List<Anotacion> existentes = anotacionRepository.findAll();
            List<Anotacion> faltantes = requests.stream()
                    .map(AnotacionMapper::toEntity)
                    .filter(semilla -> existentes.stream()
                            .noneMatch(existente -> esLaMismaSemilla(existente, semilla)))
                    .toList();

            if (faltantes.isEmpty()) {
                log.info("Los marcadores iniciales ya están sincronizados.");
                return;
            }

            anotacionRepository.saveAll(faltantes);
            log.info("Se agregaron {} marcadores iniciales faltantes.", faltantes.size());
        } catch (Exception exception) {
            throw new IllegalStateException(
                    "No se pudieron cargar los marcadores iniciales.",
                    exception
            );
        }
    }

    private boolean esLaMismaSemilla(Anotacion existente, Anotacion semilla) {
        boolean mismaReferencia = (semilla.getEdificioId() != null
                && Objects.equals(existente.getEdificioId(), semilla.getEdificioId()))
                || (semilla.getEspacioId() != null
                && Objects.equals(existente.getEspacioId(), semilla.getEspacioId()))
                || (semilla.getZonaId() != null
                && Objects.equals(existente.getZonaId(), semilla.getZonaId()));
        boolean mismasCoordenadas = Double.compare(
                existente.getLatitud(),
                semilla.getLatitud()
        ) == 0 && Double.compare(
                existente.getLongitud(),
                semilla.getLongitud()
        ) == 0;

        return Objects.equals(existente.getNombre(), semilla.getNombre())
                && Objects.equals(existente.getTexto(), semilla.getTexto())
                && Objects.equals(existente.getIcono(), semilla.getIcono())
                && (mismaReferencia || mismasCoordenadas);
    }
}

package com.intermaps.service;

import com.intermaps.dto.EdificioRaw;
import com.intermaps.dto.EspacioRaw;
import com.intermaps.entity.Edificio;
import com.intermaps.entity.Espacio;
import com.intermaps.entity.Planta;
import com.intermaps.repository.EdificioRepository;
import com.intermaps.repository.PlantaRepository;
import com.intermaps.util.GeoUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.*;

/**
 * Servicio encargado de la ingesta inicial de datos del catálogo desde archivos JSON hacia la base de datos SQLite.
 */
@Slf4j
@RequiredArgsConstructor
@Service
@Order(1)
@ConditionalOnProperty(name = "intermaps.ingestion.enabled", havingValue = "true", matchIfMissing = true)
public class CatalogoIngestionService implements CommandLineRunner {

    private final ObjectMapper objectMapper;
    private final EdificioRepository edificioRepository;
    private final PlantaRepository plantaRepository;

    @Value("classpath:edificios.json")
    private Resource edificiosFile;

    @Override
    public void run(String @NonNull ... args) {
        log.info("Iniciando la carga de edificios y espacios...");
        iniciarEdificios();
    }

    /**
     * Lee el archivo JSON de edificios y espacios, y procesa cada edificio para guardarlo en la base de datos.
     *
     */
    private void iniciarEdificios() {
        if (edificioRepository.count() > 0) {
            log.info("El catálogo ya existe en la base de datos. Saltando ingesta.");
            return;
        }

        try {
            List<EdificioRaw> edificiosRaw = objectMapper.readValue(
                    edificiosFile.getInputStream(),
                    new TypeReference<>() {
                    }
            );

            for (EdificioRaw edificioRaw : edificiosRaw) {
                procesarEdificio(edificioRaw);
            }

            log.info("Edificios, plantas y espacios cargados correctamente.");
        } catch (Exception e) {
            log.error("Error fatal: No se pudieron cargar los edificios y espacios", e);
        }
    }


    /**
     * Procesa un objeto EdificioRaw y lo guarda en la base de datos, junto con sus plantas y espacios asociados.
     *
     * @param edificioRaw El objeto EdificioRaw que contiene la información del edificio a procesar.
     */
    private void procesarEdificio(EdificioRaw edificioRaw) {
        Edificio edificioNuevo = new Edificio();
        edificioNuevo.setId(edificioRaw.id());
        edificioNuevo.setNombre(GeoUtils.normalizarTexto(edificioRaw.nombre()));
        edificioNuevo.setAlias(edificioRaw.alias() == null ? Set.of() : new LinkedHashSet<>(edificioRaw.alias()));

        final Edificio edificioGuardado = edificioRepository.save(edificioNuevo);

        Map<Integer, Planta> plantasDeEsteEdificio = new HashMap<>();

        // procesa cada espacio que este dentro del edificio
        for (EspacioRaw espacioRaw : edificioRaw.espacios()) {
            Espacio espacio = new Espacio();

            espacio.setId(espacioRaw.id());
            espacio.setNombre(GeoUtils.normalizarTexto(espacioRaw.nombre()));
            espacio.setDescripcion(espacioRaw.descripcion());
            espacio.setAlias(espacioRaw.alias() == null ? Set.of() : new LinkedHashSet<>(espacioRaw.alias()));
            espacio.setTipo(espacioRaw.tipo());

            Integer nivelPiso = espacioRaw.piso();
            espacio.setPiso(nivelPiso);

            if (nivelPiso != null) {
                Planta plantaActual = plantasDeEsteEdificio.computeIfAbsent(nivelPiso, nivel -> {
                    Planta nuevaPlanta = new Planta();
                    nuevaPlanta.setNivel(nivel);
                    nuevaPlanta.setNombre(nivel == 1 ? "Planta Baja" : "Nivel " + nivel);
                    nuevaPlanta.setEdificio(edificioGuardado);
                    return plantaRepository.save(nuevaPlanta);
                });
                plantaActual.agregarEspacio(espacio);
            }

            edificioGuardado.agregarEspacio(espacio);
        }

        edificioRepository.save(edificioGuardado);
    }


}

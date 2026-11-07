package com.intermaps.service;

import com.intermaps.dto.EdificioDTO;
import com.intermaps.dto.EspacioDTO;
import com.intermaps.dto.SearchResultDTO;
import com.intermaps.dto.ZonaRaw;
import com.intermaps.exception.RecursoNoEncontradoException;
import com.intermaps.mapper.EdificioMapper;
import com.intermaps.mapper.EspacioMapper;
import com.intermaps.mapper.SearchMapper;
import com.intermaps.repository.EdificioRepository;
import com.intermaps.repository.EspacioRepository;
import com.intermaps.util.GeoUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.List;
import java.util.stream.Stream;

/**
 * Servicio de negocio encargado de coordinar la lógica del catálogo de edificios.
 * Separa la capa de presentación (Controller) de la capa de acceso a datos (Repository).
 *
 * @RequiredArgsConstructor (Lombok) inyecta automaticamente `EdificioRepository`.
 */
@RequiredArgsConstructor
@Service
public class CatalogoService {

    private final EdificioRepository edificioRepository;
    private final EspacioRepository espacioRepository;
    private final ObjectMapper objectMapper;

    @Value("classpath:edificios.geojson")
    private Resource edificiosGeoJson;

    @Value("classpath:zonas.json")
    private Resource zonasFile;

    /**
     * Consulta los edificios en la base de datos de forma paginada y los transforma a DTOs.
     *
     * @param pageable
     * @return
     */
    public Page<EdificioDTO> obtenerEdificios(Pageable pageable) {
        return edificioRepository.findAll(pageable).map(EdificioMapper::toDTO);
    }

    /**
     * Consulta el id del edificio en la base de datos y lo mapea para convertirlo a un DTO
     *
     * @param id del edificio a buscar
     * @return EdificioDTO con la informacion encontrada
     * @throws RuntimeException si no se encuentra el edificio
     */
    public EdificioDTO obtenerEdificio(Long id) {
        return edificioRepository.findById(id)
                .map(EdificioMapper::toDTO)
                .orElseThrow(() -> new RecursoNoEncontradoException("No se encontró ningún edificio con el ID: " + id));

    }

    public EdificioDTO obtenerEdificioPorNombre(String nombre) {
        String nombreNormalizado = GeoUtils.normalizarParaBusqueda(nombre);
        return edificioRepository.buscarPorNombreOAlias(nombreNormalizado).stream()
                .filter(edificio -> edificio.getNombreBusqueda().equals(nombreNormalizado)
                        || edificio.getAlias().stream()
                        .anyMatch(alias -> GeoUtils.normalizarParaBusqueda(alias)
                                .equals(nombreNormalizado)))
                .findFirst()
                .map(EdificioMapper::toDTO)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No se encontró ningún edificio con el nombre: " + nombre));
    }

    /**
     * Consulta el id del espacio en la base de datos y lo mapea para convertirlo a un DTO
     *
     * @param id del espacio a buscar
     * @return EspacioDTO con la información del espacio encontrado
     * @throws RuntimeException si no se encuentra el espacio
     */
    public EspacioDTO obtenerEspacio(Long id) {
        return espacioRepository.findById(id)
                .map(EspacioMapper::toDTO)
                .orElseThrow(() -> new RecursoNoEncontradoException("No se encontró ningún espacio con el ID: " + id));
    }

    public EdificioDTO obtenerEdificioDeEspacio(Long id) {
        return espacioRepository.findById(id)
                .map(espacio -> EdificioMapper.toDTO(espacio.getEdificio()))
                .orElseThrow(() -> new RecursoNoEncontradoException("No se encontró ningún espacio con el ID: " + id));
    }

    /**
     * Busca resultados de búsqueda por nombre en edificios y espacios.
     *
     * @param nombre Nombre del edificio o espacio a buscar
     * @return Una Lista de SearchResultDTO que contiene los resultados mezclados de edificios y espacios de la búsqueda
     */
    public List<SearchResultDTO> obtenerSearchResult(String nombre) {
        String termino = GeoUtils.normalizarParaBusqueda(nombre);
        List<SearchResultDTO> resultadosCatalogo = Stream.concat(
                edificioRepository.buscarPorNombreOAlias(termino).stream().map(SearchMapper::toDTO),
                espacioRepository.buscarPorNombreOAlias(termino).stream().map(SearchMapper::toDTO)
        ).toList();

        List<SearchResultDTO> resultadosZonas = buscarZonas(termino);
        return Stream.concat(resultadosCatalogo.stream(), resultadosZonas.stream()).toList();
    }

    public List<SearchResultDTO> obtenerZonas() {
        return leerZonas().toList();
    }

    private List<SearchResultDTO> buscarZonas(String termino) {
        return leerZonas()
                .filter(zona -> {
                    String nombre = GeoUtils.normalizarTexto(zona.nombre()).toLowerCase();
                    String nombreAlternativo = nombre.replace("baseball", "beisbol");
                    return nombre.contains(termino) || nombreAlternativo.contains(termino);
                })
                .toList();
    }

    private Stream<SearchResultDTO> leerZonas() {
        try (var inputStream = edificiosGeoJson.getInputStream()) {
            JsonNode features = objectMapper.readTree(inputStream).path("features");
            List<ZonaRaw> metadatos = leerMetadatosZonas();
            return java.util.stream.StreamSupport.stream(features.spliterator(), false)
                    .map(feature -> feature.path("properties"))
                    .filter(properties -> {
                        String tipo = properties.path("tipo_edificio").asText().trim();
                        return tipo.equalsIgnoreCase("deportes")
                                || tipo.equalsIgnoreCase("entrada");
                    })
                    .filter(properties -> properties.path("nombre_zona").isTextual())
                    .map(properties -> {
                        String nombre = properties.path("nombre_zona").asText().trim();
                        ZonaRaw metadata = metadatos.stream()
                                .filter(zona -> GeoUtils.normalizarParaBusqueda(zona.nombre())
                                        .equals(GeoUtils.normalizarParaBusqueda(nombre)))
                                .findFirst()
                                .orElse(null);
                        return new SearchResultDTO(
                                metadata != null ? metadata.id() : properties.path("fid").asLong(),
                                nombre,
                                "ZONA",
                                null,
                                metadata == null ? List.of() : metadata.imagenes());
                    });
        } catch (IOException e) {
            throw new IllegalStateException("No se pudieron leer las zonas del mapa.", e);
        }
    }

    private List<ZonaRaw> leerMetadatosZonas() {
        try (var inputStream = zonasFile.getInputStream()) {
            return objectMapper.readValue(inputStream,
                    new tools.jackson.core.type.TypeReference<List<ZonaRaw>>() {});
        } catch (IOException e) {
            throw new IllegalStateException("No se pudieron leer los metadatos de las zonas.", e);
        }
    }

}
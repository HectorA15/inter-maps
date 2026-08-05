package com.intermaps.service;

import com.intermaps.dto.EdificioDTO;
import com.intermaps.dto.EspacioDTO;
import com.intermaps.dto.SearchResultDTO;
import com.intermaps.exception.RecursoNoEncontradoException;
import com.intermaps.mapper.EdificioMapper;
import com.intermaps.mapper.EspacioMapper;
import com.intermaps.mapper.SearchMapper;
import com.intermaps.repository.EdificioRepository;
import com.intermaps.repository.EspacioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

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

    /**
     * Busca resultados de búsqueda por nombre en edificios y espacios.
     *
     * @param nombre Nombre del edificio o espacio a buscar
     * @return Una Lista de SearchResultDTO que contiene los resultados mezclados de edificios y espacios de la búsqueda
     */
    public List<SearchResultDTO> obtenerSearchResult(String nombre) {
        return Stream.concat(
                edificioRepository.buscarPorNombreOAlias(nombre).stream().map(SearchMapper::toDTO),
                espacioRepository.buscarPorNombreOAlias(nombre).stream().map(SearchMapper::toDTO)
        ).toList();
    }

}
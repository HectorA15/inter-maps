package com.intermaps.controller;

import com.intermaps.dto.EdificioDTO;
import com.intermaps.dto.EspacioDTO;
import com.intermaps.dto.SearchResultDTO;
import com.intermaps.service.CatalogoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/catalogo")
public class CatalogoController {

    private final CatalogoService catalogoService;

    /**
     * Endpoint para obtener una lista paginada de edificios.
     *
     * @param pageable Parámetro de paginación que permite especificar el tamaño de página y el número de página.
     * @return ResponseEntity con un Page de EdificioDTO que contiene la información de los edificios.
     */
    @GetMapping("/data")
    public ResponseEntity<Page<EdificioDTO>> obtenerEdificios(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(catalogoService.obtenerEdificios(pageable));
    }

    /**
     * Endpoint que retorna una Lista mezclada de Espacios y Edificios que coincidan con el nombre buscado.
     *
     * @param nombre Nombre del espacio o edificio a buscar.
     * @return ResponseEntity con una lista de SearchResultDTO que contiene los resultados de la búsqueda.
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<SearchResultDTO>> buscar(@RequestParam String nombre) {
        return ResponseEntity.ok(catalogoService.obtenerSearchResult(nombre));
    }


    /**
     * Endpoint para obtener un espacio por su ID.
     *
     * @param id ID del espacio a obtener.
     * @return ResponseEntity con el EspacioDTO que contiene la información del espacio.
     */
    @GetMapping("/espacio/{id}")
    public ResponseEntity<EspacioDTO> obtenerEspacio(@PathVariable Long id) {
        return ResponseEntity.ok(catalogoService.obtenerEspacio(id));
    }

    /**
     * Endpoint para obtener un edificio por su ID.
     *
     * @param id ID del edificio a obtener.
     * @return ResponseEntity con el EdificioDTO que contiene la información del edificio.
     */
    @GetMapping("/edificio/{id}")
    public ResponseEntity<EdificioDTO> obtenerEdificio(@PathVariable Long id) {
        return ResponseEntity.ok(catalogoService.obtenerEdificio(id));
    }

}
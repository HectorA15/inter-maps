package com.intermaps.controller;

import com.intermaps.dto.RutaGeoJsonDTO;
import com.intermaps.service.NavegacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/navegacion")
public class NavegacionController {

    private final NavegacionService navegacionService;

    /**
     * Endpoint para obtener la ruta más corta entre dos nodos.
     *
     * @param latitud       Latitud del punto de origen
     * @param longitud      Longitud del punto de origen
     * @param idNodoDestino ID del nodo de destino
     */
    @GetMapping("/ruta")
    public ResponseEntity<RutaGeoJsonDTO> obtenerRuta(@RequestParam Double latitud, @RequestParam Double longitud, @RequestParam Long idNodoDestino) {
        return ResponseEntity.ok(navegacionService.snapRutaGeoJson(latitud, longitud, idNodoDestino));
    }
}

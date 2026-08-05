package com.intermaps.mapper;

import com.intermaps.dto.RutaGeoJsonDTO;
import com.intermaps.entity.Nodo;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class RutaMapper {

    private RutaMapper() {
        throw new IllegalStateException("Clase utilitaria");
    }

    /**
     * Convierte una lista de nodos ordenados en un objeto RutaGeoJsonDTO que contiene las coordenadas de la ruta y metadatos adicionales.
     * @param rutaOrdenada Lista de nodos que representan la ruta ordenada.
     * @return Un objeto RutaGeoJsonDTO que contiene las coordenadas de la ruta y metadatos adicionales.
     */
    public static RutaGeoJsonDTO toGeoJson(List<Nodo> rutaOrdenada) {
        List<double[]> coordenadas = rutaOrdenada.stream()
                .map(nodo -> new double[]{nodo.getLongitud(), nodo.getLatitud()})
                .toList();

        // Aquí puedes inyectar metadatos útiles para el frontend en el futuro
        Map<String, Object> properties = new HashMap<>();
        properties.put("nodosRecorridos", rutaOrdenada.size());

        return new RutaGeoJsonDTO(properties, coordenadas);
    }
}
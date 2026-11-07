package com.intermaps.dto;

import com.intermaps.util.Visibilidad;
import com.intermaps.util.AutorAnotacion;

import java.time.LocalDateTime;
import java.util.List;

public record AnotacionDTO(
        Long id,
        String nombre,
        String texto,
        String tipo,
        String color,
        String icono,
        int nivelZoom,
        int tamano,
        double latitud,
        double longitud,
        Long edificioId,
        Long espacioId,
        Long zonaId,
        String zonaNombre,
        List<String> tags,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaModificacion,
        Visibilidad visibilidad,
        AutorAnotacion creadoPor
) {
}

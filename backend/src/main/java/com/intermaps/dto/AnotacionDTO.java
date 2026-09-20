package com.intermaps.dto;

import com.intermaps.util.Visibilidad;

import java.time.LocalDateTime;

public record AnotacionDTO(
        Long id,
        String nombre,
        String texto,
        String tipo,
        String color,
        String icono,
        int tamano,
        double latitud,
        double longitud,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaModificacion,
        Visibilidad visibilidad
) {
}

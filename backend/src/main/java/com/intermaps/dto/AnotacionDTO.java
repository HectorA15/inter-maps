package com.intermaps.dto;

import com.intermaps.util.Visibilidad;

import java.time.LocalDateTime;
import java.util.List;

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
        Long edificioId,
        Long espacioId,
        List<String> tags,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaModificacion,
        Visibilidad visibilidad
) {
}

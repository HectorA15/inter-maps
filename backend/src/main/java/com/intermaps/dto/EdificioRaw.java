package com.intermaps.dto;

import java.util.List;

/**
 * Adaptador de entrada temporal utilizado exclusivamente durante el arranque del sistema.
 * Mapea la estructura exacta del archivo JSON estático a memoria para su posterior sanitización y persistencia,
 * protegiendo el modelo relacional de cambios en la fuente de origen.
 */

public record EdificioRaw(
        Long id,
        String nombre,
        List<String> alias,
        List<EspacioRaw> espacios
) {
}

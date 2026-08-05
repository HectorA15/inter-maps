package com.intermaps.dto;

import java.util.List;

/**
 * Objeto de transferencia de datos que estandariza la respuesta de la API para un espacio físico.
 * Garantiza que la red móvil únicamente transporte los campos necesarios para la interfaz gráfica, omitiendo relaciones de entidad pesadas.
 */
public record EspacioDTO(
        Long id,
        String nombre,
        String tipo,
        String descripcion,
        List<String> alias,
        Integer piso
) {
}

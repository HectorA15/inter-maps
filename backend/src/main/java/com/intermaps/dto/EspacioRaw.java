package com.intermaps.dto;

import java.util.List;


/**
 * Contenedor de datos crudos para la ingesta de espacios anidados.
 * Permite deserializar el JSON de forma plana evitando errores de ciclos infinitos
 * en las relaciones jerárquicas antes de ensamblar las entidades definitivas.
 */
public record EspacioRaw(
        Long id,
        String nombre,
        String tipo,
        String descripcion,
        List<String> alias,
        Integer piso
) {
}
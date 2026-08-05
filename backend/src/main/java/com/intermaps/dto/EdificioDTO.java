package com.intermaps.dto;

import java.util.List;

/**
 * Objeto de transferencia de datos que define el contrato de salida de la API REST para los edificios.
 * Encapsula la información procesada y segura que consumirá el cliente frontend, aislando la vista de la estructura real de la base de datos.
 */
public record EdificioDTO(
        Long id,
        String nombre,
        List<String> alias,
        List<EspacioDTO> espacios
) {
}

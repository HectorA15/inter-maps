package com.intermaps.dto;

import java.util.List;

public record SearchResultDTO (
        Long id,
        String nombre,
        String tipo,
        String edificioNombre,
        List<String> imagenes
) {
}

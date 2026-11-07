package com.intermaps.dto;

import java.util.List;

public record ZonaRaw(
        Long id,
        String nombre,
        String tipo,
        List<String> imagenes
) {
}

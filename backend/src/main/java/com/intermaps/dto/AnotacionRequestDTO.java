package com.intermaps.dto;

import com.intermaps.util.Visibilidad;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record AnotacionRequestDTO(
        @Size(max = 100)
        String nombre,

        @Size(max = 20)
        String texto,

        @NotBlank
        @Size(max = 50)
        String tipo,

        @Size(max = 20)
        String color,

        @Size(max = 50)
        String icono,

        Integer tamano,

        @NotNull
        Double latitud,

        @NotNull
        Double longitud,

        Visibilidad visibilidad,

        Long edificioId,

        Long espacioId,

        Long zonaId,

        @Size(max = 100)
        String zonaNombre,

        List<@Size(max = 40) String> tags
) {
}

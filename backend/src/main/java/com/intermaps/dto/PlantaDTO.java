package com.intermaps.dto;

import java.util.List;

public record PlantaDTO (
    int nivel,
    String nombre,
    List<EspacioDTO> espacios
){   
}

package com.intermaps.mapper;

import com.intermaps.dto.PlantaDTO;
import com.intermaps.entity.Planta;

public class PlantaMapper {
    private PlantaMapper() {}

    public static PlantaDTO toDTO(Planta planta) {
        return new PlantaDTO(
                planta.getNivel(),
                planta.getNombre(),
                planta.getEspacios().stream()
                        .map(EspacioMapper::toDTO)
                        .toList()
        );
    }
}
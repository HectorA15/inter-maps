package com.intermaps.mapper;

import com.intermaps.dto.EdificioDTO;
import com.intermaps.entity.Edificio;

import java.util.ArrayList;

public class EdificioMapper {
    private EdificioMapper() {
        /* This utility class should not be instantiated */
    }

    public static EdificioDTO toDTO(Edificio edificio) {
        return new EdificioDTO(
                edificio.getId(),
                edificio.getNombre(),
                new ArrayList<>(edificio.getAlias()),

                edificio.getPlantas().stream()
                        .map(PlantaMapper::toDTO)
                        .toList()
        );
    }
}

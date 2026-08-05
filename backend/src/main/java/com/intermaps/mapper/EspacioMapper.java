package com.intermaps.mapper;

import com.intermaps.dto.EspacioDTO;
import com.intermaps.entity.Espacio;

import java.util.ArrayList;

public class EspacioMapper {
    private EspacioMapper() {
        /* This utility class should not be instantiated */
    }


    public static EspacioDTO toDTO(Espacio espacio) {
        return new EspacioDTO(
                espacio.getId(),
                espacio.getNombre(),
                espacio.getTipo(),
                espacio.getDescripcion(),
                new ArrayList<>(espacio.getAlias()),
                espacio.getPiso()
        );
    }
}

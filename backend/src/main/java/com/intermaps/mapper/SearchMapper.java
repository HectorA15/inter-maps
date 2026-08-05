package com.intermaps.mapper;

import com.intermaps.dto.SearchResultDTO;
import com.intermaps.entity.Edificio;
import com.intermaps.entity.Espacio;

public class SearchMapper {
    private SearchMapper(){
        /* This utility class should not be instantiated */
    }


    public static SearchResultDTO toDTO(Edificio edificio) {
        return new SearchResultDTO(
                edificio.getId(),
                edificio.getNombre(),
                "EDIFICIO"
        );

    }

    public static SearchResultDTO toDTO(Espacio espacio){
        return new SearchResultDTO(
                espacio.getId(),
                espacio.getNombre(),
                "ESPACIO"
        );
    }
}

package com.intermaps.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
public class RutaGeoJsonDTO {
    // Jackson convertirá esto en la llave "type"
    private final String type = "Feature";
    private Map<String, Object> properties;
    private Geometria geometry;

    public RutaGeoJsonDTO(Map<String, Object> properties, List<double[]> coordenadas) {
        this.properties = properties;
        this.geometry = new Geometria(coordenadas);
    }

    @Getter
    @Setter
    public static class Geometria {
        private final String type = "LineString";
        private List<double[]> coordinates;

        public Geometria(List<double[]> coordinates) {
            this.coordinates = coordinates;
        }
    }
}
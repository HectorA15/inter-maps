package com.intermaps.util;

import java.text.Normalizer;

public class GeoUtils {

    private static final double RADIO_TIERRA_METROS = 6371000.0;

    private GeoUtils() {
        throw new IllegalStateException("Clase de utilidad, no debe ser instanciada");
    }

    /**
     * Fórmula del Haversine.
     * Calcula la distancia real del arco sobre la esfera terrestre.
     */
    public static double calcularDistanciaEnMetros(double lat1, double lon1, double lat2, double lon2) {
        double lat1Rad = Math.toRadians(lat1);
        double lat2Rad = Math.toRadians(lat2);
        double deltaLat = Math.toRadians(lat2 - lat1);
        double deltaLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                        Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return RADIO_TIERRA_METROS * c;
    }


    public static String normalizarTexto(String texto) {
        if (texto == null) return null;
        // Descompone caracteres acentuados en base + acento
        String nfd = Normalizer.normalize(texto, Normalizer.Form.NFD);
        // Elimina los acentos (diacríticos)
        return nfd.replaceAll("\\p{M}", "").toLowerCase();
    }
}
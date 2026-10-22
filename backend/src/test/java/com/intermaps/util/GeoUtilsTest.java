package com.intermaps.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GeoUtilsTest {

    @Test
    void conservaElTextoVisibleYGeneraUnaClaveDeBusquedaSinAcentos() {
        assertEquals("Baño", "Baño".trim());
        assertEquals("bano", GeoUtils.normalizarParaBusqueda(" Baño "));
    }
}

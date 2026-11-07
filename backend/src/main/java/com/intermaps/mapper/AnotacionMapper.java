package com.intermaps.mapper;

import com.intermaps.dto.AnotacionDTO;
import com.intermaps.dto.AnotacionRequestDTO;
import com.intermaps.entity.Anotacion;
import com.intermaps.util.Visibilidad;
import java.util.LinkedHashSet;
import java.util.List;

public final class AnotacionMapper {

    private AnotacionMapper() {
    }

    public static AnotacionDTO toDTO(Anotacion anotacion) {
        return new AnotacionDTO(
                anotacion.getId(),
                anotacion.getNombre(),
                anotacion.getTexto(),
                anotacion.getTipo(),
                anotacion.getColor(),
                anotacion.getIcono(),
                anotacion.getTamano(),
                anotacion.getLatitud(),
                anotacion.getLongitud(),
                anotacion.getEdificioId(),
                anotacion.getEspacioId(),
                anotacion.getZonaId(),
                anotacion.getZonaNombre(),
                anotacion.getTags().stream().toList(),
                anotacion.getFechaCreacion(),
                anotacion.getFechaModificacion(),
                anotacion.getVisibilidad()
        );
    }

    public static Anotacion toEntity(AnotacionRequestDTO request) {
        Anotacion anotacion = new Anotacion();
        actualizarEntidad(anotacion, request);
        return anotacion;
    }

    public static void actualizarEntidad(
            Anotacion anotacion,
            AnotacionRequestDTO request
    ) {
        anotacion.setNombre(request.nombre() == null ? "" : request.nombre().trim());
        anotacion.setTexto(request.texto());
        anotacion.setTipo(request.tipo() == null || request.tipo().isBlank()
                ? "MARCADOR"
                : request.tipo().trim());
        anotacion.setColor(request.color() == null || request.color().isBlank()
                ? "#e03131"
                : request.color());
        anotacion.setIcono(request.icono());
        anotacion.setTamano(request.tamano() == null ? 24 : request.tamano());
        anotacion.setLatitud(request.latitud());
        anotacion.setLongitud(request.longitud());
        anotacion.setEdificioId(request.edificioId());
        anotacion.setEspacioId(request.espacioId());
        anotacion.setZonaId(request.zonaId());
        anotacion.setZonaNombre(request.zonaNombre());
        anotacion.setTags(normalizarTags(request.tags()));
        anotacion.setVisibilidad(
                request.visibilidad() == null
                        ? Visibilidad.PUBLICO
                        : request.visibilidad()
        );
    }

    private static LinkedHashSet<String> normalizarTags(List<String> tags) {
        LinkedHashSet<String> resultado = new LinkedHashSet<>();
        if (tags == null) return resultado;
        tags.stream()
                        .filter(tag -> tag != null && !tag.isBlank())
                        .map(String::trim)
                        .filter(tag -> tag.length() <= 40)
                        .forEach(resultado::add);
        return resultado;
    }
}

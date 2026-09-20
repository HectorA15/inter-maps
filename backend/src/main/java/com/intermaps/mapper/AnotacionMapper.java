package com.intermaps.mapper;

import com.intermaps.dto.AnotacionDTO;
import com.intermaps.dto.AnotacionRequestDTO;
import com.intermaps.entity.Anotacion;
import com.intermaps.util.Visibilidad;

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
        anotacion.setNombre(request.nombre());
        anotacion.setTexto(request.texto());
        anotacion.setTipo(request.tipo());
        anotacion.setColor(request.color());
        anotacion.setIcono(request.icono());
        anotacion.setTamano(request.tamano() == null ? 24 : request.tamano());
        anotacion.setLatitud(request.latitud());
        anotacion.setLongitud(request.longitud());
        anotacion.setVisibilidad(
                request.visibilidad() == null
                        ? Visibilidad.PUBLICO
                        : request.visibilidad()
        );
    }
}

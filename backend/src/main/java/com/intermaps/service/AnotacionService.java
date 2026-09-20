package com.intermaps.service;

import com.intermaps.dto.AnotacionDTO;
import com.intermaps.dto.AnotacionRequestDTO;
import com.intermaps.entity.Anotacion;
import com.intermaps.exception.RecursoNoEncontradoException;
import com.intermaps.mapper.AnotacionMapper;
import com.intermaps.repository.AnotacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class AnotacionService {

    private final AnotacionRepository anotacionRepository;

    public List<AnotacionDTO> obtenerAnotaciones() {
        return anotacionRepository.findAll().stream()
                .map(AnotacionMapper::toDTO)
                .toList();
    }

    public AnotacionDTO obtenerAnotacion(Long id) {
        return AnotacionMapper.toDTO(buscarPorId(id));
    }

    public AnotacionDTO crearAnotacion(AnotacionRequestDTO request) {
        Anotacion anotacion = AnotacionMapper.toEntity(request);
        return AnotacionMapper.toDTO(anotacionRepository.save(anotacion));
    }

    public AnotacionDTO actualizarAnotacion(
            Long id,
            AnotacionRequestDTO request
    ) {
        Anotacion anotacion = buscarPorId(id);
        AnotacionMapper.actualizarEntidad(anotacion, request);
        return AnotacionMapper.toDTO(anotacionRepository.save(anotacion));
    }

    public void eliminarAnotacion(Long id) {
        Anotacion anotacion = buscarPorId(id);
        anotacionRepository.delete(anotacion);
    }

    private Anotacion buscarPorId(Long id) {
        return anotacionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No se encontró ninguna anotación con el ID: " + id
                ));
    }
}

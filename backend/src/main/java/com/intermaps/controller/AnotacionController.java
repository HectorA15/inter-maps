package com.intermaps.controller;

import com.intermaps.dto.AnotacionDTO;
import com.intermaps.dto.AnotacionRequestDTO;
import com.intermaps.service.AnotacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/anotaciones")
public class AnotacionController {

    private final AnotacionService anotacionService;

    @GetMapping
    public ResponseEntity<List<AnotacionDTO>> obtenerAnotaciones() {
        return ResponseEntity.ok(anotacionService.obtenerAnotaciones());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnotacionDTO> obtenerAnotacion(@PathVariable Long id) {
        return ResponseEntity.ok(anotacionService.obtenerAnotacion(id));
    }

    @PostMapping
    public ResponseEntity<AnotacionDTO> crearAnotacion(
            @Valid @RequestBody AnotacionRequestDTO request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(anotacionService.crearAnotacion(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnotacionDTO> actualizarAnotacion(
            @PathVariable Long id,
            @Valid @RequestBody AnotacionRequestDTO request
    ) {
        return ResponseEntity.ok(
                anotacionService.actualizarAnotacion(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarAnotacion(@PathVariable Long id) {
        anotacionService.eliminarAnotacion(id);
        return ResponseEntity.noContent().build();
    }
}

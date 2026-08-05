package com.intermaps.controller.advice;

import com.intermaps.dto.ErrorResponse;
import com.intermaps.exception.RecursoNoEncontradoException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.time.ZoneId;

@RestControllerAdvice
public class GlobalExceptionHandler {

    ZoneId zoneId = ZoneId.of("America/Mexico_City");
    /**
     * Intercepta específicamente cuando no se encuentra un edificio, espacio o ruta.
     * Transforma la excepción en un JSON limpio con un código HTTP 404 (Not Found).
     */
    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<ErrorResponse> handleRecursoNoEncontrado(RecursoNoEncontradoException ex) {
        ErrorResponse error = new ErrorResponse(
                LocalDateTime.now(zoneId),
                HttpStatus.NOT_FOUND.value(),
                HttpStatus.NOT_FOUND.getReasonPhrase(),
                ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * Red de seguridad: Atrapa cualquier otro error inesperado (Bugs, NullPointers, caídas de BD).
     * Devuelve un código 500 (Internal Server Error) para no exponer la traza de Java al exterior.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleExceptionGenerica() {
        ErrorResponse error = new ErrorResponse(
                LocalDateTime.now(zoneId),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                "Ha ocurrido un error interno en el servidor. Contacte al administrador."
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
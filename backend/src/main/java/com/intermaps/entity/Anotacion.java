package com.intermaps.entity;

import java.time.LocalDateTime;
import com.intermaps.util.Visibilidad;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Getter
@Setter
@Entity
@Table(name = "anotaciones")
@EntityListeners(AuditingEntityListener.class)
public class Anotacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 20)
    private String texto;

    @Column(nullable = false, length = 50)
    private String tipo;

    @Column(length = 20)
    private String color;

    @Column(length = 50)
    private String icono;

    private int tamano;

    @Column(nullable = false)
    private double latitud;

    @Column(nullable = false)
    private double longitud;


    @CreatedDate
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @LastModifiedDate
    @Column(name = "fecha_modificacion")
    private LocalDateTime fechaModificacion;
    

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Visibilidad visibilidad = Visibilidad.PUBLICO;
    
    
}
    
package com.intermaps.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Entidad que representa un punto geográfico (vértice) en el mapa del campus para cálculo de rutas.
 */
@Getter
@Setter
@Entity
@Table(name = "nodos")
public class Nodo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double latitud;
    private double longitud;
    private String nombreReferencia;
    private boolean esEntrada;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "edificio_id")
    private Edificio edificio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "espacio_id")
    private Espacio espacio;
}

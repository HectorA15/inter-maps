package com.intermaps.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Entidad que representa la conexión ponderada (tramo de camino) entre dos nodos del mapa.
 */
@Getter
@Setter
@Entity
@Table(name = "aristas")
public class Arista {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "nodo_origen_id")
    private Nodo nodoOrigen;

    @ManyToOne
    @JoinColumn(name = "nodo_destino_id")
    private Nodo nodoDestino;

    private double peso; // Distancia en metros
}

package com.intermaps.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Entidad que representa un nivel/piso dentro de un edificio para agrupar sus espacios.
 */
@Getter
@Setter
@Entity
@Table(name = "plantas")
public class Planta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer nivel;
    private String nombre;
    private Integer ordenVisual;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "edificio_id", nullable = false)
    private Edificio edificio;

    @OneToMany(mappedBy = "planta", fetch = FetchType.LAZY)
    private List<Espacio> espacios = new ArrayList<>();

    public void agregarEspacio(Espacio espacio) {
        if (espacio == null) {
            return;
        }
        espacios.add(espacio);
        espacio.setPlanta(this);
        espacio.setEdificio(this.edificio);
    }
}

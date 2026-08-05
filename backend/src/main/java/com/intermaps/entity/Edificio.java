package com.intermaps.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Entidad que representa un edificio del campus universitario.
 * Almacena su información básica, alias/sinónimos y sus colecciones de plantas y espacios.
 */
@Getter
@Setter
@Entity
@Table(name = "edificios")
public class Edificio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    @ElementCollection
    @CollectionTable(name = "edificio_aliases", joinColumns = @JoinColumn(name = "edificio_id"))
    @Column(name = "alias")
    private Set<String> alias = new LinkedHashSet<>();

    @ElementCollection
    @CollectionTable(name = "edificio_sinonimos", joinColumns = @JoinColumn(name = "edificio_id"))
    @Column(name = "sinonimo")
    private Set<String> sinonimos = new LinkedHashSet<>();

    @OneToMany(mappedBy = "edificio", fetch = FetchType.LAZY)
    private List<Planta> plantas = new ArrayList<>();

    @OneToMany(mappedBy = "edificio", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Espacio> espacios = new ArrayList<>();

    public void agregarPlanta(Planta planta) {
        if (planta == null) {
            return;
        }
        plantas.add(planta);
        planta.setEdificio(this);
    }

    public void agregarEspacio(Espacio espacio) {
        if (espacio == null) {
            return;
        }
        espacios.add(espacio);
        espacio.setEdificio(this);
    }
}

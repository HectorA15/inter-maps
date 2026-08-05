package com.intermaps.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

/**
 * Entidad que representa un espacio físico (aula, laboratorio, oficina, etc.) dentro de un edificio o planta.
 */
@Getter
@Setter
@Entity
@Table(name = "espacios")
public class Espacio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String tipo;
    private String descripcion;

    private Integer piso;

    @ElementCollection
    @CollectionTable(name = "espacio_aliases", joinColumns = @JoinColumn(name = "espacio_id"))
    @Column(name = "alias")
    private Set<String> alias;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "edificio_id", nullable = false)
    private Edificio edificio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "planta_id")
    private Planta planta;
}

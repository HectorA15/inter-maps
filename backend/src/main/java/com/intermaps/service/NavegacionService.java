package com.intermaps.service;

import com.intermaps.dto.RutaGeoJsonDTO;
import com.intermaps.entity.Arista;
import com.intermaps.entity.Nodo;
import com.intermaps.mapper.RutaMapper;
import com.intermaps.repository.AristaRepository;
import com.intermaps.repository.NodoRepository;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

import static com.intermaps.util.GeoUtils.calcularDistanciaEnMetros;

@Slf4j
@Service
@Order(3)
@ConditionalOnProperty(name = "intermaps.ingestion.enabled", havingValue = "true", matchIfMissing = true)
public class NavegacionService implements CommandLineRunner {

    private final AristaRepository aristaRepository;
    private final NodoRepository nodoRepository;
    private final Map<Long, List<NodoAdyacente>> grafoEnMemoria;

    public NavegacionService(AristaRepository aristaRepository, NodoRepository nodoRepository) {
        this.nodoRepository = nodoRepository;
        this.grafoEnMemoria = new HashMap<>();
        this.aristaRepository = aristaRepository;
    }

    @Override
    public void run(String @NonNull ... args) {
        inicializarGrafo();
    }

    /**
     * Inicializa el grafo en memoria a partir de las aristas almacenadas en la base de datos.
     * Cada arista se representa como dos nodos adyacentes, uno para cada dirección, para permitir la navegación bidireccional.
     */
    private void inicializarGrafo() {
        List<Arista> aristas = aristaRepository.findAll();
        for (Arista arista : aristas) {
            Long idNodoOrigen = arista.getNodoOrigen().getId();
            Long idNodoDestino = arista.getNodoDestino().getId();

            // crea un nodo de origen y lo apunta a una dirección de destino con el peso de la arista
            // •-----
            NodoAdyacente nodoAdyacente = new NodoAdyacente(idNodoDestino, arista.getPeso());
            grafoEnMemoria.putIfAbsent(idNodoOrigen, new ArrayList<>());
            grafoEnMemoria.get(idNodoOrigen).add(nodoAdyacente);


            // crea un nodo de destino y lo apunta a una dirección de origen con el peso de la arista
            // -----•
            NodoAdyacente nodoAdyacenteReverso = new NodoAdyacente(idNodoOrigen, arista.getPeso());
            grafoEnMemoria.putIfAbsent(idNodoDestino, new ArrayList<>());
            grafoEnMemoria.get(idNodoDestino).add(nodoAdyacenteReverso);


            // con estos dos hecho ya tenemos los dos caminos de forma bidireccional, •-----•

        }
    }

    /**
     * Algoritmo de Dijkstra para encontrar la ruta más corta entre dos nodos en un grafo ponderado.
     *
     * @return La lista de IDs de los nodos que forman la ruta más corta.
     */
    public List<Long> calcularRuta(Long idOrigen, Long idDestino) {
        Map<Long, Double> distancias = new HashMap<>();
        Map<Long, Long> predecesores = new HashMap<>();
        PriorityQueue<NodoWrapper> colaPrioridad = new PriorityQueue<>();


        distancias.put(idOrigen, 0.0);
        colaPrioridad.add(new NodoWrapper(idOrigen, 0.0));

        while (!colaPrioridad.isEmpty()) {
            NodoWrapper nodoActual = colaPrioridad.poll();

            // Si el nodo actual es el destino, reconstruimos la ruta
            if (nodoActual.idNodo.equals(idDestino)) {
                List<Long> ruta = new ArrayList<>();
                Long nodo = idDestino;
                while (nodo != null) {
                    ruta.add(nodo);
                    nodo = predecesores.get(nodo);
                }
                Collections.reverse(ruta);
                return ruta;
            }

            // devuelve la lista de los nodos a los que esta conectado el nodo actual, si no tiene nodos conectados devuelve una lista vacía
            List<NodoAdyacente> adyacentes = grafoEnMemoria.getOrDefault(nodoActual.idNodo, new ArrayList<>());

            // Recorremos los nodos adyacentes y actualizamos las distancias
            for (NodoAdyacente adyacente : adyacentes) {

                // revisamos cual de todos esos nodos adyacentes tiene la menor distancia
                double nuevaDistancia = distancias.get(nodoActual.idNodo) + adyacente.peso;
                if (nuevaDistancia < distancias.getOrDefault(adyacente.idDestino, Double.MAX_VALUE)) {
                    distancias.put(adyacente.idDestino, nuevaDistancia);
                    predecesores.put(adyacente.idDestino, nodoActual.idNodo);
                    colaPrioridad.add(new NodoWrapper(adyacente.idDestino, nuevaDistancia));
                }
            }
        }
        return new ArrayList<>();
    }

    /**
     * Algoritmo de Snapping:
     * Encuentra el ID del nodo topológico más cercano a una coordenada GPS arbitraria.
     *
     * @param latitudActual  Latitud de la coordenada GPS
     * @param longitudActual Longitud de la coordenada GPS
     * @return ID del nodo más cercano, o null si no se encuentra ningún nodo
     */
    public Long encontrarNodoMasCercano(double latitudActual, double longitudActual) {
        List<Nodo> todosLosNodos = nodoRepository.findAll();

        if (todosLosNodos.isEmpty()) {
            log.error("El grafo está vacío. No hay nodos para hacer snapping.");
            return null;
        }

        Nodo nodoMasCercano = null;
        double distanciaMinima = Double.MAX_VALUE;

        for (Nodo nodo : todosLosNodos) {
            double distancia = calcularDistanciaEnMetros(
                    latitudActual, longitudActual,
                    nodo.getLatitud(), nodo.getLongitud()
            );

            if (distancia < distanciaMinima) {
                distanciaMinima = distancia;
                nodoMasCercano = nodo;
            }
        }

        if (nodoMasCercano == null) {
            log.error("No se encontró un nodo cercano.");
            return null;
        }

        return nodoMasCercano.getId();
    }

    /**
     * Obtiene la ruta más corta entre dos nodos y la transforma en un objeto GeoJSON para su visualización.
     *
     * @param idOrigen  ID del nodo de origen
     * @param idDestino ID del nodo de destino
     * @return Objeto GeoJSON con la ruta
     */
    public RutaGeoJsonDTO obtenerRutaGeoJson(Long idOrigen, Long idDestino) {
        List<Long> rutaIds = calcularRuta(idOrigen, idDestino);

        if (rutaIds.isEmpty()) {
            return RutaMapper.toGeoJson(List.of());
        }

        Map<Long, Nodo> mapaNodos = nodoRepository.findAllById(rutaIds).stream()
                .collect(Collectors.toMap(Nodo::getId, nodo -> nodo));

        List<Nodo> rutaOrdenada = rutaIds.stream()
                .map(mapaNodos::get)
                .toList();

        return RutaMapper.toGeoJson(rutaOrdenada);
    }



    public RutaGeoJsonDTO snapRutaGeoJson(double latitudActual, double longitudActual, Long idNodoDestino){
        Long idNodoCercano = encontrarNodoMasCercano(latitudActual, longitudActual);
        return obtenerRutaGeoJson(idNodoCercano, idNodoDestino);
    }
    /**
     * Clase interna que representa un nodo adyacente en el grafo, con su ID y el peso de la arista que lo conecta al nodo actual.
     */
    public static class NodoAdyacente {
        Long idDestino;
        Double peso;

        public NodoAdyacente(Long idNodo, Double peso) {
            this.idDestino = idNodo;
            this.peso = peso;
        }
    }


    public record NodoWrapper(Long idNodo, double distanciaAcumulada) implements Comparable<NodoWrapper> {

        @Override
            public int compareTo(NodoWrapper otro) {
                return Double.compare(this.distanciaAcumulada, otro.distanciaAcumulada);
            }
        }
}

package com.intermaps.service;

import com.intermaps.entity.Arista;
import com.intermaps.entity.Edificio;
import com.intermaps.entity.Espacio;
import com.intermaps.entity.Nodo;
import com.intermaps.repository.AristaRepository;
import com.intermaps.repository.EdificioRepository;
import com.intermaps.repository.EspacioRepository;
import com.intermaps.repository.NodoRepository;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.intermaps.util.GeoUtils.calcularDistanciaEnMetros;

@Slf4j
@Service
@Order(2)
@ConditionalOnProperty(name = "intermaps.ingestion.enabled", havingValue = "true", matchIfMissing = true)
public class MapaIngestionService implements CommandLineRunner {

    private final ObjectMapper objectMapper;
    private final NodoRepository nodoRepository;
    private final AristaRepository aristaRepository;
    private final EdificioRepository edificioRepository;
    private final EspacioRepository espacioRepository;

    @Value("classpath:rutas.geojson")
    private Resource rutasFile;
    @Value("classpath:entradas.geojson")
    private Resource entradasFile;

    public MapaIngestionService(ObjectMapper objectMapper, NodoRepository nodoRepository, AristaRepository aristaRepository, EdificioRepository edificioRepository, EspacioRepository espacioRepository) {
        this.objectMapper = objectMapper;
        this.nodoRepository = nodoRepository;
        this.aristaRepository = aristaRepository;
        this.edificioRepository = edificioRepository;
        this.espacioRepository = espacioRepository;
    }

    // El metodo run se ejecuta al iniciar la aplicación y llama a inicializarGrafo para cargar los datos de rutas y entradas desde archivos GeoJSON.
    @Override
    public void run(String @NonNull ... args) {
        try {
            inicializarGrafo();
        } catch (Exception e) {
            throw new RuntimeException("Error fatal de I/O", e);
        }

    }

    /**
     * Inicializa el grafo a partir de los archivos GeoJSON de rutas y entradas.
     * Este metodo procesa ambos archivos, creando nodos y aristas en la base de datos y vinculando entradas a los nodos correspondientes.
     * Se asegura de que cada nodo sea único basado en sus coordenadas, y calcula el peso de cada arista como la distancia en metros entre los nodos.
     *
     * @throws RuntimeException Si ocurre un error de I/O al leer los archivos GeoJSON.
     */
    public void inicializarGrafo() {

        if (nodoRepository.count() > 0) {
            log.info("El grafo ya existe en la base de datos. Saltando ingesta.");
            return;
        }

        try {
            Map<String, Nodo> nodosUnicos = new HashMap<>();

            procesarRutas(nodosUnicos);
            procesarEntradas(nodosUnicos);

            log.info("Ingesta topológica completada exitosamente.");

        } catch (IOException e) {
            throw new RuntimeException("Error fatal de I/O al leer los archivos GeoJSON", e);
        }
    }


    /**
     * Procesa las rutas del archivo GeoJSON, creando nodos y aristas en la base de datos.
     *
     * @param nodosUnicos Mapa de nodos únicos indexados por su llave generada a partir de coordenadas.
     * @throws IOException Si ocurre un error al leer el archivo GeoJSON de rutas.
     */
    private void procesarRutas(Map<String, Nodo> nodosUnicos) throws IOException {
        JsonNode raizRutas = objectMapper.readTree(rutasFile.getInputStream());
        JsonNode featuresRutas = raizRutas.get("features");

        for (JsonNode feature : featuresRutas) {
            JsonNode geometry = feature.get("geometry");
            String tipoGeometria = geometry.get("type").asString();
            JsonNode coordenadas = geometry.get("coordinates");

            // Normalización defensiva para exportaciones MultiLineString de QGIS
            if ("MultiLineString".equals(tipoGeometria)) {
                coordenadas = coordenadas.get(0);
            }

            // Extraemos los vertices extremos de la geometría ya normalizada
            JsonNode coordInicio = coordenadas.get(0);
            JsonNode coordFin = coordenadas.get(coordenadas.size() - 1);

            String llaveInicio = generarLlave(coordInicio);
            String llaveFin = generarLlave(coordFin);

            // --- PROCESAMIENTO DE NODOS ---
            Nodo nodoOrigen = obtenerOCrearNodo(llaveInicio, coordInicio, nodosUnicos);
            Nodo nodoDestino = obtenerOCrearNodo(llaveFin, coordFin, nodosUnicos);

            // --- CREACION DE LA ARISTA Y CALCULO DE PESO ---
            Arista arista = new Arista();
            arista.setNodoOrigen(nodoOrigen);
            arista.setNodoDestino(nodoDestino);

            double distanciaMetros = calcularDistanciaEnMetros(
                    nodoOrigen.getLatitud(), nodoOrigen.getLongitud(),
                    nodoDestino.getLatitud(), nodoDestino.getLongitud()
            );

            arista.setPeso(distanciaMetros);
            aristaRepository.save(arista);
        }
    }

    /**
     * Procesa las entradas del archivo GeoJSON y las vincula a los nodos existentes en el grafo.
     *
     * @param nodosUnicos Mapa de nodos únicos indexados por su llave generada a partir de coordenadas.
     * @throws IOException Si ocurre un error al leer el archivo GeoJSON de entradas.
     */
    private void procesarEntradas(Map<String, Nodo> nodosUnicos) throws IOException {
        JsonNode raizEntradas = objectMapper.readTree(entradasFile.getInputStream());
        JsonNode featuresEntradas = raizEntradas.get("features");

        for (JsonNode feature : featuresEntradas) {
            vincularFeatureANodo(feature, nodosUnicos);
        }
    }

    /**
     * Vincula un feature de entrada a un nodo existente en el grafo, asignando el edificio y/o espacio correspondiente.
     *
     * @param feature     El feature GeoJSON que representa la entrada.
     * @param nodosUnicos Mapa de nodos únicos indexados por su llave generada a partir de coordenadas.
     */
    private void vincularFeatureANodo(JsonNode feature, Map<String, Nodo> nodosUnicos) {
        JsonNode coordenadas = feature.get("geometry").get("coordinates");
        Nodo nodo = nodosUnicos.get(generarLlave(coordenadas));

        if (nodo == null) {
            log.error("Inconsistencia de datos: La entrada con coordenadas {} no tiene un nodo correspondiente en el grafo.", coordenadas);
            return;
        }

        JsonNode propEdificio = feature.get("properties").get("edificio");
        if (propEdificio == null || propEdificio.isNull()) {
            return;
        }

        String nombreEdificio = propEdificio.asString();
        Optional<Edificio> edificioOpt = edificioRepository.findByNombre(nombreEdificio);

        if (edificioOpt.isPresent()) {
            nodo.setEdificio(edificioOpt.get());
            nodo.setEsEntrada(true);
            nodo.setNombreReferencia("Entrada a Edificio " + nombreEdificio);
        } else {
            log.error("Inconsistencia de datos: El GeoJSON dice '{}' pero no existe ese Edificio en la base de datos.", nombreEdificio);
            return;
        }

        JsonNode propEspacio = feature.get("properties").get("espacio");
        if (propEspacio != null && !propEspacio.isNull()) {
            String nombreEspacio = propEspacio.asString().toLowerCase();

            List<Espacio> espaciosEncontrados = espacioRepository.buscarPorNombreOAlias(nombreEspacio);

            if (!espaciosEncontrados.isEmpty()) {
                Espacio espacioReal = espaciosEncontrados.get(0);
                nodo.setEspacio(espacioReal);

                nodo.setNombreReferencia("Entrada a " + espacioReal.getNombre());
            } else {
                log.error("Inconsistencia de datos: El GeoJSON dice '{}' pero no existe ese Espacio ni ningún alias en la base de datos.", nombreEspacio);
            }
        }
        nodoRepository.save(nodo);
    }

    /**
     * Genera una firma truncada a 6 decimales (~11 cm de precisión) para evadir
     * errores de precisión de punto flotante al buscar intersecciones espaciales.
     */
    private String generarLlave(JsonNode coordenada) {
        double longitud = coordenada.get(0).asDouble();
        double latitud = coordenada.get(1).asDouble();
        return String.format("%.6f,%.6f", longitud, latitud);
    }

    /**
     * Obtiene un nodo existente a partir de su llave, o crea uno nuevo si no existe.
     *
     * @param llave       La llave única generada a partir de las coordenadas del nodo.
     * @param coordenada  Las coordenadas del nodo en formato GeoJSON.
     * @param nodosUnicos Mapa de nodos únicos indexados por su llave.
     * @return El nodo existente o recién creado.
     */
    private Nodo obtenerOCrearNodo(String llave, JsonNode coordenada, Map<String, Nodo> nodosUnicos) {
        return nodosUnicos.computeIfAbsent(llave, k -> {
            Nodo nuevoNodo = new Nodo();
            nuevoNodo.setLongitud(coordenada.get(0).doubleValue());
            nuevoNodo.setLatitud(coordenada.get(1).doubleValue());
            return nodoRepository.save(nuevoNodo);
        });
    }
}

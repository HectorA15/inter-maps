package service;

import com.intermaps.entity.Arista;
import com.intermaps.entity.Nodo;
import com.intermaps.repository.AristaRepository;
import com.intermaps.service.NavegacionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NavegacionServiceTest {

    @Mock
    private AristaRepository aristaRepository;

    @InjectMocks
    private NavegacionService navegacionService;

    @BeforeEach
    void setUp() throws Exception {
        // 1. Fabricar Nodos falsos simulando IDs de base de datos
        // A=1, B=2, C=3, D=4, E=5, F=6
        Nodo nodoA = new Nodo(); nodoA.setId(1L);
        Nodo nodoB = new Nodo(); nodoB.setId(2L);
        Nodo nodoC = new Nodo(); nodoC.setId(3L);
        Nodo nodoD = new Nodo(); nodoD.setId(4L);
        Nodo nodoE = new Nodo(); nodoE.setId(5L);
        Nodo nodoF = new Nodo(); nodoF.setId(6L);

        // 2. Construir la red de Aristas con los pesos del dibujo original
        List<Arista> aristasSimuladas = new ArrayList<>();
        aristasSimuladas.add(crearArista(nodoA, nodoB, 3.0));
        aristasSimuladas.add(crearArista(nodoA, nodoD, 5.0));
        aristasSimuladas.add(crearArista(nodoB, nodoC, 2.0));
        aristasSimuladas.add(crearArista(nodoC, nodoF, 7.0));
        aristasSimuladas.add(crearArista(nodoD, nodoE, 1.0));
        aristasSimuladas.add(crearArista(nodoE, nodoF, 2.0));

        // 3. Entrenar al Repositorio Fantasma (Mock)
        when(aristaRepository.findAll()).thenReturn(aristasSimuladas);

        // 4. Forzar la inicialización del Grafo
        navegacionService.run();
    }

    @Test
    void probarRutaMasCorta() {
        // Ejecutar Dijkstra desde Nodo A (1L) hasta Nodo F (6L)
        List<Long> rutaCalculada = navegacionService.calcularRuta(1L, 6L);

        // Definir la verdad matemática: El camino esperado es A -> D -> E -> F
        List<Long> rutaEsperada = List.of(1L, 4L, 5L, 6L);

        // Afirmación estricta: Si esto falla, el algoritmo está mal programado
        assertEquals(rutaEsperada, rutaCalculada, "Dijkstra falló: La ruta calculada no es la óptima.");
    }

    // Método auxiliar para no repetir código al instanciar aristas
    private Arista crearArista(Nodo origen, Nodo destino, double peso) {
        Arista arista = new Arista();
        arista.setNodoOrigen(origen);
        arista.setNodoDestino(destino);
        arista.setPeso(peso);
        return arista;
    }
}
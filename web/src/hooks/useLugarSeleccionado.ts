import { useState } from "react";
import type { Edificio, SearchResult } from "../interfaces/ApiInterfaces";
import { CatalogoService } from "../services/apiClient";

// Esta función normaliza un objeto Edificio, asegurando que sus propiedades alias y pisos sean siempre arreglos, incluso si vienen como undefined o null.
function normalizarEdificio(edificio: Edificio): Edificio {
  return {
    ...edificio, // Copiamos todas las propiedades del edificio original.
    alias: Array.isArray(edificio.alias) ? edificio.alias : [], // Si alias no es un arreglo, lo convertimos en un arreglo vacío.
    pisos: Array.isArray(edificio.pisos) ? edificio.pisos : [], // Si pisos no es un arreglo, lo convertimos en un arreglo vacío.
  };
}

function esEdificio(tipo: string) {
  return tipo.trim().toUpperCase() === "EDIFICIO";
}

function esEspacio(tipo: string) {
  return tipo.trim().toUpperCase() === "ESPACIO";
}

// Este hook maneja la selección de un lugar (edificio, espacio o zona) y mantiene el estado del lugar seleccionado y su detalle.
export function useLugarSeleccionado() {
  // Estado para almacenar el lugar seleccionado, que puede ser un edificio, un espacio o una zona.
  const [lugarSeleccionado, setLugarSeleccionado] =
    useState<SearchResult | null>(null);

  // Esta función maneja la selección de un lugar, ya sea un edificio, un espacio o una zona.
  const [edificioDetalle, setEdificioDetalle] = useState<Edificio | null>(null);
  const [numeroSeleccion, setNumeroSeleccion] = useState(0);

  // Esta función maneja la selección de un lugar, ya sea un edificio, un espacio o una zona.
  const seleccionarLugar = async (item: SearchResult, detalle?: Edificio) => {
    setNumeroSeleccion((actual) => actual + 1);

    try {
      // Si se proporciona un detalle completo del edificio, lo usamos directamente.
      if (detalle) {
        setEdificioDetalle(normalizarEdificio(detalle));
        setLugarSeleccionado(item);
        return;
      }

      // Las zonas del mapa, como las áreas deportivas o las entradas, no
      // tienen un detalle de edificio en el backend, pero sí abren el panel.
      if (!esEdificio(item.tipo) && !esEspacio(item.tipo)) {
        setLugarSeleccionado(item);
        setEdificioDetalle({
          id: item.id,
          nombre: item.nombre,
          alias: [],
          pisos: [],
        });
        return;
      }

      // Si el lugar seleccionado es un espacio o un edificio, obtenemos los detalles del edificio correspondiente.
      const edificio = esEspacio(item.tipo)
        ? await CatalogoService.obtenerEdificioDeEspacio(item.id)
        : await CatalogoService.obtenerEdificio(item.id);

      // Normalizamos el edificio antes de guardarlo en el estado.
      setEdificioDetalle(normalizarEdificio(edificio));

      // Si el lugar seleccionado es un espacio, actualizamos el lugar seleccionado para que sea el edificio correspondiente.
      setLugarSeleccionado(
        esEspacio(item.tipo)
          ? {
              id: edificio.id,
              nombre: edificio.nombre,
              tipo: "EDIFICIO",
            }
          : item,
      );
    } catch (error) {
      // Si ocurre un error al obtener los detalles del edificio, lo registramos en la consola.
      console.error("Error al seleccionar el lugar:", error);
    }
  };

  // Retornamos el lugar seleccionado, el detalle del edificio y la función para seleccionar un lugar.
  return {
    lugarSeleccionado,
    edificioDetalle,
    numeroSeleccion,
    seleccionarLugar,
  };
}

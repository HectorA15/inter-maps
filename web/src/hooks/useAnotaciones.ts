import { useCallback, useEffect, useState } from "react";
import type { Anotacion, AnotacionRequest } from "../interfaces/ApiInterfaces";
import { AnotacionesService } from "../services/apiClient";

const COLOR_MARCADORES = "#e03131";

export function useAnotaciones() {
  const [anotaciones, setAnotaciones] = useState<Anotacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    AnotacionesService.obtenerTodas()
      .then((datos) => {
        if (activo) setAnotaciones(datos);
      })
      .catch((err: unknown) => {
        console.error("Error al cargar los marcadores:", err);
        if (activo) setError("No se pudieron cargar los marcadores.");
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  const crearAnotacion = useCallback(async (latitud: number, longitud: number) => {
    const creada = await AnotacionesService.crear({
      nombre: "",
      texto: "",
      tipo: "MARCADOR",
      color: COLOR_MARCADORES,
      latitud,
      longitud,
      tags: [],
      visibilidad: "PUBLICO",
    });
    setAnotaciones((actuales) => [...actuales, creada]);
    return creada;
  }, []);

  const actualizarAnotacion = useCallback(
    async (anotacion: Anotacion, cambios: Partial<AnotacionRequest>) => {
      const request: AnotacionRequest = {
        nombre:
          cambios.texto !== undefined
            ? cambios.texto ?? ""
            : anotacion.nombre,
        texto: anotacion.texto,
        tipo: anotacion.tipo,
        color: anotacion.color,
        icono: anotacion.icono,
        tamano: anotacion.tamano,
        latitud: anotacion.latitud,
        longitud: anotacion.longitud,
        edificioId: anotacion.edificioId,
        espacioId: anotacion.espacioId,
        zonaId: anotacion.zonaId,
        zonaNombre: anotacion.zonaNombre,
        tags: anotacion.tags,
        visibilidad: anotacion.visibilidad,
        ...cambios,
      };
      const actualizada = await AnotacionesService.actualizar(anotacion.id, request);
      setAnotaciones((actuales) =>
        actuales.map((item) => (item.id === actualizada.id ? actualizada : item)),
      );
      return actualizada;
    },
    [],
  );

  const eliminarAnotacion = useCallback(async (id: number) => {
    await AnotacionesService.eliminar(id);
    setAnotaciones((actuales) => actuales.filter((item) => item.id !== id));
  }, []);

  return {
    anotaciones,
    cargando,
    error,
    crearAnotacion,
    actualizarAnotacion,
    eliminarAnotacion,
  };
}

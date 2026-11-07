import { useEffect, useState } from "react";
import { Marker, type MarkerDragEvent } from "react-map-gl/maplibre";
import type { Anotacion, SearchResult } from "../../interfaces/ApiInterfaces";
import {
  DURACION_ANIMACION_SALIDA_MS,
  NAVEGACION_MAPA,
  RANGO_ANIMACION_SALIDA_ZOOM,
  obtenerZoomMinimoMarcador,
} from "./mapConfig";
import { IconoMarcador } from "../Marcadores/IconoMarcador";
import { obtenerEtiquetaIcono } from "../Marcadores/iconosMarcador";

interface MarcadoresMapaProps {
  anotaciones: Anotacion[];
  zoom: number;
  lugarBajoCursor: SearchResult | null;
  lugarSeleccionado?: SearchResult | null;
  onSeleccionar?: (anotacion: Anotacion) => void;
  onMover?: (
    anotacion: Anotacion,
    coordenadas: { latitude: number; longitude: number },
  ) => void | Promise<void>;
}

interface CoordenadasMarcador {
  latitude: number;
  longitude: number;
}

function estaVinculado(
  anotacion: Anotacion,
  lugar: SearchResult | null | undefined,
): boolean {
  if (!lugar) return false;

  const tipo = lugar.tipo.trim().toUpperCase();
  return tipo === "ZONA"
    ? anotacion.zonaId === lugar.id
    : tipo === "EDIFICIO" && anotacion.edificioId === lugar.id;
}

export function MarcadoresMapa({
  anotaciones,
  zoom,
  lugarBajoCursor,
  lugarSeleccionado,
  onSeleccionar,
  onMover,
}: MarcadoresMapaProps) {
  // Mientras se arrastra un marcador se desactiva el crecimiento visual para
  // que la transformación no interfiera con el cálculo de MapLibre.
  const [anotacionArrastrada, setAnotacionArrastrada] = useState<number | null>(
    null,
  );
  // Mantiene la posición visual durante el drag aunque el componente padre
  // se renderice por cambios del hover antes de que termine el PUT.
  const [posicionesLocales, setPosicionesLocales] = useState<
    Record<number, CoordenadasMarcador>
  >({});
  const [marcadoresVisibles, setMarcadoresVisibles] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMarcadoresVisibles((actuales) => {
        const siguientes = { ...actuales };
        let cambio = false;

        for (const anotacion of anotaciones) {
          const zoomMinimo = obtenerZoomMinimoMarcador(anotacion.nivelZoom);
          const zoomInicioAnimacion =
            zoomMinimo - RANGO_ANIMACION_SALIDA_ZOOM;

          if (zoom < zoomInicioAnimacion) {
            if (anotacion.id in siguientes) {
              delete siguientes[anotacion.id];
              cambio = true;
            }
          } else if (zoom >= zoomMinimo && !siguientes[anotacion.id]) {
            siguientes[anotacion.id] = true;
            cambio = true;
          }
        }

        return cambio ? siguientes : actuales;
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [anotaciones, zoom]);
  const zoomMinimoRenderizado =
    NAVEGACION_MAPA.anotacionesZoomMinimo -
    RANGO_ANIMACION_SALIDA_ZOOM;
  if (zoom < zoomMinimoRenderizado) return null;

  const escala = Math.min(
    NAVEGACION_MAPA.anotacionesEscalaMaxima,
    Math.max(NAVEGACION_MAPA.anotacionesEscalaMinima, zoom / 18),
  );

  return (
    <>
      {anotaciones.map((anotacion) => {
        const zoomMinimo = obtenerZoomMinimoMarcador(anotacion.nivelZoom);
        const zoomInicioAnimacion =
          zoomMinimo - RANGO_ANIMACION_SALIDA_ZOOM;
        if (zoom < zoomInicioAnimacion) {
          return null;
        }
        const estaDesapareciendo =
          marcadoresVisibles[anotacion.id] === true && zoom < zoomMinimo;
        const coordenadas =
          posicionesLocales[anotacion.id] ?? {
            latitude: anotacion.latitud,
            longitude: anotacion.longitud,
          };
        const marcadorInflado =
          anotacionArrastrada !== anotacion.id &&
          (estaVinculado(anotacion, lugarBajoCursor) ||
            estaVinculado(anotacion, lugarSeleccionado));
        // Cambia 1.18 para ajustar el crecimiento: 1.10 = 10%, 1.25 = 25%.
        const escalaInflada = marcadorInflado ? 1.18 : 1;
        const texto = anotacion.texto?.trim() ?? "";
        const etiquetaIcono = obtenerEtiquetaIcono(anotacion.icono);
        const tieneContenido = Boolean(anotacion.icono || texto);
        const colorFondo = tieneContenido ? anotacion.color : "#ffffff";
        const colorTexto = tieneContenido ? "#ffffff" : anotacion.color;
        const colorBorde = tieneContenido ? "#ffffff" : anotacion.color;

        return (
          <Marker
            key={anotacion.id}
            longitude={coordenadas.longitude}
            latitude={coordenadas.latitude}
            anchor="bottom"
            draggable
            onClick={(event) => {
              event.originalEvent.stopPropagation();
              onSeleccionar?.(anotacion);
            }}
            onDragStart={() => {
              setAnotacionArrastrada(anotacion.id);
            }}
            onDrag={(event: MarkerDragEvent) => {
              setPosicionesLocales((actuales) => ({
                ...actuales,
                [anotacion.id]: {
                  latitude: event.lngLat.lat,
                  longitude: event.lngLat.lng,
                },
              }));
            }}
            onDragEnd={(event: MarkerDragEvent) => {
              setAnotacionArrastrada(null);
              const resultado = onMover?.(anotacion, {
                latitude: event.lngLat.lat,
                longitude: event.lngLat.lng,
              });
              // La posición temporal se conserva hasta que el backend
              // confirma el PUT; así una actualización del hover no puede
              // devolver visualmente el marcador a su posición anterior.
              Promise.resolve(resultado).finally(() => {
                setPosicionesLocales((actuales) => {
                  const siguientes = { ...actuales };
                  delete siguientes[anotacion.id];
                  return siguientes;
                });
              });
            }}
          >
            <div
              style={{
                transform: `scale(${escala * escalaInflada})`,
                transformOrigin: "center bottom",
                transition: "transform 180ms ease-out",
              }}
            >
              <button
                type="button"
                aria-label={`Marcador ${
                  etiquetaIcono || texto || anotacion.nombre || "sin texto"
                }`}
                onClick={(event) => {
                  event.stopPropagation();
                  onSeleccionar?.(anotacion);
                }}
                className={`relative flex min-h-7 min-w-7 items-center justify-center rounded-xl border-2 px-2 py-1 text-xs font-semibold shadow-lg ${
                  estaDesapareciendo ? "marcador-hundirse" : ""
                }`}
                style={{
                  backgroundColor: colorFondo,
                  color: colorTexto,
                  borderColor: colorBorde,
                  animationDuration: estaDesapareciendo
                    ? `${DURACION_ANIMACION_SALIDA_MS}ms`
                    : undefined,
                }}
              >
                {anotacion.icono ? (
                  <IconoMarcador icono={anotacion.icono} size={20} />
                ) : (
                  texto && <span className="max-w-40 truncate">{texto}</span>
                )}
                <span
                  aria-hidden="true"
                  className="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2"
                  style={{
                    backgroundColor: colorFondo,
                    borderColor: colorBorde,
                  }}
                />
              </button>
            </div>
          </Marker>
        );
      })}
    </>
  );
}

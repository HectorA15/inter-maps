export const NAVEGACION_MAPA = {
  duracionMs: 900,
  padding: 64,
  zoomMaximo: 19,
  anotacionesZoomMinimo: 15.0,
  anotacionesEscalaMinima: 0.65,
  anotacionesEscalaMaxima: 1.1,
} as const;

// Cada nivel representa una distancia mínima de visibilidad. El nivel 1
// aparece más lejos y el nivel 5 exige acercarse más al mapa.
export const NIVELES_ZOOM_MARCADORES = [15, 16, 17, 18, 19] as const;
export const RANGO_ANIMACION_SALIDA_ZOOM = 0.2;
export const DURACION_ANIMACION_SALIDA_MS = 180;

export function obtenerZoomMinimoMarcador(nivelZoom: number): number {
  const nivel = Number.isFinite(nivelZoom)
    ? Math.max(1, Math.min(5, Math.round(nivelZoom)))
    : 1;
  return NIVELES_ZOOM_MARCADORES[nivel - 1];
}

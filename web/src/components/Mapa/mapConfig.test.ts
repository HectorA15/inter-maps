import { describe, expect, it } from "vitest";
import {
  DURACION_ANIMACION_SALIDA_MS,
  NIVELES_ZOOM_MARCADORES,
  RANGO_ANIMACION_SALIDA_ZOOM,
  obtenerZoomMinimoMarcador,
} from "./mapConfig";

describe("visibilidad de marcadores por zoom", () => {
  it("define cinco umbrales ordenados", () => {
    expect(NIVELES_ZOOM_MARCADORES).toHaveLength(5);
    expect([...NIVELES_ZOOM_MARCADORES]).toEqual([15, 16, 17, 18, 19]);
  });

  it("limita niveles inválidos al rango permitido", () => {
    expect(obtenerZoomMinimoMarcador(0)).toBe(15);
    expect(obtenerZoomMinimoMarcador(6)).toBe(19);
    expect(obtenerZoomMinimoMarcador(Number.NaN)).toBe(15);
  });

  it("define una salida breve al cruzar el umbral", () => {
    expect(RANGO_ANIMACION_SALIDA_ZOOM).toBe(0.2);
    expect(DURACION_ANIMACION_SALIDA_MS).toBe(180);
  });
});

import { describe, expect, it } from "vitest";
import {
  encontrarFeatureParaLugar,
  obtenerBoundsDeFeature,
} from "./mapFeatures";

describe("mapFeatures", () => {
  it("calcula los límites de un multipolígono", () => {
    const bounds = obtenerBoundsDeFeature({
      geometry: {
        type: "MultiPolygon",
        coordinates: [
          [
            [
              [-100.2, 25.6],
              [-100.1, 25.6],
              [-100.1, 25.7],
              [-100.2, 25.7],
            ],
          ],
        ],
      },
    });

    expect(bounds).toEqual([
      [-100.2, 25.6],
      [-100.1, 25.7],
    ]);
  });

  it("encuentra una zona por fid", () => {
    const feature = {
      properties: { fid: 15, nombre_zona: "Cancha", tipo_edificio: "deportes" },
    };

    expect(
      encontrarFeatureParaLugar([feature], {
        id: 15,
        nombre: "Otro nombre",
        tipo: "ZONA",
      }),
    ).toBe(feature);
  });

  it("encuentra un edificio por nombre sin distinguir acentos o mayúsculas", () => {
    const feature = {
      properties: { nombre_zona: "Biblioteca", tipo_edificio: "Edificio" },
    };

    expect(
      encontrarFeatureParaLugar([feature], {
        id: 999,
        nombre: "bibliotéca",
        tipo: "EDIFICIO",
      }),
    ).toBe(feature);
  });
});

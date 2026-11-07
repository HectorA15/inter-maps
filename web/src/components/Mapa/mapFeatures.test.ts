import { describe, expect, it } from "vitest";
import {
  encontrarFeatureParaLugar,
  obtenerLugarParaVinculo,
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

  it("no confunde un edificio con una zona que comparte fid", () => {
    const edificio = {
      properties: {
        fid: 3,
        nombre_zona: "Edificio 3",
        tipo_edificio: "Edificio",
      },
    };
    const entrada = {
      properties: {
        fid: 3,
        nombre_zona: "Entrada norte",
        tipo_edificio: "Entrada",
      },
    };

    expect(
      encontrarFeatureParaLugar([entrada, edificio], {
        id: 3,
        nombre: "Edificio 3",
        tipo: "EDIFICIO",
      }),
    ).toBe(edificio);
  });

  it("resuelve el ID de base de datos de un edificio desde su nombre GeoJSON", () => {
    const feature = {
      properties: {
        fid: 3,
        nombre_zona: "Edificio 3",
        tipo_edificio: "Edificio",
      },
    };

    expect(
      obtenerLugarParaVinculo(feature, [
        {
          id: 2,
          nombre: "Edificio 3",
          alias: ["3"],
          imagenes: [],
          pisos: [],
        },
      ]),
    ).toEqual({
      id: 2,
      nombre: "Edificio 3",
      tipo: "EDIFICIO",
    });
  });
});

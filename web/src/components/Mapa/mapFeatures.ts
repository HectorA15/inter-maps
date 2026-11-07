import type { Edificio, SearchResult } from "../../interfaces/ApiInterfaces";

export interface MapFeature {
  geometry?: {
    type?: string;
    coordinates?: unknown;
  };
  properties?: Record<string, unknown>;
}

export type MapBounds = [[number, number], [number, number]];

function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

// Función para obtener un objeto SearchResult a partir de un feature del mapa
export function obtenerLugarDesdeFeature(
  feature: MapFeature | undefined,
): SearchResult | null {
  // Verifica si el feature y sus propiedades existen
  const properties = feature?.properties;
  if (!properties) return null;

  // Intenta obtener el nombre del lugar, priorizando nombre_zona sobre nombre
  const nombre = properties.nombre_zona ?? properties.nombre;
  if (typeof nombre !== "string" || !nombre.trim()) return null;

  // Devuelve un objeto SearchResult con id, nombre y tipo, asegurando que sean del tipo correcto
  return {
    id: typeof properties.fid === "number" ? properties.fid : -1,
    nombre: nombre.trim(),
    tipo:
      typeof properties.tipo_edificio === "string"
        ? properties.tipo_edificio.trim()
        : "ZONA",
  };
}

/**
 * Convierte un feature del GeoJSON en una referencia compatible con los
 * vínculos de los marcadores. Los edificios usan el ID de la base de datos;
 * las zonas usan el `fid` del GeoJSON porque no tienen registro de edificio.
 */
export function obtenerLugarParaVinculo(
  feature: MapFeature | undefined,
  edificios: Edificio[],
): SearchResult | null {
  const properties = feature?.properties;
  const nombre =
    typeof properties?.nombre_zona === "string"
      ? properties.nombre_zona.trim()
      : typeof properties?.nombre === "string"
        ? properties.nombre.trim()
        : "";

  if (!nombre) return null;

  const tipo =
    typeof properties?.tipo_edificio === "string"
      ? properties.tipo_edificio.trim().toUpperCase()
      : "";

  if (tipo === "EDIFICIO") {
    const nombreNormalizado = normalizarTexto(nombre);
    const edificio = edificios.find(
      (item) =>
        normalizarTexto(item.nombre) === nombreNormalizado ||
        item.alias.some((alias) => normalizarTexto(alias) === nombreNormalizado),
    );

    return edificio
      ? {
          id: edificio.id,
          nombre: edificio.nombre,
          tipo: "EDIFICIO",
        }
      : null;
  }

  return typeof properties?.fid === "number"
    ? {
        id: properties.fid,
        nombre,
        tipo: "ZONA",
      }
    : null;
}

function actualizarBounds(
  coordenadas: unknown,
  bounds: { minLon: number; minLat: number; maxLon: number; maxLat: number },
): void {
  if (!Array.isArray(coordenadas)) return;

  if (
    coordenadas.length >= 2 &&
    typeof coordenadas[0] === "number" &&
    typeof coordenadas[1] === "number"
  ) {
    const [longitud, latitud] = coordenadas;
    bounds.minLon = Math.min(bounds.minLon, longitud);
    bounds.minLat = Math.min(bounds.minLat, latitud);
    bounds.maxLon = Math.max(bounds.maxLon, longitud);
    bounds.maxLat = Math.max(bounds.maxLat, latitud);
    return;
  }

  coordenadas.forEach((coordenada) => actualizarBounds(coordenada, bounds));
}

export function obtenerBoundsDeFeature(
  feature: MapFeature | undefined,
): MapBounds | null {
  if (!feature?.geometry?.coordinates) return null;

  const bounds = {
    minLon: Number.POSITIVE_INFINITY,
    minLat: Number.POSITIVE_INFINITY,
    maxLon: Number.NEGATIVE_INFINITY,
    maxLat: Number.NEGATIVE_INFINITY,
  };
  actualizarBounds(feature.geometry.coordinates, bounds);

  if (
    !Number.isFinite(bounds.minLon) ||
    !Number.isFinite(bounds.minLat) ||
    !Number.isFinite(bounds.maxLon) ||
    !Number.isFinite(bounds.maxLat)
  ) {
    return null;
  }

  return [
    [bounds.minLon, bounds.minLat],
    [bounds.maxLon, bounds.maxLat],
  ];
}

export function encontrarFeatureParaLugar(
  features: MapFeature[],
  lugar: SearchResult,
): MapFeature | null {
  const id = lugar.id;
  const nombre = normalizarTexto(lugar.nombre);

  return (
    features.find((feature) => {
      const properties = feature.properties;
      return (
        typeof properties?.fid === "number" &&
        properties.fid === id &&
        lugar.tipo.trim().toUpperCase() === "ZONA"
      );
    }) ??
    features.find((feature) => {
      const properties = feature.properties;
      const nombreFeature =
        typeof properties?.nombre_zona === "string"
          ? properties.nombre_zona
          : typeof properties?.nombre === "string"
            ? properties.nombre
            : "";
      return normalizarTexto(nombreFeature) === nombre;
    }) ??
    null
  );
}

import { useState, useCallback, useEffect } from "react";
import Map, { type ViewStateChangeEvent } from "react-map-gl/maplibre";
import * as maplibregl from "maplibre-gl";
import type { StyleSpecification } from "maplibre-gl";
import { PMTiles, FetchSource, Protocol } from "pmtiles";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Edificio, SearchResult } from "../interfaces/ApiInterfaces";
import { CatalogoService } from "../services/apiClient";

// Registro del protocolo pmtiles.
// Guard via try/catch: StrictMode en dev monta dos veces y addProtocol lanzaria "already exists".
const protocol = new Protocol();
type MapLibreWithProtocol = typeof maplibregl & {
  addProtocol: (name: string, handler: typeof protocol.tile) => void;
};
try {
  (maplibregl as unknown as MapLibreWithProtocol).addProtocol(
    "pmtiles",
    protocol.tile,
  );
} catch (e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  if (!msg.includes("already")) {
    console.warn("[MapaCampus] addProtocol fallo:", e);
  }
}

// Fallback por si el fetch del header falla (offline o archivo corrupto)
// Coords nuevas provistas por el usuario: -100.256703,25.657136,-100.231340,25.673673
const FALLBACK_BOUNDS: [number, number, number, number] = [
  -100.256703, 25.657136, -100.23134, 25.673673,
];
const FALLBACK_CENTER = {
  longitude: (-100.256703 + -100.23134) / 2, // -100.2440215
  latitude: (25.657136 + 25.673673) / 2, // 25.6654045
  zoom: 15,
};

// Paleta clara - derivada de fondo #f8f9fa, sin inventar colores
// Todos los layers del campus usan esta misma paleta para integrarse con basemap light
const estiloClaro: StyleSpecification = {
  version: 8,
  // glyphs solo para nombres de calles principales (web); movil offline lo ocultara si no hay red
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    "mapa-local": {
      type: "vector",
      url: "pmtiles:///guadalupe.pmtiles",
      attribution:
        '<a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a>',
    },
    // Overlays del campus - archivos separados en web/public (4326) como pediste
    "campus-limite": {
      type: "geojson",
      data: "/limites.geojson",
    },
    "campus-asfalto": {
      type: "geojson",
      data: "/asfalto.geojson",
    },
    "campus-caminos": {
      type: "geojson",
      data: "/caminos.geojson",
    },
    "campus-edificios": {
      type: "geojson",
      data: "/edificios.geojson",
    },
    "campus-agua": {
      type: "geojson",
      data: "/agua.geojson",
    },
  },
  layers: [
    // Basemap claro
    {
      id: "fondo",
      type: "background",
      paint: { "background-color": "#f8f9fa" },
    },
    {
      id: "agua",
      type: "fill",
      source: "mapa-local",
      "source-layer": "water",
      paint: { "fill-color": "#a8d8f0" },
    },
    {
      id: "tierra",
      type: "fill",
      source: "mapa-local",
      "source-layer": "earth",
      paint: { "fill-color": "#e9ecef" },
    },
    {
      id: "calles",
      type: "line",
      source: "mapa-local",
      "source-layer": "roads",
      // grosor interpolado: fino a zoom bajo, mas ancho a zoom 19 para campus cerrado
      paint: {
        "line-color": "#adb5bd",
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          13,
          1.2,
          15,
          2.5,
          19,
          6,
        ],
      },
    },
    // Nombres solo de calles principales (major_road/arterial) para no saturar
    {
      id: "calles-nombres",
      type: "symbol",
      source: "mapa-local",
      "source-layer": "roads",
      filter: [
        "in",
        ["get", "kind"],
        ["literal", ["major_road", "arterial", "highway", "trunk"]],
      ],
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["Noto Sans Regular"],
        "text-size": 11,
        "symbol-placement": "line",
        "text-keep-upright": true,
      },
      paint: {
        "text-color": "#495057",
        "text-halo-color": "#f8f9fa",
        "text-halo-width": 1.5,
      },
    },
    {
      id: "edificios-ciudad",
      type: "fill",
      source: "mapa-local",
      "source-layer": "buildings",
      paint: { "fill-color": "#dee2e6", "fill-outline-color": "#ced4da" },
    },
    // --- Overlay campus - opcion A: encima del basemap, colores adaptados a paleta clara ---
    // Terreno del campus (limites) - verde muy tenue, integrado a fondo claro
    {
      id: "campus-limite",
      type: "fill",
      source: "campus-limite",
      paint: { "fill-color": "#e9f5e9", "fill-opacity": 1 },
    },
    {
      id: "campus-limite-borde",
      type: "line",
      source: "campus-limite",
      paint: {
        "line-color": "#a7d8a7",
        "line-width": 1.5,
        "line-dasharray": [4, 2],
      },
    },

    // ---> AGREGA ESTE NUEVO BLOQUE AQUÍ <---
    // Cuerpos de agua internos del campus
    {
      id: "campus-agua-fill",
      type: "fill",
      source: "campus-agua", // Debe llamarse EXACTAMENTE como tu llave en 'sources'
      paint: {
        "fill-color": "#a8d8f0", // Mismo color que usas para el agua del basemap
        "fill-opacity": 0.9,
      },
    },

    // Asfalto / vialidades internas - gris medio, mas oscuro que tierra pero claro que edificios
    {
      id: "campus-asfalto",
      type: "fill",
      source: "campus-asfalto",
      paint: { "fill-color": "#ced4da", "fill-outline-color": "#adb5bd" },
    },
    // Caminos peatonales - mas fino que calles base, mismo gris
    {
      id: "campus-caminos",
      type: "fill",
      source: "campus-caminos",
      paint: { "fill-color": "#dee2e6", "fill-outline-color": "#adb5bd" },
    },
    // Edificios del Tec - blancos para resaltar sobre gris, borde sutil; clickeables
    {
      id: "campus-edificios",
      type: "fill",
      source: "campus-edificios",
      paint: { "fill-color": "#ffffff", "fill-outline-color": "#adb5bd" },
    },
    // Resaltado al seleccionar (se usa con filter, opacidad)
    {
      id: "campus-edificios-resaltado",
      type: "fill",
      source: "campus-edificios",
      paint: { "fill-color": "#1971c2", "fill-opacity": 0.15 },
      filter: ["==", ["get", "fid"], -1], // ninguno por defecto, se cambia en onClick
    },
    // Deportes (canchas) - verde tenue derivado de paleta, filtrado por tipo_edificio
    {
      id: "campus-deportes",
      type: "fill",
      source: "campus-edificios",
      filter: ["==", ["get", "tipo_edificio"], "deportes"],
      paint: {
        "fill-color": "#d3f9d8",
        "fill-outline-color": "#69db7c",
        "fill-opacity": 0.9,
      },
    },
  ],
};
interface MapaCampusProps {
  onEdificioClick: (item: SearchResult, detalle?: Edificio) => void;
}

export function MapaCampus({ onEdificioClick }: MapaCampusProps) {
  const [viewState, setViewState] = useState(FALLBACK_CENTER);
  const [bounds, setBounds] =
    useState<[number, number, number, number]>(FALLBACK_BOUNDS);

  // lee el header del pmtiles en runtime y sincroniza viewState+bounds.
  useEffect(() => {
    let cancelado = false;
    const source = new FetchSource("/guadalupe.pmtiles");
    const p = new PMTiles(source);
    p.getHeader()
      .then((h) => {
        if (cancelado) return;
        const newBounds: [number, number, number, number] = [
          h.minLon,
          h.minLat,
          h.maxLon,
          h.maxLat,
        ];
        setBounds(newBounds);
        setViewState({
          longitude: h.centerLon,
          latitude: h.centerLat,
          zoom: 15,
        });
        console.log("[MapaCampus] header auto-cargado:", h);
      })
      .catch((err: unknown) => {
        console.warn(
          "[MapaCampus] no se pudo leer header pmtiles, usando fallback:",
          err,
        );
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const handleMove = useCallback(
    (evt: ViewStateChangeEvent) => setViewState(evt.viewState),
    [],
  );

  const handleClick = useCallback(
    async (
      e: ViewStateChangeEvent["target"] extends never ? never : unknown,
    ) => {
      // react-map-gl pasa MapLayerMouseEvent con features
      const event = e as unknown as {
        features?: Array<{ properties: Record<string, unknown> }>;
      };
      const feature = event.features?.[0];
      if (feature?.properties) {
        const props = feature.properties as {
          fid?: number;
          nombre_zona?: string;
          nombre?: string;
          tipo_edificio?: string;
        };
        const nombre = props.nombre_zona ?? props.nombre ?? "Edificio";
        if (String(nombre).trim()) {
          if (
            String(props.tipo_edificio ?? "").trim().toLowerCase() ===
            "edificio"
          ) {
          try {
            const edificio = await CatalogoService.obtenerEdificioPorNombre(
              String(nombre),
            );
            onEdificioClick({
              id: edificio.id,
              nombre: edificio.nombre,
              tipo: "EDIFICIO",
            }, edificio);
          } catch (error) {
            console.error(
              "[MapaCampus] no se pudo resolver el edificio:",
              nombre,
              error,
            );
            onEdificioClick({
              id: props.fid ?? -1,
              nombre: String(nombre),
              tipo: "EDIFICIO",
            });
          }
            return;
          }

          onEdificioClick({
            id: props.fid ?? -1,
            nombre: String(nombre),
            tipo: String(props.tipo_edificio ?? "ZONA"),
          });
        }
      }
    },
    [onEdificioClick],
  );

  return (
    <div className="w-full h-screen h-dvh bg-[#111111] relative overflow-hidden">
      <Map
        {...viewState}
        onMove={handleMove}
        onClick={handleClick as unknown as (e: unknown) => void}
        interactiveLayerIds={["campus-edificios", "campus-deportes"]}
        mapLib={maplibregl as unknown as typeof maplibregl}
        mapStyle={estiloClaro}
        maxBounds={bounds}
        minZoom={13}
        maxZoom={21}
        onError={(e: unknown) => {
          const msg = e instanceof Error ? e.message : String(e);
          console.error("[MapaCampus] MapLibre error:", msg, e);
        }}
        onLoad={() => {
          console.log("[MapaCampus] mapa claro cargado, bounds:", bounds);
        }}
        style={{ width: "100%", height: "100%" }}
        reuseMaps
      />
    </div>
  );
}

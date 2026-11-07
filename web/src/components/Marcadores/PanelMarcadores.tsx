import { useEffect, useMemo, useRef, useState } from "react";
import type {
  Anotacion,
  Edificio,
  Espacio,
} from "../../interfaces/ApiInterfaces";
import { CatalogoService } from "../../services/apiClient";
import { ordenarPorNombre } from "../../utils/ordenar";
import { IconoMarcador as IconoMarcadorSVG } from "./IconoMarcador";
import {
  OPCIONES_ICONO,
  obtenerEtiquetaIcono,
} from "./iconosMarcador";

interface PanelMarcadoresProps {
  abierto: boolean;
  modoAdmin: boolean;
  anotaciones: Anotacion[];
  seleccionado: Anotacion | null;
  cargando: boolean;
  error: string | null;
  onAbrir: () => void;
  onCerrar: () => void;
  onSeleccionar: (anotacion: Anotacion) => void;
  onCrear: () => void;
  onActualizar: (
    anotacion: Anotacion,
    cambios: Partial<Anotacion>,
  ) => Promise<void>;
  onEliminar: (id: number) => Promise<void>;
}

interface EspacioCatalogo extends Espacio {
  edificioId: number;
  edificioNombre: string;
}

function IconoMarcador() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function PanelMarcadores({
  abierto,
  modoAdmin,
  anotaciones,
  seleccionado,
  cargando,
  error,
  onAbrir,
  onCerrar,
  onSeleccionar,
  onCrear,
  onActualizar,
  onEliminar,
}: PanelMarcadoresProps) {
  const [edificios, setEdificios] = useState<Edificio[]>([]);
  const [zonas, setZonas] = useState<EspacioCatalogo[]>([]);
  const [borrador, setBorrador] = useState<Anotacion | null>(null);
  const [nuevoTag, setNuevoTag] = useState("");
  const [tagsSeleccionados, setTagsSeleccionados] = useState<string[]>([]);
  const [tipoVinculo, setTipoVinculo] = useState<
    "ninguno" | "edificio" | "espacio" | "zona"
  >("ninguno");
  const seleccionadoRef = useRef(seleccionado);

  useEffect(() => {
    seleccionadoRef.current = seleccionado;
  }, [seleccionado]);

  useEffect(() => {
    if (!abierto || edificios.length > 0) return;
    CatalogoService.obtenerEdificios(0, 1000)
      .then((pagina) => setEdificios(pagina.content))
      .catch((err: unknown) =>
        console.error("Error al cargar opciones de marcadores:", err),
      );
  }, [abierto, edificios.length]);

  useEffect(() => {
    if (!abierto || zonas.length > 0) return;
    CatalogoService.obtenerZonas()
      .then((lugares) =>
        setZonas(
          lugares.map((lugar) => ({
            id: lugar.id,
            nombre: lugar.nombre,
            tipo: lugar.tipo,
            descripcion: "",
            alias: [],
            piso: 0,
            edificioId: 0,
            edificioNombre: "Zona del mapa",
          })),
        ),
      )
      .catch((err: unknown) =>
        console.error("Error al cargar zonas de marcadores:", err),
      );
  }, [abierto, zonas.length]);

  useEffect(() => {
    // The local editor state must reset when a different marker is selected.
    const actual = seleccionadoRef.current;
    setBorrador(actual);
    setNuevoTag("");
    setTipoVinculo(
      actual?.espacioId != null
        ? "espacio"
        : actual?.zonaId != null
          ? "zona"
          : actual?.edificioId != null
            ? "edificio"
            : "ninguno",
    );
  }, [seleccionado?.id]);

  useEffect(() => {
    if (
      !borrador ||
      !seleccionadoRef.current ||
      borrador.id !== seleccionadoRef.current.id
    )
      return;
    const timer = window.setTimeout(() => {
      const actual = seleccionadoRef.current;
      if (!actual) return;
      onActualizar(actual, {
        texto: borrador.texto,
        color: borrador.color,
        icono: borrador.icono,
        nivelZoom: borrador.nivelZoom,
        edificioId: borrador.edificioId,
        espacioId: borrador.espacioId,
        zonaId: borrador.zonaId,
        zonaNombre: borrador.zonaNombre,
        tags: borrador.tags,
      }).catch((err: unknown) =>
        console.error("Error al guardar marcador:", err),
      );
    }, 350);
    return () => window.clearTimeout(timer);
  }, [borrador, onActualizar]);

  const espacios = useMemo<EspacioCatalogo[]>(
    () =>
      ordenarPorNombre(
        edificios.flatMap((edificio) =>
          edificio.pisos.flatMap((piso) =>
            piso.espacios.map((espacio) => ({
              ...espacio,
              edificioId: edificio.id,
              edificioNombre: edificio.nombre,
            })),
          ),
        ),
        (espacio) => `${espacio.nombre} ${espacio.edificioNombre}`,
      ),
    [edificios],
  );

  const edificiosOrdenados = useMemo(
    () => ordenarPorNombre(edificios, (edificio) => edificio.nombre),
    [edificios],
  );

  const anotacionesOrdenadas = useMemo(
    () =>
      ordenarPorNombre(
        anotaciones.filter((anotacion) =>
          tagsSeleccionados.every((tag) => anotacion.tags.includes(tag)),
        ),
        (anotacion) =>
          anotacion.texto ||
          anotacion.nombre ||
          obtenerEtiquetaIcono(anotacion.icono) ||
          "",
      ),
    [anotaciones, tagsSeleccionados],
  );
  const tagsDisponibles = useMemo(
    () =>
      [...new Set(anotaciones.flatMap((anotacion) => anotacion.tags))].sort(
        (a, b) => a.localeCompare(b),
      ),
    [anotaciones],
  );

  const actualizarBorrador = (cambios: Partial<Anotacion>) => {
    setBorrador((actual) => (actual ? { ...actual, ...cambios } : actual));
  };

  const referenciaEdificio = borrador?.edificioId ?? "";
  const referenciaEspacio = borrador?.espacioId ?? "";
  const referenciaZona = borrador?.zonaId ?? "";

  const seleccionarEdificio = (id: number | null) => {
    setTipoVinculo("edificio");
    actualizarBorrador({
      edificioId: id,
      espacioId: null,
      zonaId: null,
      zonaNombre: null,
    });
  };

  const seleccionarEspacio = (id: number | null) => {
    setTipoVinculo("espacio");
    actualizarBorrador({
      edificioId: null,
      espacioId: id,
      zonaId: null,
      zonaNombre: null,
    });
  };

  const seleccionarZona = (zona: EspacioCatalogo | null) => {
    setTipoVinculo("zona");
    actualizarBorrador({
      edificioId: null,
      espacioId: null,
      zonaId: zona?.id ?? null,
      zonaNombre: zona?.nombre ?? null,
    });
  };

  const agregarTag = () => {
    const tag = nuevoTag.trim();
    if (!tag || !borrador || borrador.tags.includes(tag)) return;
    actualizarBorrador({ tags: [...borrador.tags, tag] });
    setNuevoTag("");
  };

  const quitarTag = (tag: string) => {
    if (!borrador) return;
    actualizarBorrador({ tags: borrador.tags.filter((item) => item !== tag) });
  };

  return (
    <div
      className={`fixed right-0 top-0 z-20 h-full w-[min(360px,92vw)] transform transition-transform duration-300 ease-out ${
        abierto ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <button
        type="button"
        onClick={abierto ? onCerrar : onAbrir}
        aria-label={abierto ? "Cerrar marcadores" : "Abrir marcadores"}
        className="absolute -left-10 top-1/2 z-30 flex h-12 w-10 -translate-y-1/2 items-center justify-center rounded-s-md border-y border-l border-gray-200 bg-white/95 text-gray-700 shadow-md hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-100 dark:hover:bg-gray-800"
      >
        <IconoMarcador />
      </button>

      <aside className="flex h-full w-full flex-col border-l border-gray-200 bg-white/95 shadow-2xl backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
        <header className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Marcadores
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {modoAdmin
                ? "Administración de ubicaciones"
                : "Solo lectura para ubicaciones de administración"}
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar marcadores"
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            ×
          </button>
        </header>

        {!borrador ? (
          <>
            <div className="flex-1 overflow-y-auto p-3">
              {cargando && (
                <p className="p-3 text-sm text-gray-500 dark:text-gray-400">
                  Cargando marcadores...
                </p>
              )}
              {error && <p className="p-3 text-sm text-red-600">{error}</p>}
              {tagsDisponibles.length > 0 && (
                <div className="mb-3 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                      Filtrar por tags
                    </span>
                    {tagsSeleccionados.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setTagsSeleccionados([])}
                        className="text-[11px] text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tagsDisponibles.map((tag) => {
                      const seleccionado = tagsSeleccionados.includes(tag);
                      return (
                        <button
                          type="button"
                          key={tag}
                          aria-pressed={seleccionado}
                          onClick={() =>
                            setTagsSeleccionados((actuales) =>
                              seleccionado
                                ? actuales.filter((item) => item !== tag)
                                : [...actuales, tag],
                            )
                          }
                          className={`rounded-full px-2.5 py-1 text-[11px] ${
                            seleccionado
                              ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {!cargando && anotaciones.length === 0 && (
                <p className="p-3 text-sm text-gray-500 dark:text-gray-400">
                  Todavía no hay marcadores.
                </p>
              )}
              {!cargando &&
                anotaciones.length > 0 &&
                anotacionesOrdenadas.length === 0 && (
                  <p className="p-3 text-sm text-gray-500 dark:text-gray-400">
                    No hay marcadores con los tags seleccionados.
                  </p>
                )}
              <div className="space-y-2">
                {anotacionesOrdenadas.map((anotacion) => (
                  <button
                    type="button"
                    key={anotacion.id}
                    onClick={() => onSeleccionar(anotacion)}
                    className="flex w-full items-center gap-3 rounded-xl border border-gray-200 p-3 text-left hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    <span
                      className="h-4 w-4 shrink-0 rounded-full border border-black/10"
                      style={{ backgroundColor: anotacion.color }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                        {anotacion.texto ||
                          anotacion.nombre ||
                          obtenerEtiquetaIcono(anotacion.icono) ||
                          "Marcador sin nombre"}
                      </span>
                      <span className="mt-1 flex flex-wrap gap-1">
                        {anotacion.tags.map((tag) => (
                          <span
                            className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                            key={tag}
                          >
                            {tag}
                          </span>
                        ))}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={onCrear}
              className="m-4 flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
            >
              <span className="text-xl leading-none">+</span>
              Nuevo marcador
            </button>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-5">
            <button
              type="button"
              onClick={() => setBorrador(null)}
              className="mb-5 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              ← Volver a marcadores
            </button>
            <div className="space-y-5">
              <label className="block text-sm text-gray-700 dark:text-gray-300">
                Texto del marcador
                <input
                  value={borrador.texto ?? ""}
                  disabled={Boolean(borrador.icono)}
                  onChange={(event) =>
                    actualizarBorrador({ texto: event.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 placeholder:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-600 dark:placeholder:text-gray-300 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
                  placeholder="Ej. 3 o Entrada"
                />
              </label>
              <div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Icono del marcador
                </span>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    aria-pressed={!borrador.icono}
                    onClick={() => actualizarBorrador({ icono: null })}
                    className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-xs ${
                      !borrador.icono
                        ? "border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span className="text-base leading-none">T</span>
                    Texto
                  </button>
                  {OPCIONES_ICONO.map((opcion) => (
                    <button
                      type="button"
                      key={opcion.id}
                      aria-label={opcion.etiqueta}
                      aria-pressed={borrador.icono === opcion.id}
                      onClick={() =>
                        actualizarBorrador({ icono: opcion.id, texto: "" })
                      }
                      className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-xs ${
                        borrador.icono === opcion.id
                          ? "border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      <IconoMarcadorSVG icono={opcion.id} />
                      {opcion.etiqueta}
                    </button>
                  ))}
                </div>
              </div>
              <label className="block text-sm text-gray-700 dark:text-gray-300">
                Distancia de visibilidad
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={borrador.nivelZoom ?? 1}
                  onChange={(event) =>
                    actualizarBorrador({
                      nivelZoom: Number(event.target.value),
                    })
                  }
                  className="mt-2 w-full accent-gray-900 dark:accent-gray-100"
                />
                <span className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Lejos</span>
                  <span>Nivel {borrador.nivelZoom ?? 1}</span>
                  <span>Cerca</span>
                </span>
              </label>
              <div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Vincular a
                </span>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTipoVinculo("ninguno");
                      actualizarBorrador({ edificioId: null, espacioId: null, zonaId: null, zonaNombre: null });
                    }}
                    className={`rounded-lg px-3 py-2 text-xs ${tipoVinculo === "ninguno" ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"}`}
                  >
                    Ninguno
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTipoVinculo("edificio");
                      actualizarBorrador({ espacioId: null, zonaId: null, zonaNombre: null });
                    }}
                    className={`rounded-lg px-3 py-2 text-xs ${tipoVinculo === "edificio" ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"}`}
                  >
                    Edificio
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTipoVinculo("espacio");
                      actualizarBorrador({ edificioId: null, zonaId: null, zonaNombre: null });
                    }}
                    className={`rounded-lg px-3 py-2 text-xs ${tipoVinculo === "espacio" ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"}`}
                  >
                    Espacio
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTipoVinculo("zona");
                      actualizarBorrador({
                        edificioId: null,
                        espacioId: null,
                      });
                    }}
                    className={`rounded-lg px-3 py-2 text-xs ${
                      tipoVinculo === "zona"
                        ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    }`}
                  >
                    Zona
                  </button>
                </div>
                {tipoVinculo === "edificio" && (
                  <select
                    value={referenciaEdificio}
                    onChange={(event) =>
                      seleccionarEdificio(
                        event.target.value ? Number(event.target.value) : null,
                      )
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <option value="" className="dark:bg-gray-800 dark:text-gray-200">
                      Selecciona un edificio
                    </option>
                    {edificiosOrdenados.map((edificio) => (
                      <option value={edificio.id} key={edificio.id}>
                        {edificio.nombre}
                      </option>
                    ))}
                  </select>
                )}
                {tipoVinculo === "espacio" && (
                  <select
                    value={referenciaEspacio}
                    onChange={(event) =>
                      seleccionarEspacio(
                        event.target.value ? Number(event.target.value) : null,
                      )
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <option value="" className="dark:bg-gray-800 dark:text-gray-200">
                      Selecciona un espacio
                    </option>
                    {espacios.map((espacio) => (
                      <option value={espacio.id} key={espacio.id}>
                        {espacio.nombre} — {espacio.edificioNombre}
                      </option>
                    ))}
                  </select>
                )}
                {tipoVinculo === "zona" && (
                  <select
                    value={referenciaZona}
                    onChange={(event) =>
                      seleccionarZona(
                        zonas.find((zona) => zona.id === Number(event.target.value)) ?? null,
                      )
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <option value="" className="bg-white text-gray-500 dark:bg-gray-800 dark:text-gray-200">
                      Selecciona una zona
                    </option>
                    {zonas.map((zona) => (
                      <option value={zona.id} key={`${zona.tipo}-${zona.id}`}>
                        {zona.nombre}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <label className="block text-sm text-gray-700 dark:text-gray-300">
                Color
                <input
                  type="color"
                  value={borrador.color}
                  onChange={(event) =>
                    actualizarBorrador({ color: event.target.value })
                  }
                  className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-gray-300 bg-transparent p-1 dark:border-gray-600"
                />
              </label>
              <div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Tags
                </span>
                <div className="mt-1 flex gap-2">
                  <input
                    value={nuevoTag}
                    onChange={(event) => setNuevoTag(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        agregarTag();
                      }
                    }}
                    className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-transparent px-3 py-2 placeholder:text-gray-400 dark:border-gray-600 dark:placeholder:text-gray-300"
                    placeholder="salón, baño..."
                  />
                  <button
                    type="button"
                    onClick={agregarTag}
                    className="rounded-lg bg-gray-100 px-3 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  >
                    +
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {borrador.tags.map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => quitarTag(tag)}
                      className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    >
                      {tag} ×
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void onEliminar(borrador.id)}
              className="mt-8 w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30"
            >
              Eliminar marcador
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

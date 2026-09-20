import { useState, useEffect, useMemo, useRef } from "react";
import type { SearchResult } from "../../interfaces/ApiInterfaces";
import { CatalogoService } from "../../services/apiClient";
import { MdDomain, MdPlace } from "react-icons/md";

interface BuscadorProps {
  datos?: SearchResult[];
  onSelect?: (item: SearchResult) => void;
  placeholder?: string;
}

export function Buscador({
  datos,
  onSelect,
  placeholder = "Buscar lugar, aula o edificio...",
}: BuscadorProps) {
  const [textoBusqueda, setTextoBusqueda] = useState<string>("");
  const [resultados, setResultados] = useState<SearchResult[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [mostrarDropdown, setMostrarDropdown] = useState<boolean>(false);
  const [indiceSeleccionado, setIndiceSeleccionado] = useState<number>(-1);

  const contenedorRef = useRef<HTMLDivElement>(null);

  const resultadosLocales = useMemo(() => {
    const query = textoBusqueda
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    if (!datos || datos.length === 0 || !query) return [];

    return datos.filter((item) => {
      const nombreNorm = item.nombre
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      return nombreNorm.includes(query);
    });
  }, [datos, textoBusqueda]);

  const resultadosVisibles =
    datos && datos.length > 0 ? resultadosLocales : resultados;

  // Cerrar el dropdown al hacer clic fuera del componente
  useEffect(() => {
    const manejarClicFuera = (event: MouseEvent) => {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(event.target as Node)
      ) {
        setMostrarDropdown(false);
      }
    };

    document.addEventListener("mousedown", manejarClicFuera);
    return () => {
      document.removeEventListener("mousedown", manejarClicFuera);
    };
  }, []);

  // Efecto de búsqueda con 100ms debounce e instantáneo al borrar
  useEffect(() => {
    const query = textoBusqueda.trim();

    if (!query) {
      return;
    }

    // El filtrado local se deriva durante el render; aquí solo se manejan
    // búsquedas remotas y sus efectos secundarios.
    if (datos && datos.length > 0) {
      return;
    }

    // Búsqueda dinámica en backend con debounce ultra rápido (100ms) y AbortController
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const res = await CatalogoService.buscar(query, controller.signal);
        setResultados(res);
        setMostrarDropdown(true);
        setIndiceSeleccionado(-1);
      } catch (err: unknown) {
        // Verificamos que sea un error estándar de JavaScript o Axios antes de leer .name
        const error = err as { name?: string };
        if (error.name !== "CanceledError" && error.name !== "AbortError") {
          console.error("Error al buscar:", err);
        }
      } finally {
        setCargando(false);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [textoBusqueda, datos]);

  // Función para seleccionar un item del dropdown
  const seleccionarItem = (item: SearchResult) => {
    setTextoBusqueda(capitalizarNombre(item.nombre));
    setMostrarDropdown(false);
    if (onSelect) {
      onSelect(item);
    }
  };

  // Manejar navegación con teclado (ArrowUp, ArrowDown, Enter, Escape)
  const manejarKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!mostrarDropdown || resultadosVisibles.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndiceSeleccionado((prev) =>
        prev < resultadosVisibles.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndiceSeleccionado((prev) =>
        prev > 0 ? prev - 1 : resultadosVisibles.length - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (
        indiceSeleccionado >= 0 &&
        indiceSeleccionado < resultadosVisibles.length
      ) {
        seleccionarItem(resultadosVisibles[indiceSeleccionado]);
      }
    } else if (e.key === "Escape") {
      setMostrarDropdown(false);
    }
  };

  // Función para limpiar la búsqueda y cerrar el dropdown cuando se hace clic en la "X"
  const limpiarBusqueda = () => {
    setTextoBusqueda("");
    setResultados([]);
    setMostrarDropdown(false);
  };

  // Normaliza solo prefijo "aula" para consistencia, preserva el resto tal cual viene del backend
  const capitalizarNombre = (nombre: string): string => {
    if (!nombre) return nombre;
    const trimmed = nombre.trim();
    if (trimmed.toLowerCase().startsWith("aula ")) {
      return "Aula " + trimmed.substring(5).trim().toUpperCase();
    }
    return trimmed;
  };

  return (
    <div
      className="relative w-full max-w-[640px] font-sans"
      ref={contenedorRef}
    >
      {/* Contenedor del input con estados hover y focus-within */}
      <div className="relative flex items-center w-full bg-white border border-[#dfe1e5] rounded-full shadow-[0_1px_6px_rgba(32,33,36,0.1)] hover:shadow-[0_2px_10px_rgba(32,33,36,0.2)] hover:border-transparent focus-within:shadow-[0_2px_10px_rgba(32,33,36,0.2)] focus-within:border-transparent transition duration-200 ease-out px-3.5 h-11 box-border">
        <svg
          className="text-[#9aa0a6] mr-2.5 select-none shrink-0"
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          className="flex-1 border-none outline-none text-[15px] text-[#202124] bg-transparent p-0 placeholder-[#80868b]"
          type="text"
          placeholder={placeholder}
          value={textoBusqueda}
          onChange={(e) => {
            const valor = e.target.value;
            setTextoBusqueda(valor);

            if (!valor.trim()) {
              setResultados([]);
              setCargando(false);
              setMostrarDropdown(false);
              setIndiceSeleccionado(-1);
            } else if (datos && datos.length > 0) {
              setMostrarDropdown(true);
              setIndiceSeleccionado(-1);
            }
          }}
          onFocus={() => textoBusqueda.trim() && setMostrarDropdown(true)}
          onKeyDown={manejarKeyDown}
          autoComplete="off"
        />

        {cargando && (
          <div
            className="w-4 h-4 border-2 border-[#e8eaed] border-t-[#1a73e8] rounded-full animate-spin ml-1.5 shrink-0"
            title="Cargando..."
          />
        )}

        {!cargando && textoBusqueda && (
          <button
            className="bg-transparent border-none text-[#70757a] text-sm cursor-pointer p-1 ml-1.5 rounded-full flex items-center justify-center transition-colors duration-150 ease-out hover:bg-[#f1f3f4] hover:text-[#202124]"
            onClick={limpiarBusqueda}
            title="Limpiar"
            aria-label="Limpiar busqueda"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {mostrarDropdown && (
        <ul className="absolute top-[calc(100%+6px)] left-0 right-0 z-[1000] bg-white rounded z-xl shadow-[0_4px_16px_rgba(0,0,0,0.15)] border border-[#e0e0e0] list-none m-0 py-2 max-h-[320px] overflow-y-auto">
          {resultadosVisibles.length > 0 ? (
            resultadosVisibles.map((item, idx) => (
              <li
                key={`${item.tipo}-${item.id}-${idx}`}
                className={`shrink-0 flex items-center px-4 py-2.5 cursor-pointer text-sm text-[#3c4043] transition-colors duration-100 ease-out hover:bg-[#f1f3f4] ${
                  idx === indiceSeleccionado ? "bg-[#f1f3f4]" : ""
                }`}
                onClick={() => seleccionarItem(item)}
                onMouseEnter={() => setIndiceSeleccionado(idx)}
              >
                <span className="mr-2 text-gray-500">
                  {item.tipo === "EDIFICIO" ? (
                    <MdDomain size={20} />
                  ) : (
                    <MdPlace size={20} />
                  )}
                </span>
                <span className="truncate">
                  {capitalizarNombre(item.nombre)}
                </span>
              </li>
            ))
          ) : (
            <li className="px-4 py-3.5 text-sm text-[#70757a] text-center italic">
              Sin resultados para "{textoBusqueda}"
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

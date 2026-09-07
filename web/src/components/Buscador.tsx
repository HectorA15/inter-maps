import { useState, useEffect, useRef } from "react";
import type { SearchResult } from "../interfaces/ApiInterfaces";
import { CatalogoService } from "../services/apiClient";
import { MdDomain, MdPlace } from "react-icons/md";
import "./Buscador.css";

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
  const seleccionPendiente = useRef(false);

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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- limpieza sincrona necesaria al vaciar input
      setResultados([]);
      setCargando(false);
      setMostrarDropdown(false);
      setIndiceSeleccionado(-1);
      return;
    }

    // Si se pasaron datos estáticos locales, filtrar localmente ignorando acentos
    if (datos && datos.length > 0) {
      if (seleccionPendiente.current) {
        seleccionPendiente.current = false;
        return;
      }
      const queryNorm = query
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      const filtrados = datos.filter((item) => {
        const nombreNorm = item.nombre
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
        return nombreNorm.includes(queryNorm);
      });
      setResultados(filtrados);
      setMostrarDropdown(true);
      setIndiceSeleccionado(-1);
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
    seleccionPendiente.current = true;
    setTextoBusqueda(capitalizarNombre(item.nombre));
    setMostrarDropdown(false);
    if (onSelect) {
      onSelect(item);
    }
  };

  // Manejar navegación con teclado (ArrowUp, ArrowDown, Enter, Escape)
  const manejarKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!mostrarDropdown || resultados.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndiceSeleccionado((prev) =>
        prev < resultados.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndiceSeleccionado((prev) =>
        prev > 0 ? prev - 1 : resultados.length - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (indiceSeleccionado >= 0 && indiceSeleccionado < resultados.length) {
        seleccionarItem(resultados[indiceSeleccionado]);
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
    <div className="contenedor-buscador-relativo" ref={contenedorRef}>
      <div className="input-wrapper">
        <svg
          className="icono-buscar"
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
          className="input-buscador"
          type="text"
          placeholder={placeholder}
          value={textoBusqueda}
          onChange={(e) => {
            const valor = e.target.value;
            setTextoBusqueda(valor);

            // Si el texto está vacío, limpiamos los estados directamente aquí
            if (!valor.trim()) {
              setResultados([]);
              setCargando(false);
              setMostrarDropdown(false);
              setIndiceSeleccionado(-1);
            }
          }}
          onFocus={() => textoBusqueda.trim() && setMostrarDropdown(true)}
          onKeyDown={manejarKeyDown}
          autoComplete="off"
        />
        {cargando && <div className="spinner-cargando" title="Cargando..." />}
        {!cargando && textoBusqueda && (
          <button
            className="boton-limpiar"
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
        <ul className="dropdown-resultados">
          {resultados.length > 0 ? (
            resultados.map((item, idx) => (
              <li
                key={`${item.tipo}-${item.id}-${idx}`}
                className={`item-resultado ${idx === indiceSeleccionado ? "seleccionado" : ""}`}
                onClick={() => seleccionarItem(item)}
                onMouseEnter={() => setIndiceSeleccionado(idx)}
              >
                <span>
                  {item.tipo === "EDIFICIO" ? (
                    <MdDomain size={20} className="icono-resultado" />
                  ) : (
                    <MdPlace size={20} className="icono-resultado" />
                  )}
                </span>
                <span className="nombre-resultado">
                  {capitalizarNombre(item.nombre)}
                </span>
              </li>
            ))
          ) : (
            <li className="item-sin-resultados">
              Sin resultados para "{textoBusqueda}"
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

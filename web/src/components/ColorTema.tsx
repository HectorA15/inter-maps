interface ColorTemaProps {
  temaActual: "claro" | "oscuro";
  onCambiarTema: (nuevoTema: "claro" | "oscuro") => void;
}

export function ColorTema({ temaActual, onCambiarTema }: ColorTemaProps) {
  return (
    <div className="flex w-16 h-8 bg-gray-200 rounded-[8px] overflow-hidden border border-gray-300">
      {/* Botón Izquierdo (Sol) */}
      <button
        onClick={() => onCambiarTema("claro")}
        className={`flex-1 flex justify-center items-center transition-colors cursor-pointer ${
          temaActual === "claro"
            ? "bg-gray-400 text-gray-900 shadow-inner" // Estado Activo
            : "bg-gray-200 text-gray-400 hover:bg-gray-300" // Estado Inactivo
        }`}
        aria-label="Activar modo claro"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      </button>

      {/* Línea divisoria */}
      <div className="w-px bg-gray-300"></div>

      {/* Botón Derecho (Luna) */}
      <button
        onClick={() => onCambiarTema("oscuro")}
        className={`flex-1 flex justify-center items-center transition-colors cursor-pointer ${
          temaActual === "oscuro"
            ? "bg-gray-400 text-gray-900 shadow-inner" // Estado Activo
            : "bg-gray-200 text-gray-400 hover:bg-gray-300" // Estado Inactivo
        }`}
        aria-label="Activar modo oscuro"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </button>
    </div>
  );
}

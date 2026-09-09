import { useState, useEffect } from "react";
import type { SearchResult } from "./interfaces/ApiInterfaces";
import { Buscador } from "./components/Buscador";
import { MapaCampus } from "./components/MapaCampus";
import { PanelInfo } from "./components/PanelInfo";
import { ColorTema } from "./components/ColorTema";

function App() {
  const [edificioSeleccionado, setEdificioSeleccionado] =
    useState<SearchResult | null>(null);

  // para inicializar el tema según la preferencia del sistema operativo
  const [tema, setTema] = useState<"claro" | "oscuro">(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "oscuro"
        : "claro";
    }
    return "claro";
  });

  // para escuchar cambios del sistema operativo
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      setTema(event.matches ? "oscuro" : "claro");
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // para inyectar la clase 'dark' al HTML para que Tailwind funcione
  useEffect(() => {
    const root = document.documentElement;
    if (tema === "oscuro") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [tema]);

  const handleSelect = (item: SearchResult) => {
    setEdificioSeleccionado(item);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white dark:bg-gray-900">
      <MapaCampus onEdificioClick={handleSelect} />

      <div className="absolute top-5 right-4 z-10">
        {/* 4. Le pasamos el estado actual y la función para cambiarlo */}
        <ColorTema temaActual={tema} onCambiarTema={setTema} />
      </div>

      <div className="absolute top-4 left-0 right-0 flex justify-center px-4 z-10 pointer-events-none">
        <div className="w-full max-w-screen-sm pointer-events-auto">
          <Buscador onSelect={handleSelect} />
        </div>
      </div>

      <PanelInfo item={edificioSeleccionado} />
    </div>
  );
}

export default App;

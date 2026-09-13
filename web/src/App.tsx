import { useState, useEffect } from "react";
import type { SearchResult, Edificio } from "./interfaces/ApiInterfaces";
import { Buscador } from "./components/Buscador";
import { MapaCampus } from "./components/MapaCampus";
import { PanelInfo } from "./components/PanelInfo";
import { ColorTema } from "./components/ColorTema";
import { CatalogoService } from "./services/apiClient";

function App() {
  // 1. Lo que selecciona el mapa o buscador (Superficial)
  const [lugarSeleccionado, setLugarSeleccionado] =
    useState<SearchResult | null>(null);

  // 2. Lo que necesita el panel (Profundo, con pisos y espacios)
  const [edificioDetalle, setEdificioDetalle] = useState<Edificio | null>(null);

  const [tema, setTema] = useState<"claro" | "oscuro">(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "oscuro"
        : "claro";
    }
    return "claro";
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      setTema(event.matches ? "oscuro" : "claro");
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (tema === "oscuro") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [tema]);

  // Cuando el mapa hace clic, actualizamos el lugar superficial
  const handleSelect = (item: SearchResult) => {
    setLugarSeleccionado(item);
  };

  // 3. LA MAGIA: Escuchamos el clic y vamos a la base de datos
  useEffect(() => {
    if (!lugarSeleccionado) {
      if (edificioDetalle !== null) {
        setEdificioDetalle(null);
      }
      return;
    }

    if (lugarSeleccionado.tipo === "EDIFICIO") {
      CatalogoService.obtenerEdificio(lugarSeleccionado.id)
        .then((data: Edificio) => {
          setEdificioDetalle(data); // Guardamos la info completa
        })
        .catch((error: Error) => {
          console.error("Error al buscar el edificio en la BD:", error);
          setEdificioDetalle(null);
        });
    }
  }, [lugarSeleccionado]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white dark:bg-gray-900">
      <MapaCampus onEdificioClick={handleSelect} />

      <div className="absolute top-5 right-4 z-10">
        <ColorTema temaActual={tema} onCambiarTema={setTema} />
      </div>

      <div className="absolute top-4 left-0 right-0 flex justify-center px-4 z-10 pointer-events-none">
        <div className="w-full max-w-screen-sm pointer-events-auto">
          <Buscador onSelect={handleSelect} />
        </div>
      </div>

      {/* 4. Le pasamos el detalle completo al panel, no el superficial */}
      <PanelInfo item={edificioDetalle} />
    </div>
  );
}

export default App;

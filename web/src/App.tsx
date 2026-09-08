import { useState } from "react";
import type { SearchResult } from "./interfaces/ApiInterfaces";
import { Buscador } from "./components/Buscador";
import { MapaCampus } from "./components/MapaCampus";
import { PanelInfo } from "./components/PanelInfo";
import { ColorTema } from "./components/ColorTema";

function App() {
  const [edificioSeleccionado, setEdificioSeleccionado] =
    useState<SearchResult | null>(null);

  const handleSelect = (item: SearchResult) => {
    setEdificioSeleccionado(item);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <MapaCampus />

      <div className="absolute top-5 right-4 z-10">
        <ColorTema />
      </div>
      {/* Contenedor del buscador */}
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

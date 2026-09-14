import type { Edificio } from "../interfaces/ApiInterfaces";
import type { SearchResult } from "../interfaces/ApiInterfaces";
import { useState } from "react";
import { Tabs } from "./Tabs";
import {Imagen} from "./Imagenes"
interface PanelInfoProps {
  item: Edificio | null;
  Busqueda:SearchResult | null
}

function PanelInfo({ item,Busqueda }: PanelInfoProps) {
  const [colapsado, setColapsado] = useState(false);
  const pisos = item && Array.isArray(item.pisos) ? item.pisos : [];
    const datoParaImagen = Busqueda || item
  return (
    <div
      className={`
        fixed top-0 left-0 w-80 h-full bg-white shadow-2xl z-50 p-6
        transform transition-transform duration-300 ease-out
        ${item && !colapsado ? "translate-x-0" : "-translate-x-full"}
    `}
    >
      {item && (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {item.nombre}
          </h2>
        </>
      )}

      <button
        className="absolute top-1/2 -translate-y-1/2 left-full flex justify-center items-center rounded-e-md bg-transparent border-y border-r border-gray-200 shadow-md w-3 h-[30%] text-gray-400 hover:text-gray-500 transition-colors cursor-pointer hover:bg-gray-100"
        onClick={() => {
          setColapsado(!colapsado);
        }}
      ></button>


        <Imagen dato={datoParaImagen}>

        </Imagen>



      {item && pisos.length > 0 && (
        <Tabs
          tabs={pisos.map((piso) => piso.nombre)}
          activeTab="Tab 1"
          onTabChange={() => {}}
        />
      )}
    </div>
  );
}

export default PanelInfo

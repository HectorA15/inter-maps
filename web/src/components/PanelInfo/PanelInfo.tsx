import type { Edificio } from "../../interfaces/ApiInterfaces";
import type { SearchResult } from "../../interfaces/ApiInterfaces";
import { useState } from "react";
import { Tabs } from "./Tabs";
import { Imagen } from "./Imagenes";
import EspaciosPiso from "./EspaciosPiso";

interface PanelInfoProps {
  item: Edificio | null;
  busqueda: SearchResult | null;
}

function PanelInfo({ item, busqueda }: PanelInfoProps) {
  const [colapsado, setColapsado] = useState(false);
  const [pisoActivo, setPisoActivo] = useState("");
  const [idAnterior, setIdAnterior] = useState(item?.id);

  const pisos = item && Array.isArray(item.pisos) ? item.pisos : [];
  const datoParaImagen = busqueda || item;

  // verifica si el id del edifcio seleccionado cambio
  if (item?.id !== idAnterior) {
    setIdAnterior(item?.id);
    setColapsado(false);
    setPisoActivo(pisos[0]?.nombre ?? "");
  }

  const pisoSeleccionado =
    pisos.find((piso) => piso.nombre === pisoActivo) ?? pisos[0];

  return (
    <div
      className={`
        fixed top-0 left-0 w-80 h-full bg-white shadow-2xl z-50 p-6
        transform transition-transform duration-300 ease-out
        ${item && !colapsado ? "translate-x-0" : "-translate-x-full"}
    `}
    >
      <button
        className="absolute top-1/2 -translate-y-1/2 left-full flex justify-center items-center rounded-e-md bg-transparent border-y border-r border-gray-200 shadow-md w-3 h-[30%] text-gray-400 hover:text-gray-500 transition-colors cursor-pointer hover:bg-gray-100"
        onClick={() => {
          setColapsado(!colapsado);
        }}
      ></button>

      <Imagen dato={datoParaImagen}></Imagen>

      {item && (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {item.nombre}
          </h2>
        </>
      )}

      {item && pisos.length > 0 && (
        <>
          <Tabs
            tabs={pisos.map((piso) => piso.nombre)}
            activeTab={pisoSeleccionado?.nombre ?? ""}
            onTabChange={setPisoActivo}
          />
          <EspaciosPiso pisoActivo={pisoActivo} edificio={item} />
        </>
      )}
      {item && pisos.length === 0 && (
        <p className="text-sm text-gray-500">
          No hay pisos registrados para este edificio.
        </p>
      )}
    </div>
  );
}

export default PanelInfo;

import type { Edificio } from "../../interfaces/ApiInterfaces";
import type { SearchResult } from "../../interfaces/ApiInterfaces";
import { useState } from "react";
import { Tabs } from "./Tabs";
import { Imagen } from "./Imagenes";
import EspaciosPiso from "./EspaciosPiso";
import { ordenarPorNombre } from "../../utils/ordenar";

interface PanelInfoProps {
  item: Edificio | null;
  busqueda: SearchResult | null;
}

function PanelInfo({ item, busqueda }: PanelInfoProps) {
  const [colapsado, setColapsado] = useState(false);
  const [pisoActivo, setPisoActivo] = useState("");
  const [idAnterior, setIdAnterior] = useState(item?.id);

  const pisos =
    item && Array.isArray(item.pisos)
      ? ordenarPorNombre(item.pisos, (piso) => piso.nombre)
      : [];
  const datoParaImagen = item || busqueda;

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
        fixed top-0 left-0 z-50 h-full w-100 bg-white shadow-2xl dark:bg-gray-900
        transform transition-transform duration-300 ease-out
        ${item && !colapsado ? "panel-slide-in" : ""}
        ${item && !colapsado ? "translate-x-0" : "-translate-x-full"}
    `}
    >
      <button
        className="absolute left-full top-1/2 flex h-[30%] w-3 -translate-y-1/2 cursor-pointer items-center justify-center rounded-e-md border-y border-r border-gray-200 bg-gray-100/80 text-gray-400 shadow-md transition-colors hover:bg-gray-100 hover:text-gray-500 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-400 dark:hover:bg-gray-700"
        onClick={() => {
          setColapsado(!colapsado);
        }}
      ></button>

      <div className="flex h-full flex-col overflow-y-auto">
        <Imagen dato={datoParaImagen} />

        <div className="p-6">
          {item && (
            <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-100">
              {item.nombre}
            </h2>
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
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No hay pisos registrados para este edificio.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PanelInfo;

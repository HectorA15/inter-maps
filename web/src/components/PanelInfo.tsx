import type { Edificio } from "../interfaces/ApiInterfaces";
import { useState } from "react";
import { Tabs } from "./Tabs";
interface PanelInfoProps {
  item: Edificio | null;
}

export function PanelInfo({ item }: PanelInfoProps) {
  const [colapsado, setColapsado] = useState(false);

  // Estado auxiliar para rastrear si el item cambió
  const [idAnterior, setIdAnterior] = useState(item?.id);

  // Lógica de reseteo durante la fase de renderizado
  if (item?.id !== idAnterior) {
    setIdAnterior(item?.id); // Actualizamos la memoria
    setColapsado(false); // Forzamos a que el panel se abra
  }
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

      {item && (
        <Tabs
          tabs={item.pisos.map((piso) => piso.nombre)}
          activeTab="Tab 1"
          onTabChange={() => {}}
        />
      )}
    </div>
  );
}

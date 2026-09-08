import type { SearchResult } from "../interfaces/ApiInterfaces";

interface PanelInfoProps {
  item: SearchResult | null;
}

export function PanelInfo({ item }: PanelInfoProps) {
  return (
    <div
      className={`
        fixed top-0 left-0 w-80 h-full bg-white shadow-2xl z-50 p-6
        transform transition-transform duration-300 ease-out
        ${item ? "translate-x-0" : "-translate-x-full"}
    `}
    >
      {item && (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {item.nombre}
          </h2>
          <p className="text-sm text-gray-500 uppercase">Tipo: {item.tipo}</p>
        </>
      )}
    </div>
  );
}

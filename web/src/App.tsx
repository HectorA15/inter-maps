import { Buscador } from "./components/Buscador/Buscador";
import { MapaCampus } from "./components/Mapa/MapaCampus";
import PanelInfo from "./components/PanelInfo/PanelInfo";
import { ColorTema } from "./components/Tema/ColorTema";
import { useTema } from "./hooks/useTema";
import { useLugarSeleccionado } from "./hooks/useLugarSeleccionado";

function App() {
  // Obtenemos el lugar seleccionado, el detalle del edificio y la función para seleccionar un lugar desde el hook useLugarSeleccionado.
  const {
    lugarSeleccionado,
    edificioDetalle,
    numeroSeleccion,
    seleccionarLugar,
  } = useLugarSeleccionado();

  // Obtenemos el tema actual y la función para cambiar el tema desde el hook useTema.
  const { tema, cambiarTema } = useTema();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white dark:bg-gray-900">
      <MapaCampus onEdificioClick={seleccionarLugar} />

      <div className="absolute top-5 right-4 z-10">
        <ColorTema temaActual={tema} onCambiarTema={cambiarTema} />
      </div>

      <div className="absolute top-4 left-0 right-0 flex justify-center px-4 z-10 pointer-events-none">
        <div className="w-full max-w-screen-sm pointer-events-auto">
          <Buscador onSelect={seleccionarLugar} />
        </div>
      </div>

      <PanelInfo
        key={
          edificioDetalle
            ? `${edificioDetalle.id}-${edificioDetalle.pisos.length}-${numeroSeleccion}`
            : `sin-edificio-${numeroSeleccion}`
        }
        item={edificioDetalle}
        busqueda={lugarSeleccionado}
      />
    </div>
  );
}

export default App;

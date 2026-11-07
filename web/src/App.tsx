import { useCallback, useState } from "react";
import { Buscador } from "./components/Buscador/Buscador";
import { MapaCampus } from "./components/Mapa/MapaCampus";
import { PanelMarcadores } from "./components/Marcadores/PanelMarcadores";
import PanelInfo from "./components/PanelInfo/PanelInfo";
import { ColorTema } from "./components/Tema/ColorTema";
import type { Anotacion } from "./interfaces/ApiInterfaces";
import { useAnotaciones } from "./hooks/useAnotaciones";
import { useTema } from "./hooks/useTema";
import { useLugarSeleccionado } from "./hooks/useLugarSeleccionado";

function App() {
  // Obtenemos el lugar seleccionado, el detalle del edificio y la función para seleccionar un lugar desde el hook useLugarSeleccionado.
  const {
    lugarSeleccionado,
    edificioDetalle,
    seleccionarLugar,
  } = useLugarSeleccionado();

  // Obtenemos el tema actual y la función para cambiar el tema desde el hook useTema.
  const { tema, cambiarTema } = useTema();
  const {
    anotaciones,
    cargando: cargandoAnotaciones,
    error: errorAnotaciones,
    crearAnotacion,
    actualizarAnotacion,
    eliminarAnotacion,
  } = useAnotaciones();
  const [marcadoresAbiertos, setMarcadoresAbiertos] = useState(false);
  const [marcadorSeleccionado, setMarcadorSeleccionado] =
    useState<Anotacion | null>(null);
  const [marcadorEnfocado, setMarcadorEnfocado] =
    useState<Anotacion | null>(null);
  const [centroMapa, setCentroMapa] = useState({
    latitude: 25.6654,
    longitude: -100.244,
  });

  const crearMarcador = async () => {
    const creado = await crearAnotacion(
      centroMapa.latitude,
      centroMapa.longitude,
    );
    setMarcadorSeleccionado(creado);
    setMarcadorEnfocado(creado);
    setMarcadoresAbiertos(true);
  };

  const seleccionarMarcador = (anotacion: Anotacion) => {
    setMarcadorSeleccionado(anotacion);
    setMarcadorEnfocado(anotacion);
  };

  const actualizarMarcador = useCallback(async (
    anotacion: Anotacion,
    cambios: Partial<Anotacion>,
  ) => {
    const actualizado = await actualizarAnotacion(anotacion, cambios);
    setMarcadorSeleccionado((actual) =>
      actual?.id === actualizado.id ? actualizado : actual,
    );
  }, [actualizarAnotacion]);

  const moverMarcador = useCallback(async (
    anotacion: Anotacion,
    coordenadas: { latitude: number; longitude: number },
  ) => {
    await actualizarMarcador(anotacion, {
      latitud: coordenadas.latitude,
      longitud: coordenadas.longitude,
    });
  }, [actualizarMarcador]);

  const borrarMarcador = async (id: number) => {
    await eliminarAnotacion(id);
    setMarcadorSeleccionado(null);
    setMarcadorEnfocado(null);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white dark:bg-gray-900">
      <MapaCampus
        onEdificioClick={seleccionarLugar}
        lugarSeleccionado={lugarSeleccionado}
        edificioDetalle={edificioDetalle}
        tema={tema}
        anotaciones={anotaciones}
        anotacionEnfocada={marcadorEnfocado}
        onCentroCambio={setCentroMapa}
        onAnotacionSeleccionada={seleccionarMarcador}
        onAnotacionMovida={moverMarcador}
      />

      <div className="absolute top-5 right-4 z-10">
        <ColorTema temaActual={tema} onCambiarTema={cambiarTema} />
      </div>

      <div className="absolute top-4 left-0 right-0 flex justify-center px-4 z-10 pointer-events-none">
        <div className="w-full max-w-screen-sm pointer-events-auto">
          <Buscador onSelect={seleccionarLugar} />
        </div>
      </div>

      <PanelInfo
        item={edificioDetalle}
        busqueda={lugarSeleccionado}
      />
      <PanelMarcadores
        abierto={marcadoresAbiertos}
        anotaciones={anotaciones}
        seleccionado={marcadorSeleccionado}
        cargando={cargandoAnotaciones}
        error={errorAnotaciones}
        onAbrir={() => setMarcadoresAbiertos(true)}
        onCerrar={() => {
          setMarcadoresAbiertos(false);
          setMarcadorSeleccionado(null);
        }}
        onSeleccionar={seleccionarMarcador}
        onCrear={() => void crearMarcador()}
        onActualizar={actualizarMarcador}
        onEliminar={borrarMarcador}
      />
    </div>
  );
}

export default App;

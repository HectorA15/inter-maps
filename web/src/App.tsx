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
  const [modoAdmin, setModoAdmin] = useState(false);
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
      modoAdmin ? "ADMIN" : "ESTUDIANTE",
    );
    setMarcadorSeleccionado(creado);
    setMarcadorEnfocado(creado);
    setMarcadoresAbiertos(true);
  };

  const seleccionarMarcador = async (anotacion: Anotacion) => {
    const puedeEditar =
      modoAdmin || anotacion.creadoPor === "ESTUDIANTE";
    if (!puedeEditar) {
      setMarcadorSeleccionado(null);
      setMarcadoresAbiertos(false);
      setMarcadorEnfocado(anotacion);

      if (anotacion.edificioId != null) {
        await seleccionarLugar({
          id: anotacion.edificioId,
          nombre: anotacion.nombre || `Edificio ${anotacion.edificioId}`,
          tipo: "EDIFICIO",
        });
      } else if (anotacion.espacioId != null) {
        await seleccionarLugar({
          id: anotacion.espacioId,
          nombre: anotacion.nombre || "Espacio",
          tipo: "ESPACIO",
        });
      } else if (anotacion.zonaId != null) {
        await seleccionarLugar({
          id: anotacion.zonaId,
          nombre: anotacion.zonaNombre || anotacion.nombre || "Zona",
          tipo: "ZONA",
        });
      }
      return;
    }

    setMarcadorSeleccionado(anotacion);
    setMarcadorEnfocado(anotacion);
  };

  const actualizarMarcador = useCallback(async (
    anotacion: Anotacion,
    cambios: Partial<Anotacion>,
  ) => {
    if (!modoAdmin && anotacion.creadoPor !== "ESTUDIANTE") return;
    const actualizado = await actualizarAnotacion(anotacion, cambios);
    setMarcadorSeleccionado((actual) =>
      actual?.id === actualizado.id ? actualizado : actual,
    );
  }, [actualizarAnotacion, modoAdmin]);

  const moverMarcador = useCallback(async (
    anotacion: Anotacion,
    coordenadas: { latitude: number; longitude: number },
  ) => {
    if (!modoAdmin && anotacion.creadoPor !== "ESTUDIANTE") return;
    await actualizarMarcador(anotacion, {
      latitud: coordenadas.latitude,
      longitud: coordenadas.longitude,
    });
  }, [actualizarMarcador, modoAdmin]);

  const borrarMarcador = async (id: number) => {
    const anotacion = anotaciones.find((item) => item.id === id);
    if (!modoAdmin && anotacion?.creadoPor !== "ESTUDIANTE") return;
    await eliminarAnotacion(id);
    setMarcadorSeleccionado(null);
    setMarcadorEnfocado(null);
  };

  const cambiarModo = () => {
    const siguienteModoAdmin = !modoAdmin;
    setModoAdmin(siguienteModoAdmin);
    if (!siguienteModoAdmin && marcadorSeleccionado?.creadoPor !== "ESTUDIANTE") {
      setMarcadorSeleccionado(null);
      setMarcadorEnfocado(null);
      setMarcadoresAbiertos(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white dark:bg-gray-900">
      <MapaCampus
        onEdificioClick={seleccionarLugar}
        lugarSeleccionado={lugarSeleccionado}
        edificioDetalle={edificioDetalle}
        tema={tema}
        modoAdmin={modoAdmin}
        anotaciones={anotaciones}
        anotacionEnfocada={marcadorEnfocado}
        onCentroCambio={setCentroMapa}
        onAnotacionSeleccionada={seleccionarMarcador}
        onAnotacionMovida={moverMarcador}
      />

      <div className="absolute top-5 right-4 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={cambiarModo}
          aria-pressed={modoAdmin}
          className="rounded-lg border border-gray-200 bg-white/95 px-3 py-2 text-xs font-semibold text-gray-700 shadow-md hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-100 dark:hover:bg-gray-800"
        >
          {modoAdmin ? "Modo admin" : "Modo estudiante"}
        </button>
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
        modoAdmin={modoAdmin}
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

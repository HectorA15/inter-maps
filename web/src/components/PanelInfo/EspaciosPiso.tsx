import type { Edificio, Espacio } from "../../interfaces/ApiInterfaces";

interface EspaciosPisoProps {
  pisoActivo: string;
  edificio: Edificio | null;
}

function agruparEspacios(espacios: Espacio[]) {
  const aulas = espacios.filter((e) => e.tipo === "AULA");
  const otros = espacios.filter((e) => e.tipo !== "AULA");

  const resultado = [];

  // Si hay más de un aula, las agrupamos en un solo bloque
  if (aulas.length > 1) {
    const primerAula = aulas[0].nombre;
    // quitamos la palabra "Aula" a la última para que quede "A - C" en lugar de "A - Aula C"
    const ultimaAula = aulas[aulas.length - 1].nombre.replace(/Aula /i, "");

    resultado.push({
      id: "grupo-aulas",
      nombre: `${primerAula} - ${ultimaAula}`,
      tipo: "AULA",
    });
  } else if (aulas.length === 1) {
    // Si solo hay un aula en el piso
    resultado.push({
      id: `aula-${aulas[0].id}`,
      nombre: aulas[0].nombre,
      tipo: "AULA",
    });
  }

  // Volvemos a meter los demás espacios tal cual estaban
  otros.forEach((e) => {
    resultado.push({
      id: `espacio-${e.id}`,
      nombre: e.nombre,
      tipo: e.tipo,
    });
  });

  return resultado;
}

function EspaciosPiso({ pisoActivo, edificio }: EspaciosPisoProps) {
  if (!edificio) {
    return null;
  }

  const pisos = edificio && Array.isArray(edificio.pisos) ? edificio.pisos : [];

  const pisoSeleccionado =
    pisos.find((piso) => piso.nombre === pisoActivo) ?? pisos[0];

  const espaciosListos = pisoSeleccionado
    ? agruparEspacios(pisoSeleccionado.espacios)
    : [];

  return (
    <div className="grid grid-cols-1 gap-2">
      {pisoSeleccionado && (
        <div className="mt-4 space-y-2 overflow-y-auto max-h-[calc(100vh-180px)] text-sm text-gray-600 font-semibold">
          {espaciosListos.length > 0 ? (
            espaciosListos.map((espacio) => (
              <div key={espacio.id}>
                {espacio.tipo === "AULA" ? (
                  <p className="rounded border border-gray-200 p-3">
                    {espacio.nombre}
                  </p>
                ) : (
                  <p className=" p-3">{espacio.nombre}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              No hay espacios registrados en este piso.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default EspaciosPiso;

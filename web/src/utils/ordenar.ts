const comparadorNatural = new Intl.Collator("es", {
  numeric: true,
  sensitivity: "base",
});

export function compararPorNombre<T>(
  primero: T,
  segundo: T,
  obtenerNombre: (elemento: T) => string,
): number {
  return comparadorNatural.compare(
    obtenerNombre(primero),
    obtenerNombre(segundo),
  );
}

export function ordenarPorNombre<T>(
  elementos: readonly T[],
  obtenerNombre: (elemento: T) => string,
): T[] {
  return [...elementos].sort((primero, segundo) =>
    compararPorNombre(primero, segundo, obtenerNombre),
  );
}

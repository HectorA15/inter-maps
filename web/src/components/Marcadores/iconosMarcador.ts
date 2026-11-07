export const OPCIONES_ICONO = [
  { id: "wifi", etiqueta: "Wi-Fi" },
  { id: "info", etiqueta: "Información" },
  { id: "parking", etiqueta: "Estacionamiento" },
  { id: "first-aid", etiqueta: "Enfermería" },
  { id: "store", etiqueta: "Tienda" },
] as const;

export type IconoMarcadorId = (typeof OPCIONES_ICONO)[number]["id"];

export function obtenerEtiquetaIcono(icono: string | null): string | null {
  return OPCIONES_ICONO.find((opcion) => opcion.id === icono)?.etiqueta ?? null;
}

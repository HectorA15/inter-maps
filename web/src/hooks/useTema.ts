import { useEffect, useState } from "react";

// Definimos un tipo para el tema, que puede ser "claro" u "oscuro".
export type Tema = "claro" | "oscuro";

// Este hook maneja el tema de la aplicación (claro u oscuro) y aplica la clase correspondiente al elemento raíz del documento.
export function useTema() {
  // Estado para almacenar el tema actual, inicializado según la preferencia del sistema del usuario.
  const [tema, setTema] = useState<Tema>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "oscuro"
        : "claro";
    }
    return "claro";
  });

  // useEffect para aplicar la clase "dark" al elemento raíz del documento cuando el tema es "oscuro".
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", tema === "oscuro");
  }, [tema]);

  // Retornamos el tema actual y la función para cambiar el tema.
  return {
    tema,
    cambiarTema: setTema,
  };
}

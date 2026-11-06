import { useEffect, useState } from "react";

// Definimos un tipo para el tema, que puede ser "claro" u "oscuro".
export type Tema = "claro" | "oscuro";

// Este hook maneja el tema de la aplicación (claro u oscuro) y aplica la clase correspondiente al elemento raíz del documento.
export function useTema() {
  // El tema claro es el estado inicial; el usuario puede cambiarlo manualmente.
  const [tema, setTema] = useState<Tema>("claro");

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

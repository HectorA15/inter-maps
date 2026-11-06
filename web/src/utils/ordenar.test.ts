import { describe, expect, it } from "vitest";
import { ordenarPorNombre } from "./ordenar";

describe("ordenarPorNombre", () => {
  it("ordena números de forma natural y texto sin distinguir acentos", () => {
    const resultado = ordenarPorNombre(
      [{ nombre: "Edificio 10" }, { nombre: "Edificio 2" }, { nombre: "baño" }],
      (elemento) => elemento.nombre,
    );

    expect(resultado.map((elemento) => elemento.nombre)).toEqual([
      "baño",
      "Edificio 2",
      "Edificio 10",
    ]);
  });
});


import { useState } from 'react';
import type { Edificio } from '../interfaces/ApiInterfaces';

interface BuscadorProps {
    titulo?: string;
}

export function Buscador({}: BuscadorProps) {

    const [textoBusqueda, setTextoBusqueda] = useState<string>("");

    const manejarCambio = (nuevoTexto: string) => {
        setTextoBusqueda(nuevoTexto);
    };


    return (
        <>
            <input
                type="text"
                value={textoBusqueda}
                onChange={(e) => manejarCambio(e.target.value)}
            />
        </>
    );
}
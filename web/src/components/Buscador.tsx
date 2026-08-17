import { useState, useEffect } from 'react';
import { CatalogoService } from '../services/apiClient';

export function Buscador() {
    const [textoBusqueda, setTextoBusqueda] = useState<string>("");
    const [resultados, setResultados] = useState<SearchResult[]>([]);

    useEffect(() => {
        if (textoBusqueda.trim() === '') {
            setResultados([]);
            return;
        }

        const temporizador = setTimeout(async () => {
            try {
                const resultadosBusqueda = await CatalogoService.buscar(textoBusqueda);
                setResultados(resultadosBusqueda);
                console.log("Buscando:", textoBusqueda);
            } catch (error) {
                console.error("Error en la busqueda:", error);
            }
        }, 500);

        return () => clearTimeout(temporizador);``

    }, [textoBusqueda]);

    const manejarCambio = (nuevoTexto: string) => {
        setTextoBusqueda(nuevoTexto);
    };

    return (
        <div className="contenedor-buscador-relativo">
            <input
                className="input-buscador"
                type="text"
                placeholder="Buscar lugar o edificio..."
                value={textoBusqueda}
                onChange={(e) => manejarCambio(e.target.value)}
            />

            {/* Solo dibuja el menú si la memoria tiene datos */}
            {resultados.length > 0 && (
                <ul className="dropdown-resultados">
                    {resultados.map((item) => (
                        <li key={`${item.tipo}-${item.id}`} className="item-resultado">
                            {item.nombre}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
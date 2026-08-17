import axios from "axios";
import type { Edificio, Espacio, SearchResult, SpringPage, RutaGeoJson } from "../interfaces/ApiInterfaces";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

export const CatalogoService = {
    obtenerEdificios: async (page = 0, size = 20): Promise<SpringPage<Edificio>> => {
        const response = await api.get<SpringPage<Edificio>>("/catalogo/data", {
            params: { page, size },
        });
        return response.data;
    },

    obtenerEdificio: async (id: number): Promise<Edificio> => {
        const response = await api.get<Edificio>(`/catalogo/edificio/${id}`);
        return response.data;
    },

    obtenerEspacio: async (id: number): Promise<Espacio> => {
        const response = await api.get<Espacio>(`/catalogo/espacio/${id}`);
        return response.data;
    },

    buscar: async (nombre: string): Promise<SearchResult[]> => {
        const response = await api.get<SearchResult[]>("/catalogo/buscar", {
            params: { nombre },
        });
        return response.data;
    },
};

export const NavegacionService = {
    obtenerRuta: async (latitud: number, longitud: number, idNodoDestino: number): Promise<RutaGeoJson> => {
        const response = await api.get<RutaGeoJson>("/navegacion/ruta", {
            params: { latitud, longitud, idNodoDestino },
        });
        return response.data;
    },
};
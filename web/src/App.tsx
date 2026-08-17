

import React, { useEffect, useState } from 'react';
import { CatalogoService } from './services/apiClient';
import type { Edificio } from './interfaces/ApiInterfaces';

import { Buscador } from './components/Buscador';

function App() {

    const [edificios, setEdificios] = useState<Edificio[]>([]);

    useEffect(() => {
        async function fetchEdificios() {
            try {
                const response = await CatalogoService.obtenerEdificios();
                setEdificios(response.content);
                console.log("Datos recibidos:", response.content);
            } catch (error) {
                console.error('Error fetching edificios:', error);
            }
        }

        fetchEdificios();
    }, []);



  return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
        <h1>InterMaps</h1>
          <Buscador/>
        <p>Interfaz local del robot operativa.</p>
          {
              edificios.map((edificio) => (
                  <div key={edificio.id}>
                      <h2>Edificio {edificio.nombre}</h2>
                      <p>Espacios: {edificio.espacios.length}</p>
                  </div>


              ))
          }
      </div>
  );
}

export default App;
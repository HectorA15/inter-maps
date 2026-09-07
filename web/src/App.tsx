

import type { SearchResult } from './interfaces/ApiInterfaces';
import { Buscador } from './components/Buscador';
import { MapaCampus } from './components/MapaCampus';
function App() {
  const handleSelect = (item: SearchResult) => {
    console.log("Seleccionado:", item);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* 1. El mapa ocupa todo el fondo */}
      <MapaCampus />

      {/* 2. Barra superior: buscador ocupa todo el ancho hasta 640px, en movil se adapta */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '0',
          right: '0',
          display: 'flex',
          justifyContent: 'center',
          padding: '0 16px',
          boxSizing: 'border-box',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <div style={{ width: '100%', maxWidth: '640px', pointerEvents: 'auto' }}>
          <Buscador onSelect={handleSelect} />
        </div>
      </div>
    </div>
  );
}

export default App;
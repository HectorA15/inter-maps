

import type { SearchResult } from './interfaces/ApiInterfaces';
import { Buscador } from './components/Buscador';

function App() {
  const handleSelect = (item: SearchResult) => {
    console.log("Seleccionado:", item);
  };

  return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
          <Buscador onSelect={handleSelect} />
      </div>
  );
}

export default App;
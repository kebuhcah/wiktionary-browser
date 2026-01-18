import { useState } from 'react';
import ApiDemo from './components/ApiDemo';
import EtymologyGraph from './features/etymology-graph/EtymologyGraph';

function App() {
  const [view, setView] = useState<'search' | 'graph'>('graph');

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '10px', background: 'white' }}>
        <button
          onClick={() => setView('search')}
          style={{
            padding: '8px 16px',
            background: view === 'search' ? '#3b82f6' : 'white',
            color: view === 'search' ? 'white' : '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Search
        </button>
        <button
          onClick={() => setView('graph')}
          style={{
            padding: '8px 16px',
            background: view === 'graph' ? '#3b82f6' : 'white',
            color: view === 'graph' ? 'white' : '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Etymology Graph
        </button>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {view === 'search' ? <ApiDemo /> : <EtymologyGraph />}
      </div>
    </div>
  );
}

export default App;

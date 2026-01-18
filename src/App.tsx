import { useState } from 'react';
import ApiDemo from './components/ApiDemo';
import EtymologyGraph from './features/etymology-graph/EtymologyGraph';

interface SelectedWord {
  word: string;
  language: string;
}

function App() {
  const [view, setView] = useState<'search' | 'graph'>('search');
  const [selectedWord, setSelectedWord] = useState<SelectedWord | null>(null);

  const handleViewInGraph = (word: string, language: string) => {
    setSelectedWord({ word, language });
    setView('graph');
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '10px', background: 'white', alignItems: 'center' }}>
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
        {selectedWord && (
          <div style={{ marginLeft: 'auto', color: '#64748b', fontSize: '14px' }}>
            Viewing: <strong>{selectedWord.word}</strong> ({selectedWord.language})
          </div>
        )}
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {view === 'search' ? (
          <ApiDemo onViewInGraph={handleViewInGraph} />
        ) : (
          <EtymologyGraph initialWord={selectedWord} />
        )}
      </div>
    </div>
  );
}

export default App;

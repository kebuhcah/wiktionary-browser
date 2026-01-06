import { useState } from 'react';
import EtymologyGraph from './features/etymology-graph/EtymologyGraph';
import SearchBar from './components/SearchBar';
import SidePanel from './components/SidePanel';
import './App.css';

function App() {
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [searchWordId, setSearchWordId] = useState<string | undefined>(undefined);

  const handleWordSelect = (wordId: string) => {
    setSearchWordId(wordId);
    setSelectedWordId(wordId);
  };

  const handleNodeSelect = (nodeId: string | null) => {
    setSelectedWordId(nodeId);
  };

  const handlePanelClose = () => {
    setSelectedWordId(null);
  };

  const handlePanelWordClick = (wordId: string) => {
    setSearchWordId(wordId);
    setSelectedWordId(wordId);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="app-title">Wiktionary Etymology Browser</h1>
            <p className="app-subtitle">
              Explore etymological connections between words across languages
            </p>
          </div>
          <SearchBar onWordSelect={handleWordSelect} />
        </div>
      </header>

      <div className="app-main">
        <div className="graph-section">
          <EtymologyGraph
            initialWordId="run_en"
            onNodeSelect={handleNodeSelect}
            searchWordId={searchWordId}
          />
        </div>
        <div className="side-panel-section">
          <SidePanel
            selectedWordId={selectedWordId}
            onClose={handlePanelClose}
            onWordClick={handlePanelWordClick}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

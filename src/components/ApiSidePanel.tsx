import { GraphNode, GraphEdge } from '../features/etymology-graph/useGraphState';
import { getLanguageColor } from '../utils/languageColors';
import './SidePanel.css';

interface ApiSidePanelProps {
  selectedNodeId: string | null;
  nodes: GraphNode[];
  edges: GraphEdge[];
  onClose: () => void;
  onWordClick?: (nodeId: string) => void;
}

export default function ApiSidePanel({ selectedNodeId, nodes, edges, onClose, onWordClick }: ApiSidePanelProps) {
  if (!selectedNodeId) {
    return (
      <div className="side-panel empty">
        <div className="empty-state">
          <div className="empty-icon">📖</div>
          <div className="empty-text">Select a word to see details</div>
        </div>
      </div>
    );
  }

  const node = nodes.find(n => n.id === selectedNodeId);
  if (!node) {
    return null;
  }

  const word = node.data;
  const color = getLanguageColor(word.language);

  // Find parent nodes (nodes that have edges pointing to this node)
  const parentEdges = edges.filter(e => e.target === selectedNodeId);
  const parents = parentEdges
    .map(e => ({
      edge: e,
      node: nodes.find(n => n.id === e.source)
    }))
    .filter(p => p.node);

  return (
    <div className="side-panel">
      <div className="side-panel-header">
        <h2 className="panel-title">Word Details</h2>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="side-panel-content">
        <div className="word-section">
          <div className="word-display" style={{ borderLeftColor: color }}>
            <h3 className="word-title">{word.word}</h3>
            <div
              className="language-badge"
              style={{ backgroundColor: color }}
            >
              {word.languageDisplay}
            </div>
          </div>

          {word.partOfSpeech && (
            <div className="detail-row">
              <span className="detail-label">Part of speech:</span>
              <span className="detail-value">{word.partOfSpeech}</span>
            </div>
          )}

          {word.definition && (
            <div className="definition-section">
              <h4 className="section-title">Definition</h4>
              <p className="definition-text">{word.definition}</p>
            </div>
          )}
        </div>

        {parents.length > 0 && (
          <div className="etymology-section">
            <h4 className="section-title">Etymology</h4>
            <div className="etymology-chain">
              {parents.map(({ edge, node }) => (
                <div
                  key={edge.id}
                  className="etymology-item"
                  onClick={() => node && onWordClick?.(node.id)}
                >
                  <div className="etymology-type">{edge.type.replace(/_/g, ' ')}</div>
                  {node && (
                    <div className="etymology-word">
                      <span className="parent-word">{node.data.word}</span>
                      <span className="parent-language">({node.data.languageDisplay})</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="hint-section">
          <div className="hint-text">
            💡 Click the word again to expand its etymology
          </div>
        </div>
      </div>
    </div>
  );
}

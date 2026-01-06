import { getWordById, getParentWords } from '../data/mockEtymologyData';
import { getLanguageColor } from '../utils/languageColors';
import './SidePanel.css';

interface SidePanelProps {
  selectedWordId: string | null;
  onClose: () => void;
  onWordClick?: (wordId: string) => void;
}

export default function SidePanel({ selectedWordId, onClose, onWordClick }: SidePanelProps) {
  if (!selectedWordId) {
    return (
      <div className="side-panel empty">
        <div className="empty-state">
          <div className="empty-icon">📖</div>
          <div className="empty-text">Select a word to see details</div>
        </div>
      </div>
    );
  }

  const word = getWordById(selectedWordId);
  if (!word) {
    return null;
  }

  const parents = getParentWords(selectedWordId);
  const color = getLanguageColor(word.language);

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

          {word.ipa && (
            <div className="detail-row">
              <span className="detail-label">Pronunciation:</span>
              <span className="detail-value ipa">{word.ipa}</span>
            </div>
          )}
        </div>

        {parents.length > 0 && (
          <div className="etymology-section">
            <h4 className="section-title">Etymology</h4>
            <div className="etymology-chain">
              {parents.map(({ word: parentWord, relationship }) => (
                <div
                  key={parentWord.id}
                  className="etymology-item"
                  onClick={() => onWordClick?.(parentWord.id)}
                >
                  <div className="etymology-type">{relationship.type.replace(/_/g, ' ')}</div>
                  <div className="etymology-word">
                    <span className="parent-word">{parentWord.word}</span>
                    <span className="parent-language">({parentWord.languageDisplay})</span>
                  </div>
                  {relationship.notes && (
                    <div className="etymology-notes">{relationship.notes}</div>
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

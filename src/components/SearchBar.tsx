import { useState, useEffect, useRef } from 'react';
import { getAllWords } from '../data/mockEtymologyData';
import { EtymologyWord } from '../types/etymology';
import './SearchBar.css';

interface SearchBarProps {
  onWordSelect: (wordId: string) => void;
}

export default function SearchBar({ onWordSelect }: SearchBarProps) {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<EtymologyWord[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const allWords = getAllWords();

  useEffect(() => {
    if (searchText.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = allWords.filter(word =>
      word.word.toLowerCase().includes(searchText.toLowerCase()) ||
      word.languageDisplay.toLowerCase().includes(searchText.toLowerCase())
    );

    setSuggestions(filtered.slice(0, 8));
    setShowSuggestions(filtered.length > 0);
    setSelectedIndex(-1);
  }, [searchText, allWords]);

  const handleSelect = (wordId: string) => {
    const word = allWords.find(w => w.id === wordId);
    if (word) {
      setSearchText(word.word);
      onWordSelect(wordId);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(suggestions[selectedIndex].id);
        } else if (suggestions.length > 0) {
          handleSelect(suggestions[0].id);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className="search-bar-container">
      <div className="search-bar">
        <div className="search-icon">🔍</div>
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search for a word..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchText && setSuggestions(suggestions)}
        />
        {searchText && (
          <button
            className="clear-button"
            onClick={() => {
              setSearchText('');
              setSuggestions([]);
              setShowSuggestions(false);
            }}
          >
            ✕
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((word, index) => (
            <div
              key={word.id}
              className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelect(word.id)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="suggestion-word">{word.word}</div>
              <div className="suggestion-meta">
                <span className="suggestion-language">{word.languageDisplay}</span>
                {word.partOfSpeech && (
                  <span className="suggestion-pos">{word.partOfSpeech}</span>
                )}
              </div>
              {word.definition && (
                <div className="suggestion-definition">{word.definition}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

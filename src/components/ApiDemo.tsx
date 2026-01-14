import { useState, useEffect } from 'react';
import { checkApiHealth, searchWords, getWordDetails, WordSearchResult, WordEntry } from '../api/etymologyApi';
import { getLanguageName } from '../utils/languageNames';
import './ApiDemo.css';

/**
 * Demo component showing API integration
 *
 * This demonstrates how to use the API client to:
 * - Check server health
 * - Search for words
 * - Get word details
 *
 * To use: Enable API mode by running `npm run dev:all`
 */
export default function ApiDemo() {
  const [isApiAvailable, setIsApiAvailable] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WordSearchResult[]>([]);
  const [selectedWord, setSelectedWord] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [history, setHistory] = useState<Array<{word: string, language: string, entries: WordEntry[]}>>([]);

  // Check API availability on mount
  useEffect(() => {
    checkApiHealth().then(setIsApiAvailable);
  }, []);

  // Search as user types
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const debounceTimeout = setTimeout(async () => {
      try {
        setError(null);
        const results = await searchWords(searchQuery, 8);
        setSearchResults(results);
      } catch (err) {
        setError('Search failed');
        setSearchResults([]);
      }
    }, 150); // Reduced from 300ms to 150ms for snappier feel

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const handleWordClick = async (word: string, language: string, clearHistory = false) => {
    setLoading(true);
    setError(null);
    try {
      const details = await getWordDetails(word, [language]);

      if (details.length === 0) {
        setError(`Word "${word}" not found in ${language}`);
        setLoading(false);
        return;
      }

      // Save current word to history before navigating (unless clearing history)
      if (!clearHistory && selectedWord.length > 0) {
        setHistory(prev => [...prev, {
          word: selectedWord[0].word,
          language: selectedWord[0].language,
          entries: selectedWord
        }]);
      } else if (clearHistory) {
        setHistory([]);
      }

      setSelectedWord(details);
    } catch (err) {
      setError('Failed to load word details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (history.length === 0) return;

    const previous = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setSelectedWord(previous.entries);
    setError(null);
  };

  if (!isApiAvailable) {
    return (
      <div className="api-demo">
        <div className="api-status offline">
          <h3>⚠️ API Server Not Available</h3>
          <p>Start the API server to enable dynamic searches:</p>
          <code>npm run dev:all</code>
          <p className="help-text">
            Make sure you've imported the database first:
            <br />
            <code>node scripts/import-to-sqlite.js</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="api-demo">
      <div className="api-status online">
        <h3>✅ API Server Connected</h3>
        <p>Search the full Wiktionary database (10.4M+ entries)</p>
      </div>

      <div className="search-section">
        <input
          type="text"
          className="api-search-input"
          placeholder="Search for a word..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => {
            // Delay hiding to allow click events on results to fire first
            setTimeout(() => setIsSearchFocused(false), 200);
          }}
        />

        {searchResults.length > 0 && isSearchFocused && (
          <div className="search-results">
            {searchResults.map((result, i) => (
              <div
                key={`${result.word}-${result.language}-${i}`}
                className="search-result-item"
                onClick={() => handleWordClick(result.word, result.language, true)}
              >
                <span className="word">{result.word}</span>
                <span className="language">{result.language}</span>
                {result.pos && <span className="pos">{result.pos}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {loading && <div className="loading">Loading...</div>}

      {selectedWord.length > 0 && (
        <div className="word-details">
          {history.length > 0 && (
            <button className="back-button" onClick={handleBack}>
              ← Back to {history[history.length - 1].word}
            </button>
          )}
          {selectedWord.map((entry, i) => (
            <div key={i} className="word-entry">
              <h4>
                {entry.word} <span className="lang">[{entry.language}]</span>
              </h4>
              {entry.pos && <p className="pos">Part of speech: {entry.pos}</p>}
              {entry.etymology_text && (
                <div className="etymology">
                  <strong>Etymology:</strong>
                  <p>{entry.etymology_text.substring(0, 1000)}{entry.etymology_text.length > 1000 ? "..." : ""}</p>
                </div>
              )}
              {entry.etymology_templates && entry.etymology_templates.length > 0 && (
                <div className="etymology-relations">
                  <strong>Related words:</strong>
                  <ul>
                    {entry.etymology_templates
                      .filter((t: any) => ['inh', 'der', 'bor', 'cog', 'inherited', 'derived', 'borrowed', 'cognate'].includes(t.name))
                      .slice(0, 10)
                      .map((template: any, j: number) => {
                        const relationType = {
                          'inh': 'Inherited from',
                          'inherited': 'Inherited from',
                          'der': 'Derived from',
                          'derived': 'Derived from',
                          'bor': 'Borrowed from',
                          'borrowed': 'Borrowed from',
                          'cog': 'Cognate with',
                          'cognate': 'Cognate with'
                        }[template.name] || template.name;

                        const langCode = template.args?.['2'] || template.args?.lang || '';
                        const word = template.args?.['3'] || template.args?.term || '';

                        if (!word) return null;

                        const langName = getLanguageName(langCode);

                        return (
                          <li key={j}>
                            {relationType} <strong title={langCode}>{langName}</strong>{' '}
                            <em
                              className="clickable-word"
                              onClick={() => handleWordClick(word, langCode)}
                              title={`Click to view ${word}`}
                            >
                              {word}
                            </em>
                          </li>
                        );
                      })
                      .filter(Boolean)}
                  </ul>
                </div>
              )}
              {entry.senses && entry.senses.length > 0 && (
                <div className="definitions">
                  <strong>Definitions:</strong>
                  <ol>
                    {entry.senses.slice(0, 3).map((sense, j) => (
                      <li key={j}>
                        {sense.glosses?.[0] || sense.raw_glosses?.[0] || 'No definition'}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

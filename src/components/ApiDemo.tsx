import { useState, useEffect } from 'react';
import { checkApiHealth, searchWords, getWordDetails, WordSearchResult, WordEntry } from '../api/etymologyApi';
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

  // Check API availability on mount
  useEffect(() => {
    checkApiHealth().then(setIsApiAvailable);
  }, []);

  // Search as user types
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const debounceTimeout = setTimeout(async () => {
      try {
        setError(null);
        const results = await searchWords(searchQuery, 10);
        setSearchResults(results);
      } catch (err) {
        setError('Search failed');
        setSearchResults([]);
      }
    }, 150); // Reduced from 300ms to 150ms for snappier feel

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const handleWordClick = async (word: string, language: string) => {
    setLoading(true);
    setError(null);
    try {
      const details = await getWordDetails(word, [language]);
      setSelectedWord(details);
    } catch (err) {
      setError('Failed to load word details');
    } finally {
      setLoading(false);
    }
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
        />

        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((result, i) => (
              <div
                key={`${result.word}-${result.language}-${i}`}
                className="search-result-item"
                onClick={() => handleWordClick(result.word, result.language)}
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
          {selectedWord.map((entry, i) => (
            <div key={i} className="word-entry">
              <h4>
                {entry.word} <span className="lang">[{entry.language}]</span>
              </h4>
              {entry.pos && <p className="pos">Part of speech: {entry.pos}</p>}
              {entry.etymology_text && (
                <div className="etymology">
                  <strong>Etymology:</strong>
                  <p>{entry.etymology_text.substring(0, 300)}...</p>
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

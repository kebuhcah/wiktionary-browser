# API Integration Guide

This document explains how to use the API backend and the current state of frontend integration.

## Current Status

### ✅ Completed
- **Backend API server** (Express + SQLite)
  - Fast queries (<10ms)
  - RESTful endpoints for search, word details, etymology
  - Full Wiktionary database (10.4M+ entries)

- **API Client** (`src/api/etymologyApi.ts`)
  - TypeScript client for all API endpoints
  - Error handling and type safety

- **Demo Component** (`src/components/ApiDemo.tsx`)
  - Shows API usage examples
  - Search, autocomplete, word details

### 🔨 To Be Implemented
- **Graph Visualization with API Data**
  - Update `useGraphState` to fetch from API instead of static data
  - Dynamic node expansion with API calls
  - Real-time etymology relationship loading

## How to Use Current Implementation

### 1. Static Data Mode (Default)

No setup required. Uses curated currere family data (19 words).

```bash
npm run dev
```

Visit: http://localhost:5173

### 2. API Demo Mode

Demonstrates API integration without graph visualization.

**Setup:**

1. Import database (if not done):
   ```bash
   node scripts/import-to-sqlite.js
   ```

2. Start both servers:
   ```bash
   npm run dev:all
   ```

3. Temporarily modify `src/App.tsx` to show ApiDemo:
   ```tsx
   import ApiDemo from './components/ApiDemo';

   function App() {
     return <ApiDemo />;
   }
   ```

4. Visit: http://localhost:5173

You'll see:
- Real-time search across all languages
- Word autocomplete
- Detailed etymology information
- Full database queries

## Next Steps: Integrating API with Graph Visualization

To make the graph visualization use the API backend, follow these steps:

### Step 1: Create API-Based Data Provider

Create `src/data/apiEtymologyData.ts`:

```typescript
import { getWordDetails, getEtymology } from '../api/etymologyApi';
import { EtymologyData, EtymologyWord, EtymologyRelationship } from '../types/etymology';

export async function fetchWordData(word: string, language: string): Promise<EtymologyData> {
  // Fetch word and its relationships from API
  const [details, etymology] = await Promise.all([
    getWordDetails(word, [language]),
    getEtymology(word, language)
  ]);

  // Transform API response to EtymologyData format
  const words: EtymologyWord[] = details.map(entry => ({
    id: `${entry.word}_${entry.lang_code}`,
    word: entry.word,
    language: entry.lang_code,
    languageDisplay: entry.language,
    definition: entry.senses?.[0]?.glosses?.[0] || '',
    partOfSpeech: entry.pos
  }));

  // Extract relationships from etymology templates
  const relationships: EtymologyRelationship[] = [];
  // ... parse etymology.parents and etymology.children

  return { words, relationships };
}
```

### Step 2: Update useGraphState to Support API Mode

Modify `src/features/etymology-graph/useGraphState.ts`:

```typescript
interface UseGraphStateProps {
  etymologyData?: EtymologyData;  // Make optional
  initialWordId?: string;
  dataMode?: 'static' | 'api';     // Add mode selector
}

export function useGraphState({ etymologyData, initialWordId, dataMode = 'static' }: UseGraphStateProps) {
  // ... existing state

  const expandNode = useCallback(async (nodeId: string) => {
    if (dataMode === 'api') {
      // Fetch from API
      const [word, language] = nodeId.split('_');
      const data = await fetchWordData(word, language);

      // Add nodes and edges from API response
      // ...
    } else {
      // Existing static data logic
      // ...
    }
  }, [dataMode]);

  // ... rest of implementation
}
```

### Step 3: Add Mode Switcher to App

Update `src/App.tsx`:

```typescript
function App() {
  const [dataMode, setDataMode] = useState<'static' | 'api'>('static');
  const [apiAvailable, setApiAvailable] = useState(false);

  useEffect(() => {
    checkApiHealth().then(setApiAvailable);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        {/* ... existing header */}

        {apiAvailable && (
          <div className="mode-switcher">
            <button
              onClick={() => setDataMode('static')}
              className={dataMode === 'static' ? 'active' : ''}
            >
              Static Data
            </button>
            <button
              onClick={() => setDataMode('api')}
              className={dataMode === 'api' ? 'active' : ''}
            >
              Full Database (API)
            </button>
          </div>
        )}
      </header>

      <EtymologyGraph
        initialWordId={dataMode === 'static' ? 'latin_curro' : undefined}
        dataMode={dataMode}
      />
    </div>
  );
}
```

### Step 4: Update SearchBar for API Mode

Modify `src/components/SearchBar.tsx` to use API search:

```typescript
import { searchWords } from '../api/etymologyApi';

export default function SearchBar({ onWordSelect, dataMode }: SearchBarProps) {
  // ...

  useEffect(() => {
    if (dataMode === 'api' && searchText.length >= 2) {
      searchWords(searchText, 10).then(results => {
        setSuggestions(results.map(r => ({
          id: `${r.word}_${r.lang_code}`,
          word: r.word,
          language: r.lang_code,
          languageDisplay: r.language,
          partOfSpeech: r.pos
        })));
      });
    } else {
      // Use static data
    }
  }, [searchText, dataMode]);
}
```

## Testing API Integration

### 1. Test API Endpoints Directly

```bash
# Terminal 1: Start server
npm run dev:server

# Terminal 2: Test endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/search?q=run
curl http://localhost:3001/api/words/run?language=English
```

### 2. Test with ApiDemo Component

See "API Demo Mode" above.

### 3. Test Full Integration

After implementing steps 1-4:

```bash
npm run dev:all
```

1. Click "Full Database (API)" mode
2. Search for any word (10.4M entries available)
3. Click nodes to expand dynamically from database
4. Explore etymology across all languages

## Performance Considerations

### API Response Times
- Search: <10ms
- Word details: <10ms
- Etymology relationships: <10ms

### Caching Strategy
Consider implementing client-side caching:

```typescript
const cache = new Map<string, EtymologyData>();

async function fetchWordDataCached(word: string, language: string) {
  const key = `${word}_${language}`;
  if (cache.has(key)) {
    return cache.get(key)!;
  }
  const data = await fetchWordData(word, language);
  cache.set(key, data);
  return data;
}
```

### Load Balancing
For production:
- Use connection pooling
- Implement rate limiting
- Consider read replicas for SQLite

## Limitations

### Current Implementation
- No pagination (limits to 10 results)
- Etymology relationships are basic (template parsing needed)
- No complex queries (e.g., "find all Latin roots")

### SQLite Constraints
- Single write, multiple reads
- No built-in full-text search (would need FTS5 extension)
- Large result sets can be slow

## Future Enhancements

1. **Advanced Query API**
   ```typescript
   // Find all words derived from Latin
   GET /api/advanced/derived-from?language=Latin&limit=100

   // Find cognates
   GET /api/advanced/cognates/:word

   // Language family tree
   GET /api/advanced/language-tree?family=Indo-European
   ```

2. **GraphQL API**
   - More flexible queries
   - Nested relationship loading
   - Client-side caching with Apollo

3. **Real-time Updates**
   - WebSocket for live searches
   - Collaborative exploration
   - Shared etymology graphs

4. **Export Features**
   - Export graph as JSON
   - Generate etymology reports
   - Share links to specific views

## Troubleshooting

### API Not Available
```
⚠️ API Server Not Available
```
**Solution:**
1. Check database exists: `ls -lh data/wiktionary.db`
2. Start server: `npm run dev:server`
3. Verify: `curl http://localhost:3001/api/health`

### CORS Errors
**Solution:** The dev server proxies `/api` requests automatically. If you see CORS errors:
1. Check `vite.config.ts` has proxy configured
2. Ensure using relative URLs: `/api/search` not `http://localhost:3001/api/search`

### Slow Queries
**Solution:**
1. Check database indexes:
   ```sql
   SELECT name FROM sqlite_master WHERE type='index';
   ```
2. Analyze slow queries with EXPLAIN
3. Consider warming up cache:
   ```bash
   curl http://localhost:3001/api/stats
   ```

## Resources

- [API Server README](../server/README.md)
- [Scripts README](../scripts/README.md)
- [Main README](../README.md)

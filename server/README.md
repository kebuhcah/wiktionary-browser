# Wiktionary Etymology Browser - API Server

Express-based REST API for querying the SQLite etymology database.

## Prerequisites

You must have the SQLite database before running the server:

```bash
node scripts/import-to-sqlite.js
```

This creates `./data/wiktionary.db` (~25GB, takes 1-2 hours).

## Development

### Option 1: Run both frontend and backend together (recommended)

```bash
npm run dev:all
```

This starts:
- Backend API server on http://localhost:3001
- Frontend dev server on http://localhost:5173 (with API proxy)

### Option 2: Run servers separately

```bash
# Terminal 1: Start backend
npm run dev:server

# Terminal 2: Start frontend
npm run dev
```

## Production

Build and run in production mode:

```bash
# Build frontend
npm run build

# Start production server (serves API + static files)
npm start
```

Server runs on http://localhost:3001 (or PORT environment variable).

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and database connection.

### Database Statistics
```
GET /api/stats
```
Returns:
- Total word entries
- Number of languages
- Entries with etymology

### Search Words (Autocomplete)
```
GET /api/search?q=<query>&limit=<number>
```
- `q`: Search query (minimum 2 characters)
- `limit`: Maximum results (default: 20)

Returns words matching the prefix, ordered by:
1. Exact matches first
2. Length (shorter first)
3. Alphabetically

Example:
```
GET /api/search?q=cor&limit=10
```

### Get Word Details
```
GET /api/words/:word?language=<lang1,lang2>&limit=<number>
```
- `word`: The word to search for
- `language`: Optional comma-separated list of languages/language codes
- `limit`: Maximum results (default: 10)

Returns full word entries including:
- Etymology text
- Etymology templates
- Categories
- Senses (definitions)
- Complete JSON data

Examples:
```
GET /api/words/correr                    # All languages
GET /api/words/correr?language=Spanish   # Spanish only
GET /api/words/run?language=English,German  # Multiple languages
```

### Get Etymology Relationships
```
GET /api/etymology/:word/:language
```
Returns:
- Word entry details
- Parent words (etymology sources) from templates
- Child words (derived words) - TODO

Example:
```
GET /api/etymology/correr/Spanish
```

## Configuration

### Environment Variables

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Set to "production" to serve static files

### Database Path

The server looks for the database at `./data/wiktionary.db` relative to the server directory.

## Architecture

```
┌─────────────────┐
│  Vite Dev (5173)│
│  React Frontend │
└────────┬────────┘
         │ /api/* → proxy
         ↓
┌─────────────────┐
│ Express (3001)  │
│  API Server     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  SQLite DB      │
│  wiktionary.db  │
└─────────────────┘
```

In development:
- Vite serves frontend on port 5173
- Express serves API on port 3001
- Vite proxies /api requests to Express

In production:
- Express serves both API and static frontend build

## Performance

- Query response time: <10ms
- Concurrent connections: Limited by SQLite (single writer, multiple readers)
- Database mode: Read-only with WAL mode for concurrent reads
- Caching: 10,000 pages (~40MB) in SQLite cache

## Notes

- Database is opened in read-only mode for safety
- CORS enabled for development
- Proper error handling with HTTP status codes
- Graceful shutdown on SIGINT

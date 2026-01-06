# Wiktionary Etymology Browser

A React-based interactive graph visualization tool for exploring etymological connections between words across different languages.

## Features

- **Force-Directed Graph Visualization**: Uses d3-force for organic, physics-based layout
- **Interactive Word Exploration**: Click words to expand their etymological parents
- **Smart Search**: Autocomplete search with filtering by word or language
- **Detailed Side Panel**: View word definitions, pronunciations, and etymology chains
- **Language Color Coding**: Visual encoding by language family
- **Cross-Linguistic Connections**: Discover how words from different languages share common roots

## Demo Data

The prototype includes sample etymologies for:
- "run" (English) → Old English → Proto-Germanic → PIE
- "correr" (Spanish) → Latin → PIE
- "algorithm" (English) → Medieval Latin → Arabic
- "brother" family showing cognates across English, Latin, and Sanskrit

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at http://localhost:5173/

### Build for Production

```bash
npm run build
```

## Usage

1. **Search for a word**: Use the search bar at the top to find words in the database
2. **Explore etymology**: Click a word once to select it and view details in the side panel
3. **Expand connections**: Click the selected word again to expand its etymological parents
4. **Navigate**: Use pan and zoom controls to navigate the graph
5. **Jump between words**: Click etymology links in the side panel to jump to related words

## Technology Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Flow** - Graph visualization library
- **d3-force** - Force-directed layout algorithm

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── SearchBar.tsx
│   ├── SidePanel.tsx
│   └── nodes/         # Custom React Flow nodes
├── features/          # Feature-specific code
│   └── etymology-graph/
├── data/             # Mock data
├── types/            # TypeScript definitions
└── utils/            # Helper functions
```

## Future Enhancements

- Real Wiktionary API integration
- Advanced filtering (by language family, time period)
- Historical timeline animation
- Shortest path algorithm between words
- Export/share functionality
- Mobile optimization

## License

MIT

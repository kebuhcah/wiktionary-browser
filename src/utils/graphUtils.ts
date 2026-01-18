import { EtymologyWord, EtymologyRelationship } from '../types/etymology';
import { getLanguageColor } from './languageColors';
import { GraphNode, GraphEdge } from '../features/etymology-graph/useGraphState';

export function convertWordsToNodes(words: EtymologyWord[]): GraphNode[] {
  return words.map(word => ({
    id: word.id,
    x: 0, // Will be set by force simulation
    y: 0,
    data: {
      ...word,
      color: getLanguageColor(word.language)
    }
  }));
}

export function convertRelationshipsToEdges(
  relationships: EtymologyRelationship[]
): GraphEdge[] {
  return relationships.map(rel => ({
    id: rel.id,
    // Reverse direction: arrows point from parent (target) → child (source)
    // This shows etymology flow from ancient → modern
    source: rel.target,  // Etymology source (parent word)
    target: rel.source,  // Derived word (child)
    type: rel.type as GraphEdge['type'],
    animated: rel.type === 'borrowed_from',
    style: {
      strokeWidth: 2,
      stroke: rel.type === 'borrowed_from' ? '#94a3b8' : '#64748b',
      strokeDasharray: rel.type === 'borrowed_from' ? '5,5' : undefined
    }
  }));
}

export interface FindPathResult {
  path: string[];
  relationships: EtymologyRelationship[];
}

export function findEtymologyPath(
  startWordId: string,
  endWordId: string,
  relationships: EtymologyRelationship[]
): FindPathResult | null {
  const visited = new Set<string>();
  const queue: { wordId: string; path: string[]; rels: EtymologyRelationship[] }[] = [
    { wordId: startWordId, path: [startWordId], rels: [] }
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.wordId === endWordId) {
      return {
        path: current.path,
        relationships: current.rels
      };
    }

    if (visited.has(current.wordId)) {
      continue;
    }

    visited.add(current.wordId);

    const parentRels = relationships.filter(rel => rel.source === current.wordId);

    for (const rel of parentRels) {
      queue.push({
        wordId: rel.target,
        path: [...current.path, rel.target],
        rels: [...current.rels, rel]
      });
    }
  }

  return null;
}

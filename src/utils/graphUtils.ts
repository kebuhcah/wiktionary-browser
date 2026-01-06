import { Node, Edge, MarkerType } from 'reactflow';
import { EtymologyWord, EtymologyRelationship } from '../types/etymology';
import { getLanguageColor } from './languageColors';

export function convertWordsToNodes(words: EtymologyWord[]): Node[] {
  return words.map(word => ({
    id: word.id,
    type: 'wordNode',
    position: { x: 0, y: 0 }, // Will be set by layout
    data: {
      ...word,
      color: getLanguageColor(word.language)
    }
  }));
}

export function convertRelationshipsToEdges(
  relationships: EtymologyRelationship[]
): Edge[] {
  return relationships.map(rel => ({
    id: rel.id,
    source: rel.source,
    target: rel.target,
    type: rel.type === 'cognate_with' ? 'default' : 'default',
    animated: rel.type === 'borrowed_from',
    style: {
      strokeWidth: 2,
      stroke: rel.type === 'borrowed_from' ? '#94a3b8' : '#64748b',
      strokeDasharray: rel.type === 'borrowed_from' ? '5,5' : undefined
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#64748b'
    },
    data: {
      relationshipType: rel.type,
      notes: rel.notes
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

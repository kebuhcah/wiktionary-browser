import { useState, useCallback, useEffect } from 'react';
import { EtymologyData } from '../../types/etymology';
import { convertWordsToNodes, convertRelationshipsToEdges } from '../../utils/graphUtils';
import { getRelatedWords, getParentWords } from '../../data/currereEtymologyData';

export type RelationshipType = 'inherited_from' | 'derived_from' | 'borrowed_from' | 'cognate_with';

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  fx?: number | null;  // Fixed x position (for dragging)
  fy?: number | null;  // Fixed y position (for dragging)
  data: {
    word: string;
    language: string;
    languageDisplay: string;
    definition?: string;
    partOfSpeech?: string;
    color: string;
    hasParents?: boolean;
    isExpanded?: boolean;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  animated?: boolean;
  style?: {
    strokeWidth: number;
    stroke: string;
    strokeDasharray?: string;
  };
}

interface UseGraphStateProps {
  etymologyData: EtymologyData;
  initialWordId?: string;
}

export function useGraphState({ etymologyData, initialWordId }: UseGraphStateProps) {
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const getInitialGraph = useCallback(() => {
    if (initialWordId) {
      const initialWord = etymologyData.words.find(w => w.id === initialWordId);
      if (initialWord) {
        return {
          nodes: convertWordsToNodes([initialWord]),
          edges: [] as GraphEdge[]
        };
      }
    }

    const startWords = etymologyData.words.slice(0, 3);
    return {
      nodes: convertWordsToNodes(startWords),
      edges: [] as GraphEdge[]
    };
  }, [etymologyData, initialWordId]);

  const [nodes, setNodes] = useState<GraphNode[]>(getInitialGraph().nodes);
  const [edges, setEdges] = useState<GraphEdge[]>(getInitialGraph().edges);

  const expandNode = useCallback((nodeId: string) => {
    setExpandedNodeIds(prev => {
      if (prev.has(nodeId)) {
        return prev;
      }

      // Get both parents (etymology sources) and children (words derived from this)
      const relatedData = getRelatedWords(nodeId);
      const parentData = relatedData.parents;
      const childData = relatedData.children;

      if (parentData.length === 0 && childData.length === 0) {
        return prev;
      }

      // Combine all related words and relationships
      const newWords = [
        ...parentData.map(p => p.word),
        ...childData.map(c => c.word)
      ];
      const newRelationships = [
        ...parentData.map(p => p.relationship),
        ...childData.map(c => c.relationship)
      ];

      setNodes(currentNodes => {
        const existingNodeIds = new Set(currentNodes.map(n => n.id));
        const wordsToAdd = newWords.filter(w => !existingNodeIds.has(w.id));

        if (wordsToAdd.length > 0) {
          const newNodes = convertWordsToNodes(wordsToAdd);
          return [...currentNodes, ...newNodes];
        }
        return currentNodes;
      });

      setEdges(currentEdges => {
        const existingEdgeIds = new Set(currentEdges.map(e => e.id));
        const relationshipsToAdd = newRelationships.filter(r => !existingEdgeIds.has(r.id));

        if (relationshipsToAdd.length > 0) {
          const newEdges = convertRelationshipsToEdges(relationshipsToAdd);
          return [...currentEdges, ...newEdges];
        }
        return currentEdges;
      });

      return new Set([...prev, nodeId]);
    });
  }, []);

  const focusOnWord = useCallback((wordId: string) => {
    const word = etymologyData.words.find(w => w.id === wordId);
    if (!word) {
      return;
    }

    setNodes(currentNodes => {
      const existingNode = currentNodes.find(n => n.id === wordId);
      if (!existingNode) {
        // Add the node if it doesn't exist, but keep existing nodes
        const newNode = convertWordsToNodes([word]);
        return [...currentNodes, ...newNode];
      }
      return currentNodes;
    });

    setSelectedNodeId(wordId);
  }, [etymologyData]);

  const updateNodeData = useCallback((nodeId: string, updates: Partial<GraphNode['data']>) => {
    setNodes(prev =>
      prev.map(node =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    );
  }, []);

  const markNodeAsHavingParents = useCallback(() => {
    setNodes(prev =>
      prev.map(node => {
        const hasParents = getParentWords(node.id).length > 0;
        const isExpanded = expandedNodeIds.has(node.id);
        return {
          ...node,
          data: {
            ...node.data,
            hasParents,
            isExpanded
          }
        };
      })
    );
  }, [expandedNodeIds]);

  // Automatically expand initial node to show connections
  useEffect(() => {
    if (initialWordId && !expandedNodeIds.has(initialWordId)) {
      // Small delay to let the initial render complete
      setTimeout(() => {
        expandNode(initialWordId);
      }, 100);
    }
  }, [initialWordId, expandNode, expandedNodeIds]);

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    selectedNodeId,
    setSelectedNodeId,
    expandedNodeIds,
    expandNode,
    focusOnWord,
    updateNodeData,
    markNodeAsHavingParents
  };
}

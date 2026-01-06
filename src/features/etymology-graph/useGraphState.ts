import { useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { EtymologyData } from '../../types/etymology';
import { convertWordsToNodes, convertRelationshipsToEdges } from '../../utils/graphUtils';
import { getParentWords } from '../../data/mockEtymologyData';

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
          edges: [] as Edge[]
        };
      }
    }

    const startWords = etymologyData.words.slice(0, 3);
    return {
      nodes: convertWordsToNodes(startWords),
      edges: [] as Edge[]
    };
  }, [etymologyData, initialWordId]);

  const [nodes, setNodes] = useState<Node[]>(getInitialGraph().nodes);
  const [edges, setEdges] = useState<Edge[]>(getInitialGraph().edges);

  const expandNode = useCallback((nodeId: string) => {
    if (expandedNodeIds.has(nodeId)) {
      return;
    }

    const parentData = getParentWords(nodeId);

    if (parentData.length === 0) {
      return;
    }

    const newWords = parentData.map(p => p.word);
    const newRelationships = parentData.map(p => p.relationship);

    const existingNodeIds = new Set(nodes.map(n => n.id));
    const wordsToAdd = newWords.filter(w => !existingNodeIds.has(w.id));

    if (wordsToAdd.length > 0) {
      const newNodes = convertWordsToNodes(wordsToAdd);
      setNodes(prev => [...prev, ...newNodes]);
    }

    const existingEdgeIds = new Set(edges.map(e => e.id));
    const relationshipsToAdd = newRelationships.filter(r => !existingEdgeIds.has(r.id));

    if (relationshipsToAdd.length > 0) {
      const newEdges = convertRelationshipsToEdges(relationshipsToAdd);
      setEdges(prev => [...prev, ...newEdges]);
    }

    setExpandedNodeIds(prev => new Set([...prev, nodeId]));
  }, [nodes, edges, expandedNodeIds]);

  const focusOnWord = useCallback((wordId: string) => {
    const word = etymologyData.words.find(w => w.id === wordId);
    if (!word) {
      return;
    }

    const existingNode = nodes.find(n => n.id === wordId);
    if (!existingNode) {
      const newNode = convertWordsToNodes([word]);
      setNodes([...newNode]);
      setEdges([]);
      setExpandedNodeIds(new Set());
    }

    setSelectedNodeId(wordId);
  }, [etymologyData, nodes]);

  const updateNodeData = useCallback((nodeId: string, updates: Partial<Node['data']>) => {
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

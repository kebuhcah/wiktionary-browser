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
    setExpandedNodeIds(prev => {
      if (prev.has(nodeId)) {
        return prev;
      }

      const parentData = getParentWords(nodeId);

      if (parentData.length === 0) {
        return prev;
      }

      const newWords = parentData.map(p => p.word);
      const newRelationships = parentData.map(p => p.relationship);

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

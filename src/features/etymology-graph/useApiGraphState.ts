import { useState, useCallback, useEffect } from 'react';
import { getEtymology } from '../../api/etymologyApi';
import { GraphNode, GraphEdge, RelationshipType } from './useGraphState';
import { getLanguageColor } from '../../utils/languageColors';

interface UseApiGraphStateProps {
  initialWord?: { word: string; language: string } | null;
}

export function useApiGraphState({ initialWord }: UseApiGraphStateProps) {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to create node ID
  const createNodeId = (word: string, language: string) => `${word}__${language}`;

  // Helper to convert API word to GraphNode
  const createGraphNode = (word: string, language: string, languageDisplay: string, data?: any): GraphNode => ({
    id: createNodeId(word, language),
    x: 0,
    y: 0,
    data: {
      word,
      language,
      languageDisplay,
      definition: data?.senses?.[0]?.glosses?.[0] || undefined,
      partOfSpeech: data?.pos || undefined,
      color: getLanguageColor(language),
      hasParents: false, // Will be updated when we check
      isExpanded: false
    }
  });

  // Load a word and its relationships
  const loadWord = useCallback(async (word: string, language: string, autoExpand: boolean = true) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getEtymology(word, language);
      const nodeId = createNodeId(word, language);

      // Create main node
      const mainNode = createGraphNode(
        data.word.word,
        data.word.language,
        data.word.language,
        data.word
      );
      mainNode.data.hasParents = data.parents.length > 0;

      // Create parent nodes
      const parentNodes: GraphNode[] = data.parents
        .filter(p => p.details)
        .map(p => createGraphNode(
          p.details!.word,
          p.details!.language,
          p.details!.language,
          p.details
        ));

      // Create child nodes
      const childNodes: GraphNode[] = data.children
        .filter(c => c.details)
        .map(c => createGraphNode(
          c.details!.word,
          c.details!.language,
          c.details!.language,
          c.details
        ));

      // Create edges from parents to main node
      const parentEdges: GraphEdge[] = data.parents
        .filter(p => p.details)
        .map((p, i) => ({
          id: `${createNodeId(p.details!.word, p.details!.language)}->${nodeId}-${i}`,
          source: createNodeId(p.details!.word, p.details!.language),
          target: nodeId,
          type: p.type.replace(/_/g, '_') as RelationshipType,
          animated: p.type.includes('borrowed'),
          style: {
            strokeWidth: 2,
            stroke: p.type.includes('borrowed') ? '#94a3b8' : '#64748b',
            strokeDasharray: p.type.includes('borrowed') ? '5,5' : undefined
          }
        }));

      // Create edges from main node to children
      const childEdges: GraphEdge[] = data.children
        .filter(c => c.details)
        .map((c, i) => ({
          id: `${nodeId}->${createNodeId(c.details!.word, c.details!.language)}-${i}`,
          source: nodeId,
          target: createNodeId(c.details!.word, c.details!.language),
          type: c.type.replace(/_/g, '_') as RelationshipType,
          animated: c.type.includes('borrowed'),
          style: {
            strokeWidth: 2,
            stroke: c.type.includes('borrowed') ? '#94a3b8' : '#64748b',
            strokeDasharray: c.type.includes('borrowed') ? '5,5' : undefined
          }
        }));

      setNodes(currentNodes => {
        const existingNodeIds = new Set(currentNodes.map(n => n.id));
        const newNodes = [mainNode, ...parentNodes, ...childNodes].filter(
          n => !existingNodeIds.has(n.id)
        );
        return [...currentNodes, ...newNodes];
      });

      setEdges(currentEdges => {
        const existingEdgeIds = new Set(currentEdges.map(e => e.id));
        const newEdges = [...parentEdges, ...childEdges].filter(
          e => !existingEdgeIds.has(e.id)
        );
        return [...currentEdges, ...newEdges];
      });

      setExpandedNodeIds(prev => {
        const updated = new Set([...prev, nodeId]);

        // Auto-expand parent and child nodes to show all connections
        if (autoExpand) {
          const nodesToExpand = [...parentNodes, ...childNodes];
          for (const node of nodesToExpand) {
            if (!updated.has(node.id)) {
              // Load relationships for this node (but don't wait and don't auto-expand further)
              loadWord(node.data.word, node.data.language, false).catch(() => {
                // Silently fail if we can't load a node's relationships
              });
            }
          }
        }

        return updated;
      });
    } catch (err) {
      setError(`Failed to load etymology for ${word}`);
      console.error('Failed to load etymology:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Expand node - load its relationships
  const expandNode = useCallback((nodeId: string) => {
    if (expandedNodeIds.has(nodeId)) {
      return;
    }

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    loadWord(node.data.word, node.data.language);
  }, [nodes, expandedNodeIds, loadWord]);

  // Focus on a word - clear graph and load just this word
  const focusOnWord = useCallback((word: string, language: string) => {
    setNodes([]);
    setEdges([]);
    setExpandedNodeIds(new Set());
    setSelectedNodeId(createNodeId(word, language));
    loadWord(word, language);
  }, [loadWord]);

  // Update node data (for marking hasParents, etc.)
  const updateNodeData = useCallback((nodeId: string, updates: Partial<GraphNode['data']>) => {
    setNodes(prev =>
      prev.map(node =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    );
  }, []);

  // Mark nodes with parents
  const markNodeAsHavingParents = useCallback(() => {
    setNodes(prev =>
      prev.map(node => {
        const hasParents = edges.some(e => e.target === node.id);
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
  }, [edges, expandedNodeIds]);

  // Load initial word
  useEffect(() => {
    if (initialWord) {
      focusOnWord(initialWord.word, initialWord.language);
    }
  }, [initialWord?.word, initialWord?.language]); // eslint-disable-line react-hooks/exhaustive-deps

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
    markNodeAsHavingParents,
    loading,
    error
  };
}

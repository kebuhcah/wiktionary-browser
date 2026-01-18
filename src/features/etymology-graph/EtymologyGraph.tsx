import { useEffect } from 'react';
import { useGraphState, GraphNode } from './useGraphState';
import { useApiGraphState } from './useApiGraphState';
import { useGraphLayout } from './useGraphLayout';
import { currereEtymologyData } from '../../data/currereEtymologyData';
import { D3Graph } from './D3Graph';
import SidePanel from '../../components/SidePanel';
import ApiSidePanel from '../../components/ApiSidePanel';
import './EtymologyGraph.css';

interface EtymologyGraphProps {
  initialWordId?: string;
  onNodeSelect?: (nodeId: string | null) => void;
  searchWordId?: string;
  initialWord?: { word: string; language: string } | null;
}

export default function EtymologyGraph({ initialWordId, onNodeSelect, searchWordId, initialWord }: EtymologyGraphProps) {
  // Use API hook if initialWord is provided, otherwise use static data
  const staticGraphState = useGraphState({
    etymologyData: currereEtymologyData,
    initialWordId
  });

  const apiGraphState = useApiGraphState({
    initialWord
  });

  // Choose which state to use based on whether we have initialWord
  const graphState = initialWord ? apiGraphState : staticGraphState;

  const {
    nodes,
    edges,
    setNodes,
    selectedNodeId,
    setSelectedNodeId,
    expandNode,
    focusOnWord,
    markNodeAsHavingParents
  } = graphState;

  const { simNodesRef, simulationRef } = useGraphLayout(nodes, edges, setNodes, true);

  useEffect(() => {
    markNodeAsHavingParents();
  }, [nodes, markNodeAsHavingParents]);

  useEffect(() => {
    if (searchWordId) {
      focusOnWord(searchWordId);
    }
  }, [searchWordId, focusOnWord]);

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    onNodeSelect?.(nodeId);
  };

  const handleNodeExpand = (nodeId: string) => {
    expandNode(nodeId);
  };

  const handleClosePanel = () => {
    setSelectedNodeId(null);
    onNodeSelect?.(null);
  };

  const handleWordClick = (wordId: string) => {
    if (initialWord) {
      // API mode: parse word and language from ID
      const parts = wordId.split('__');
      if (parts.length === 2) {
        const [word, language] = parts;
        (focusOnWord as (word: string, language: string) => void)(word, language);
      }
    } else {
      // Static mode: use word ID directly
      (focusOnWord as (wordId: string) => void)(wordId);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <D3Graph
          nodes={nodes}
          edges={edges}
          selectedNodeId={selectedNodeId}
          onNodeSelect={handleNodeSelect}
          onNodeExpand={handleNodeExpand}
          simulationNodesRef={simNodesRef as React.MutableRefObject<GraphNode[]>}
          simulationRef={simulationRef}
        />
      </div>
      {initialWord ? (
        <ApiSidePanel
          selectedNodeId={selectedNodeId}
          nodes={nodes}
          edges={edges}
          onClose={handleClosePanel}
          onWordClick={handleWordClick}
        />
      ) : (
        <SidePanel
          selectedWordId={selectedNodeId}
          onClose={handleClosePanel}
          onWordClick={handleWordClick}
        />
      )}
    </div>
  );
}

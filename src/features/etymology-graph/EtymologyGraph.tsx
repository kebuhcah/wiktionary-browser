import { useEffect } from 'react';
import { useGraphState, GraphNode } from './useGraphState';
import { useGraphLayout } from './useGraphLayout';
import { currereEtymologyData } from '../../data/currereEtymologyData';
import { D3Graph } from './D3Graph';
import SidePanel from '../../components/SidePanel';
import './EtymologyGraph.css';

interface EtymologyGraphProps {
  initialWordId?: string;
  onNodeSelect?: (nodeId: string | null) => void;
  searchWordId?: string;
}

export default function EtymologyGraph({ initialWordId, onNodeSelect, searchWordId }: EtymologyGraphProps) {
  const {
    nodes,
    edges,
    setNodes,
    selectedNodeId,
    setSelectedNodeId,
    expandNode,
    focusOnWord,
    markNodeAsHavingParents
  } = useGraphState({
    etymologyData: currereEtymologyData,
    initialWordId
  });

  const { simNodesRef } = useGraphLayout(nodes, edges, setNodes, true);

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
    focusOnWord(wordId);
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
        />
      </div>
      <SidePanel
        selectedWordId={selectedNodeId}
        onClose={handleClosePanel}
        onWordClick={handleWordClick}
      />
    </div>
  );
}

import { useEffect, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import WordNode from '../../components/nodes/WordNode';
import { useGraphState } from './useGraphState';
import { useGraphLayout } from './useGraphLayout';
import { mockEtymologyData } from '../../data/mockEtymologyData';
import './EtymologyGraph.css';

const nodeTypes: NodeTypes = {
  wordNode: WordNode
};

interface EtymologyGraphProps {
  initialWordId?: string;
  onNodeSelect?: (nodeId: string | null) => void;
  searchWordId?: string;
}

function EtymologyGraphInner({ initialWordId, onNodeSelect, searchWordId }: EtymologyGraphProps) {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    selectedNodeId,
    setSelectedNodeId,
    expandNode,
    focusOnWord,
    markNodeAsHavingParents
  } = useGraphState({
    etymologyData: mockEtymologyData,
    initialWordId
  });

  useGraphLayout(nodes, edges, true);

  useEffect(() => {
    markNodeAsHavingParents();
  }, [nodes, markNodeAsHavingParents]);

  useEffect(() => {
    if (searchWordId) {
      focusOnWord(searchWordId);
    }
  }, [searchWordId, focusOnWord]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: { id: string }) => {
      if (selectedNodeId === node.id) {
        expandNode(node.id);
      } else {
        setSelectedNodeId(node.id);
        onNodeSelect?.(node.id);
      }
    },
    [selectedNodeId, expandNode, setSelectedNodeId, onNodeSelect]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    onNodeSelect?.(null);
  }, [setSelectedNodeId, onNodeSelect]);

  return (
    <div className="etymology-graph-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep'
        }}
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => (node.data as { color: string }).color}
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
      </ReactFlow>
    </div>
  );
}

export default function EtymologyGraph(props: EtymologyGraphProps) {
  return (
    <ReactFlowProvider>
      <EtymologyGraphInner {...props} />
    </ReactFlowProvider>
  );
}

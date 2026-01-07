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
  ReactFlowProvider,
  Node as ReactFlowNode
} from 'reactflow';
import 'reactflow/dist/style.css';
import WordNode from '../../components/nodes/WordNode';
import { useGraphState } from './useGraphState';
import { useGraphLayout } from './useGraphLayout';
import { mockEtymologyData } from '../../data/mockEtymologyData';
import { updateEdgeHandles } from '../../utils/edgeHelpers';
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

  const { simNodesRef } = useGraphLayout(nodes, edges, true);

  useEffect(() => {
    markNodeAsHavingParents();
  }, [nodes, markNodeAsHavingParents]);

  // Update edge handles based on node positions
  useEffect(() => {
    const updatedEdges = updateEdgeHandles(nodes, edges);

    // Only update if handles actually changed
    const hasChanges = updatedEdges.some((edge, i) =>
      edge.sourceHandle !== edges[i]?.sourceHandle ||
      edge.targetHandle !== edges[i]?.targetHandle
    );

    if (hasChanges) {
      setEdges(updatedEdges);
    }
  }, [nodes, edges, setEdges]);

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

  const onNodeDragStart = useCallback(
    (_event: React.MouseEvent, node: ReactFlowNode) => {
      // Fix node position in simulation so d3 doesn't move it
      const simNode = simNodesRef.current.find(n => n.id === node.id);
      if (simNode) {
        simNode.fx = simNode.x;
        simNode.fy = simNode.y;
      }
    },
    [simNodesRef]
  );

  const onNodeDrag = useCallback(
    (_event: React.MouseEvent, node: ReactFlowNode) => {
      // Update simulation node position as user drags
      const simNode = simNodesRef.current.find(n => n.id === node.id);
      if (simNode) {
        simNode.fx = node.position.x;
        simNode.fy = node.position.y;
      }
    },
    [simNodesRef]
  );

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: ReactFlowNode) => {
      // Unfix node so simulation can move it again
      const simNode = simNodesRef.current.find(n => n.id === node.id);
      if (simNode) {
        simNode.fx = null;
        simNode.fy = null;
      }
    },
    [simNodesRef]
  );

  return (
    <div className="etymology-graph-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'default'  // Bezier curves - smooth and organic
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

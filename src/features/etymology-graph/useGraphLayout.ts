import { useEffect, useRef } from 'react';
import * as d3 from 'd3-force';
import { GraphNode, GraphEdge } from './useGraphState';

interface SimulationNode extends d3.SimulationNodeDatum {
  id: string;
  x?: number;
  y?: number;
  fx?: number | null;  // Fixed x position (for dragging)
  fy?: number | null;  // Fixed y position (for dragging)
}

interface SimulationLink extends d3.SimulationLinkDatum<SimulationNode> {
  source: string | SimulationNode;
  target: string | SimulationNode;
}

export function useGraphLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  setNodes: React.Dispatch<React.SetStateAction<GraphNode[]>>,
  enabled: boolean = true
) {
  const simulationRef = useRef<d3.Simulation<SimulationNode, SimulationLink> | null>(null);
  const simNodesRef = useRef<SimulationNode[]>([]);

  useEffect(() => {
    if (!enabled || nodes.length === 0) {
      return;
    }

    const simNodes: SimulationNode[] = nodes.map(node => ({
      id: node.id,
      x: node.x || 0,
      y: node.y || 0,
      fx: null,
      fy: null
    }));

    simNodesRef.current = simNodes;

    const simLinks: SimulationLink[] = edges.map(edge => ({
      source: edge.source,
      target: edge.target
    }));

    const simulation = d3.forceSimulation(simNodes)
      .force('link', d3.forceLink<SimulationNode, SimulationLink>(simLinks)
        .id(d => d.id)
        .distance(150)      // Moderate distance between connected nodes
        .strength(0.7)      // Strong enough to keep connections visible
      )
      .force('charge', d3.forceManyBody()
        .strength(-120)     // Reduced repulsion for tighter grouping
      )
      .force('center', d3.forceCenter(0, 0))
      .force('collide', d3.forceCollide()
        .radius(80)         // Prevent overlap with reasonable spacing
        .strength(0.9)      // Strong collision prevention
      );

    simulation.on('tick', () => {
      setNodes(prevNodes =>
        prevNodes.map(node => {
          const simNode = simNodes.find(n => n.id === node.id);
          if (simNode && simNode.x !== undefined && simNode.y !== undefined) {
            return {
              ...node,
              x: simNode.x,
              y: simNode.y
            };
          }
          return node;
        })
      );
    });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [nodes.length, edges.length, enabled, setNodes]);

  return { simulationRef, simNodesRef };
}

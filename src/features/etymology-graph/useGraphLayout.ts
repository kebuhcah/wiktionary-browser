import { useEffect, useRef } from 'react';
import { Node, Edge, useReactFlow } from 'reactflow';
import * as d3 from 'd3-force';

interface SimulationNode extends d3.SimulationNodeDatum {
  id: string;
  x?: number;
  y?: number;
}

interface SimulationLink extends d3.SimulationLinkDatum<SimulationNode> {
  source: string | SimulationNode;
  target: string | SimulationNode;
}

export function useGraphLayout(nodes: Node[], edges: Edge[], enabled: boolean = true) {
  const { setNodes } = useReactFlow();
  const simulationRef = useRef<d3.Simulation<SimulationNode, SimulationLink> | null>(null);

  useEffect(() => {
    if (!enabled || nodes.length === 0) {
      return;
    }

    const simNodes: SimulationNode[] = nodes.map(node => ({
      id: node.id,
      x: node.position.x || 0,
      y: node.position.y || 0
    }));

    const simLinks: SimulationLink[] = edges.map(edge => ({
      source: edge.source,
      target: edge.target
    }));

    const simulation = d3.forceSimulation(simNodes)
      .force('link', d3.forceLink<SimulationNode, SimulationLink>(simLinks)
        .id(d => d.id)
        .distance(120)
        .strength(0.8)
      )
      .force('charge', d3.forceManyBody()
        .strength(-400)
      )
      .force('center', d3.forceCenter(0, 0))
      .force('collide', d3.forceCollide()
        .radius(80)
        .strength(0.7)
      );

    simulation.on('tick', () => {
      setNodes(prevNodes =>
        prevNodes.map(node => {
          const simNode = simNodes.find(n => n.id === node.id);
          if (simNode && simNode.x !== undefined && simNode.y !== undefined) {
            return {
              ...node,
              position: {
                x: simNode.x,
                y: simNode.y
              }
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

  return simulationRef;
}

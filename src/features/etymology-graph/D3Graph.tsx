import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3-selection';
import 'd3-transition';  // Extends d3-selection with transition methods
import { zoom as d3Zoom, zoomIdentity, ZoomBehavior } from 'd3-zoom';
import { drag as d3Drag } from 'd3-drag';
import { GraphNode, GraphEdge } from './useGraphState';
import { generateEdgePath, calculateBoundingBox } from './utils/edgePaths';
import { ZoomControls } from './controls/ZoomControls';
import { MiniMap } from './minimap/MiniMap';
import './D3Graph.css';

export interface D3GraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId: string | null;
  onNodeSelect?: (nodeId: string) => void;
  onNodeExpand?: (nodeId: string) => void;
  simulationNodesRef: React.MutableRefObject<GraphNode[]>;
}

interface Transform {
  x: number;
  y: number;
  k: number;
}

const NODE_RADIUS = 30;

export function D3Graph({
  nodes,
  edges,
  selectedNodeId,
  onNodeSelect,
  onNodeExpand,
  simulationNodesRef
}: D3GraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const viewportRef = useRef<SVGGElement>(null);
  const zoomBehaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const dragBehaviorRef = useRef<any>(null);
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });
  const [currentTransform, setCurrentTransform] = useState<Transform>({ x: 0, y: 0, k: 1 });

  // Setup zoom and drag behaviors (runs once)
  useEffect(() => {
    if (!svgRef.current || !viewportRef.current) return;

    const svg = d3.select(svgRef.current);
    const viewport = d3.select(viewportRef.current);

    // Setup zoom behavior
    const zoom = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 2])
      .on('zoom', (event) => {
        viewport.attr('transform', event.transform.toString());
        setCurrentTransform({
          x: event.transform.x,
          y: event.transform.y,
          k: event.transform.k
        });
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Setup drag behavior
    const drag = d3Drag<SVGGElement, GraphNode>()
      .on('start', (_event, d) => {
        const simNode = simulationNodesRef.current.find(n => n.id === d.id);
        if (simNode) {
          simNode.fx = simNode.x;
          simNode.fy = simNode.y;
        }
      })
      .on('drag', (event, d) => {
        const simNode = simulationNodesRef.current.find(n => n.id === d.id);
        if (simNode) {
          simNode.fx = event.x;
          simNode.fy = event.y;
          // Update visual position immediately
          d3.select(event.sourceEvent.target.parentNode as SVGGElement)
            .attr('transform', `translate(${event.x},${event.y})`);
        }
      })
      .on('end', (_event, d) => {
        const simNode = simulationNodesRef.current.find(n => n.id === d.id);
        if (simNode) {
          simNode.fx = null;
          simNode.fy = null;
        }
      });

    dragBehaviorRef.current = drag;

    // Create arrow marker
    svg.select('defs').remove();
    const defs = svg.append('defs');

    defs
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#64748b');

    // Create grid pattern
    const pattern = defs
      .append('pattern')
      .attr('id', 'grid')
      .attr('width', 20)
      .attr('height', 20)
      .attr('patternUnits', 'userSpaceOnUse');

    pattern
      .append('rect')
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', '#f8fafc');

    pattern
      .append('path')
      .attr('d', 'M 20 0 L 0 0 0 20')
      .attr('fill', 'none')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 0.5);

    // Track SVG dimensions for minimap
    const updateDimensions = () => {
      if (svgRef.current) {
        setSvgDimensions({
          width: svgRef.current.clientWidth,
          height: svgRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [simulationNodesRef]);

  // Update graph rendering (runs on data changes)
  useEffect(() => {
    if (!viewportRef.current) return;

    const viewport = d3.select(viewportRef.current);

    // Update edges
    const edgesGroup = viewport.select('.edges');
    if (edgesGroup.empty()) {
      viewport.append('g').attr('class', 'edges');
    }

    const edgePaths = viewport
      .select('.edges')
      .selectAll<SVGPathElement, GraphEdge>('path')
      .data(edges, d => d.id);

    edgePaths
      .enter()
      .append('path')
      .attr('class', 'edge')
      .merge(edgePaths)
      .attr('d', d => {
        const source = nodes.find(n => n.id === d.source);
        const target = nodes.find(n => n.id === d.target);
        if (!source || !target) return '';
        return generateEdgePath(source, target, NODE_RADIUS);
      })
      .attr('stroke', d => d.style?.stroke || '#64748b')
      .attr('stroke-width', d => d.style?.strokeWidth || 2)
      .attr('stroke-dasharray', d => d.style?.strokeDasharray || null)
      .attr('fill', 'none')
      .attr('marker-end', 'url(#arrowhead)');

    edgePaths.exit().remove();

    // Update nodes
    const nodesGroup = viewport.select('.nodes');
    if (nodesGroup.empty()) {
      viewport.append('g').attr('class', 'nodes');
    }

    const nodeGroups = viewport
      .select('.nodes')
      .selectAll<SVGGElement, GraphNode>('g.node')
      .data(nodes, d => d.id);

    const nodeEnter = nodeGroups
      .enter()
      .append('g')
      .attr('class', 'node');

    // Add circle
    nodeEnter
      .append('circle')
      .attr('r', NODE_RADIUS)
      .attr('fill', d => d.data.color);

    // Add word label
    nodeEnter
      .append('text')
      .attr('class', 'word-label')
      .attr('y', NODE_RADIUS + 16)
      .attr('text-anchor', 'middle');

    // Add language label
    nodeEnter
      .append('text')
      .attr('class', 'language-label')
      .attr('y', NODE_RADIUS + 28)
      .attr('text-anchor', 'middle');

    // Add expand indicator (small circle at bottom)
    nodeEnter
      .append('circle')
      .attr('class', 'expand-indicator')
      .attr('r', 4)
      .attr('cy', NODE_RADIUS + 12)
      .attr('fill', '#94a3b8');

    // Update all nodes (merge enter + update selections)
    const allNodes = nodeGroups.merge(nodeEnter);

    // Apply drag behavior and click handler to ALL nodes
    allNodes
      .call(dragBehaviorRef.current!)
      .on('click', (event, d) => {
        event.stopPropagation();
        if (selectedNodeId === d.id) {
          // Double-click effect: expand on second click
          onNodeExpand?.(d.id);
        } else {
          onNodeSelect?.(d.id);
        }
      });

    allNodes
      .attr('transform', d => `translate(${d.x},${d.y})`);

    allNodes
      .select('circle:first-child')
      .attr('stroke', d => (selectedNodeId === d.id ? '#000' : 'none'))
      .attr('stroke-width', 3);

    allNodes
      .select('.word-label')
      .text(d => d.data.word);

    allNodes
      .select('.language-label')
      .text(d => d.data.languageDisplay);

    allNodes
      .select('.expand-indicator')
      .style('display', d => (d.data.hasParents && !d.data.isExpanded ? 'block' : 'none'));

    nodeGroups.exit().remove();
  }, [nodes, edges, selectedNodeId, onNodeSelect, onNodeExpand]);

  // Zoom control handlers
  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomBehaviorRef.current.scaleBy, 0.77);
    }
  };

  const handleFitView = () => {
    if (!svgRef.current || !zoomBehaviorRef.current || nodes.length === 0) return;

    const bbox = calculateBoundingBox(nodes);
    const svgWidth = svgRef.current.clientWidth;
    const svgHeight = svgRef.current.clientHeight;

    const scale = Math.min(svgWidth / bbox.width, svgHeight / bbox.height, 2);
    const translateX = svgWidth / 2 - scale * (bbox.minX + bbox.width / 2);
    const translateY = svgHeight / 2 - scale * (bbox.minY + bbox.height / 2);

    d3.select(svgRef.current)
      .transition()
      .duration(500)
      .call(
        zoomBehaviorRef.current.transform,
        zoomIdentity.translate(translateX, translateY).scale(scale)
      );
  };

  return (
    <div className="etymology-graph-container">
      <svg ref={svgRef} className="etymology-graph-svg">
        <defs />
        <g ref={viewportRef} className="viewport">
          <rect
            className="background-grid"
            x="-5000"
            y="-5000"
            width="10000"
            height="10000"
            fill="url(#grid)"
          />
        </g>
      </svg>

      <ZoomControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
      />

      <MiniMap
        nodes={nodes}
        viewportTransform={currentTransform}
        svgWidth={svgDimensions.width}
        svgHeight={svgDimensions.height}
      />
    </div>
  );
}

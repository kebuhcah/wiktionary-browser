import { useEffect, useRef } from 'react';
import * as d3 from 'd3-selection';
import { GraphNode } from '../useGraphState';
import { calculateBoundingBox } from '../utils/edgePaths';
import './MiniMap.css';

export interface MiniMapProps {
  nodes: GraphNode[];
  viewportTransform: { x: number; y: number; k: number };
  svgWidth: number;
  svgHeight: number;
}

const MINIMAP_WIDTH = 150;
const MINIMAP_HEIGHT = 100;

export function MiniMap({ nodes, viewportTransform, svgWidth, svgHeight }: MiniMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Calculate bounding box of all nodes
    const bbox = calculateBoundingBox(nodes, 50);

    // Calculate scale to fit all nodes in minimap
    const scaleX = MINIMAP_WIDTH / bbox.width;
    const scaleY = MINIMAP_HEIGHT / bbox.height;
    const scale = Math.min(scaleX, scaleY, 1);

    // Center the graph in the minimap
    const offsetX = (MINIMAP_WIDTH - bbox.width * scale) / 2;
    const offsetY = (MINIMAP_HEIGHT - bbox.height * scale) / 2;

    // Transform function to convert graph coordinates to minimap coordinates
    const transformX = (x: number) => (x - bbox.minX) * scale + offsetX;
    const transformY = (y: number) => (y - bbox.minY) * scale + offsetY;

    // Draw nodes
    svg
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('cx', d => transformX(d.x))
      .attr('cy', d => transformY(d.y))
      .attr('r', 2)
      .attr('fill', d => d.data.color)
      .attr('opacity', 0.6);

    // Calculate viewport rectangle in minimap coordinates
    if (svgWidth > 0 && svgHeight > 0) {
      // The viewport in graph coordinates
      const viewportGraphX = -viewportTransform.x / viewportTransform.k;
      const viewportGraphY = -viewportTransform.y / viewportTransform.k;
      const viewportGraphWidth = svgWidth / viewportTransform.k;
      const viewportGraphHeight = svgHeight / viewportTransform.k;

      // Transform to minimap coordinates
      const viewportMinimapX = transformX(viewportGraphX);
      const viewportMinimapY = transformY(viewportGraphY);
      const viewportMinimapWidth = viewportGraphWidth * scale;
      const viewportMinimapHeight = viewportGraphHeight * scale;

      // Draw viewport rectangle
      svg
        .append('rect')
        .attr('x', viewportMinimapX)
        .attr('y', viewportMinimapY)
        .attr('width', viewportMinimapWidth)
        .attr('height', viewportMinimapHeight)
        .attr('fill', 'none')
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 1.5)
        .attr('rx', 2);
    }
  }, [nodes, viewportTransform, svgWidth, svgHeight]);

  if (nodes.length === 0) {
    return null;
  }

  return (
    <div className="minimap">
      <svg
        ref={svgRef}
        width={MINIMAP_WIDTH}
        height={MINIMAP_HEIGHT}
        className="minimap-svg"
      />
    </div>
  );
}

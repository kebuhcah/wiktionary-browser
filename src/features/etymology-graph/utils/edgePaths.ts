import { GraphNode, GraphEdge } from '../useGraphState';

/**
 * Generates an SVG path string for an edge between two nodes with slight curvature
 * to reduce edge overlap when multiple edges radiate from the same node.
 *
 * @param source - The source node
 * @param target - The target node
 * @param radius - The radius of the node circles (default: 30)
 * @param edgeIndex - Optional index for multiple edges between nodes
 * @param totalEdges - Optional total number of edges from source
 * @returns SVG path string with quadratic Bézier curve
 */
export function generateEdgePath(
  source: GraphNode,
  target: GraphNode,
  radius: number = 30,
  edgeIndex: number = 0,
  totalEdges: number = 1
): string {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Prevent division by zero for overlapping nodes
  if (distance === 0) {
    return `M ${source.x},${source.y} L ${source.x},${source.y}`;
  }

  // Calculate unit vector
  const unitX = dx / distance;
  const unitY = dy / distance;

  // Start point: just outside source node circle
  const sourceX = source.x + unitX * radius;
  const sourceY = source.y + unitY * radius;

  // End point: just before target node circle (leaving space for arrow marker)
  const arrowSpace = 10; // Space for the arrow marker
  const targetX = target.x - unitX * (radius + arrowSpace);
  const targetY = target.y - unitY * (radius + arrowSpace);

  // Add curvature to reduce edge overlap
  // Calculate perpendicular offset for the control point
  const perpX = -unitY; // Perpendicular unit vector
  const perpY = unitX;

  // Midpoint of the edge
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  // Add slight curvature (20-30 pixels offset) based on edge index
  // This spreads out edges that would otherwise overlap
  const curvature = 25;
  const offset = (edgeIndex % 2 === 0 ? 1 : -1) * curvature * (Math.floor(edgeIndex / 2) + 1) / Math.max(totalEdges / 2, 1);

  const controlX = midX + perpX * offset;
  const controlY = midY + perpY * offset;

  // Use quadratic Bézier curve for smoother appearance
  return `M ${sourceX},${sourceY} Q ${controlX},${controlY} ${targetX},${targetY}`;
}

/**
 * Calculates the bounding box of all nodes
 * Useful for fit-to-view calculations
 *
 * @param nodes - Array of graph nodes
 * @param padding - Padding around the bounding box (default: 100)
 * @returns Object with minX, maxX, minY, maxY, width, height
 */
export function calculateBoundingBox(
  nodes: GraphNode[],
  padding: number = 100
) {
  if (nodes.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 };
  }

  const xs = nodes.map(n => n.x);
  const ys = nodes.map(n => n.y);

  const minX = Math.min(...xs) - padding;
  const maxX = Math.max(...xs) + padding;
  const minY = Math.min(...ys) - padding;
  const maxY = Math.max(...ys) + padding;

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  };
}

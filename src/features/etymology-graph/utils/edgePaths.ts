import { GraphNode } from '../useGraphState';

/**
 * Generates an SVG path string for an edge between two nodes
 * The path starts just outside the source node's circle and ends just before the target node's circle
 *
 * @param source - The source node
 * @param target - The target node
 * @param radius - The radius of the node circles (default: 30)
 * @returns SVG path string in the format "M x,y L x,y"
 */
export function generateEdgePath(
  source: GraphNode,
  target: GraphNode,
  radius: number = 30
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

  return `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
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

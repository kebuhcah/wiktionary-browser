import { Node, Edge } from 'reactflow';

/**
 * Calculate which handles to use based on relative positions of nodes
 */
export function getOptimalHandles(
  sourceNode: Node,
  targetNode: Node
): { sourceHandle: string; targetHandle: string } {
  const dx = targetNode.position.x - sourceNode.position.x;
  const dy = targetNode.position.y - sourceNode.position.y;

  // Determine primary direction
  const angle = Math.atan2(dy, dx);
  const degrees = angle * (180 / Math.PI);

  // Source handle (where edge leaves from)
  let sourceHandle: string;
  if (degrees >= -45 && degrees < 45) {
    sourceHandle = 'source-right';
  } else if (degrees >= 45 && degrees < 135) {
    sourceHandle = 'source-bottom';
  } else if (degrees >= 135 || degrees < -135) {
    sourceHandle = 'source-left';
  } else {
    sourceHandle = 'source-top';
  }

  // Target handle (where edge goes to) - opposite direction
  let targetHandle: string;
  if (degrees >= -45 && degrees < 45) {
    targetHandle = 'target-left';
  } else if (degrees >= 45 && degrees < 135) {
    targetHandle = 'target-top';
  } else if (degrees >= 135 || degrees < -135) {
    targetHandle = 'target-right';
  } else {
    targetHandle = 'target-bottom';
  }

  return { sourceHandle, targetHandle };
}

/**
 * Update edges with optimal handle positions based on current node positions
 */
export function updateEdgeHandles(nodes: Node[], edges: Edge[]): Edge[] {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  return edges.map(edge => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);

    if (!sourceNode || !targetNode) {
      return edge;
    }

    const { sourceHandle, targetHandle } = getOptimalHandles(sourceNode, targetNode);

    return {
      ...edge,
      sourceHandle,
      targetHandle
    };
  });
}

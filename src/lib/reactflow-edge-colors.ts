import type { Edge } from 'reactflow';

const mergeEdgeColorFields = (currentEdge: Edge, semanticEdge: Edge): Edge => {
  let updatedEdge = currentEdge;

  if (semanticEdge.style?.stroke !== undefined) {
    updatedEdge = {
      ...updatedEdge,
      style: {
        ...currentEdge.style,
        stroke: semanticEdge.style.stroke,
      },
    };
  }

  if (semanticEdge.labelStyle?.fill !== undefined) {
    updatedEdge = {
      ...updatedEdge,
      labelStyle: {
        ...currentEdge.labelStyle,
        fill: semanticEdge.labelStyle.fill,
      },
    };
  }

  if (currentEdge.markerEnd && semanticEdge.markerEnd?.color !== undefined) {
    updatedEdge = {
      ...updatedEdge,
      markerEnd: {
        ...currentEdge.markerEnd,
        color: semanticEdge.markerEnd.color,
      },
    };
  }

  return updatedEdge;
};

export function mergeSemanticEdgeColors(
  currentEdges: Edge[],
  semanticEdges: Edge[]
): Edge[] {
  const semanticEdgesById = new Map(
    semanticEdges.map(edge => [edge.id, edge] as const)
  );

  return currentEdges.map(currentEdge => {
    const semanticEdge = semanticEdgesById.get(currentEdge.id);
    return semanticEdge
      ? mergeEdgeColorFields(currentEdge, semanticEdge)
      : currentEdge;
  });
}

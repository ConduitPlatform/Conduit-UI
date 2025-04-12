import type React from 'react';
declare module 'reactflow' {
  import type { ComponentType, ReactNode } from 'react';

  export type NodeTypes = {
    [key: string]: ComponentType<any>;
  };

  export type EdgeTypes = {
    [key: string]: ComponentType<any>;
  };

  export type Node<T = any> = {
    id: string;
    position: {
      x: number;
      y: number;
    };
    data: T;
    type?: string;
    style?: React.CSSProperties;
    className?: string;
    targetPosition?: Position;
    sourcePosition?: Position;
    hidden?: boolean;
    selected?: boolean;
    draggable?: boolean;
    selectable?: boolean;
    connectable?: boolean;
    dragHandle?: string;
    width?: number;
    height?: number;
    parentNode?: string;
    zIndex?: number;
    extent?: 'parent' | [number, number, number, number];
    expandParent?: boolean;
    positionAbsolute?: {
      x: number;
      y: number;
    };
  };

  export type Edge<T = any> = {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    type?: string;
    label?: string | ReactNode;
    labelStyle?: React.CSSProperties;
    labelShowBg?: boolean;
    labelBgStyle?: React.CSSProperties;
    labelBgPadding?: [number, number];
    labelBgBorderRadius?: number;
    style?: React.CSSProperties;
    animated?: boolean;
    hidden?: boolean;
    data?: T;
    className?: string;
    selected?: boolean;
    markerEnd?: {
      type: MarkerType;
      color?: string;
      width?: number;
      height?: number;
      strokeWidth?: number;
    };
    markerStart?: {
      type: MarkerType;
      color?: string;
      width?: number;
      height?: number;
      strokeWidth?: number;
    };
    zIndex?: number;
    ariaLabel?: string;
    interactionWidth?: number;
  };

  export enum Position {
    Left = 'left',
    Top = 'top',
    Right = 'right',
    Bottom = 'bottom',
  }

  export enum MarkerType {
    Arrow = 'arrow',
    ArrowClosed = 'arrowclosed',
  }

  export type NodeChange = any;
  export type EdgeChange = any;

  export function useNodesState(
    initialNodes: Node[]
  ): [
    Node[],
    React.Dispatch<React.SetStateAction<Node[]>>,
    (changes: NodeChange[]) => void,
  ];

  export function useEdgesState(
    initialEdges: Edge[]
  ): [
    Edge[],
    React.Dispatch<React.SetStateAction<Edge[]>>,
    (changes: EdgeChange[]) => void,
  ];

  export interface ReactFlowProps {
    nodes: Node[];
    edges: Edge[];
    defaultNodes?: Node[];
    defaultEdges?: Edge[];
    onNodesChange?: (changes: NodeChange[]) => void;
    onEdgesChange?: (changes: EdgeChange[]) => void;
    onNodeClick?: (event: React.MouseEvent, node: Node) => void;
    onEdgeClick?: (event: React.MouseEvent, edge: Edge) => void;
    onNodeDoubleClick?: (event: React.MouseEvent, node: Node) => void;
    onEdgeDoubleClick?: (event: React.MouseEvent, edge: Edge) => void;
    onNodeMouseEnter?: (event: React.MouseEvent, node: Node) => void;
    onNodeMouseMove?: (event: React.MouseEvent, node: Node) => void;
    onNodeMouseLeave?: (event: React.MouseEvent, node: Node) => void;
    onNodeContextMenu?: (event: React.MouseEvent, node: Node) => void;
    onNodeDragStart?: (event: React.MouseEvent, node: Node) => void;
    onNodeDrag?: (event: React.MouseEvent, node: Node) => void;
    onNodeDragStop?: (event: React.MouseEvent, node: Node) => void;
    onConnect?: (connection: any) => void;
    onConnectStart?: (event: React.MouseEvent, params: any) => void;
    onConnectStop?: (event: React.MouseEvent) => void;
    onConnectEnd?: (event: React.MouseEvent) => void;
    nodeTypes?: NodeTypes;
    edgeTypes?: EdgeTypes;
    connectionLineType?: string;
    connectionLineStyle?: React.CSSProperties;
    connectionLineComponent?: ComponentType<any>;
    connectionMode?: string;
    deleteKeyCode?: string | null;
    selectionKeyCode?: string | null;
    multiSelectionKeyCode?: string | null;
    zoomActivationKeyCode?: string | null;
    snapToGrid?: boolean;
    snapGrid?: [number, number];
    onlyRenderVisibleElements?: boolean;
    nodesDraggable?: boolean;
    nodesConnectable?: boolean;
    elementsSelectable?: boolean;
    selectNodesOnDrag?: boolean;
    panOnDrag?: boolean | number[];
    minZoom?: number;
    maxZoom?: number;
    defaultZoom?: number;
    defaultPosition?: [number, number];
    translateExtent?: [[number, number], [number, number]];
    preventScrolling?: boolean;
    nodeExtent?: [[number, number], [number, number]];
    defaultMarkerColor?: string;
    zoomOnScroll?: boolean;
    zoomOnPinch?: boolean;
    panOnScroll?: boolean;
    panOnScrollSpeed?: number;
    panOnScrollMode?: string;
    zoomOnDoubleClick?: boolean;
    projectEdges?: boolean;
    fitView?: boolean;
    fitViewOptions?: any;
    onMove?: (flowTransform?: any) => void;
    onMoveStart?: (flowTransform?: any) => void;
    onMoveEnd?: (flowTransform?: any) => void;
    noDragClassName?: string;
    noWheelClassName?: string;
    noPanClassName?: string;
    attributionPosition?: string;
    proOptions?: any;
    children?: ReactNode;
  }

  export interface HandleProps {
    type: 'source' | 'target';
    position: Position;
    id?: string;
    style?: React.CSSProperties;
    className?: string;
    isConnectable?: boolean;
    isConnectableStart?: boolean;
    isConnectableEnd?: boolean;
    onConnect?: (params: any) => void;
  }

  export const Handle: React.FC<HandleProps>;
  export const Controls: React.FC<any>;
  export const Background: React.FC<any>;
  export const MiniMap: React.FC<any>;

  declare const ReactFlow: React.FC<ReactFlowProps>;
  export default ReactFlow;
}

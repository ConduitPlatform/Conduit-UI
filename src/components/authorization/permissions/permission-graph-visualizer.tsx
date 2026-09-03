'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  type Node,
  type Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  Handle,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  User,
  Users,
  FileText,
  Shield,
  Link,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useChartColors } from '@/lib/hooks/useChartColors';

// Types from the parent component
interface PermissionStep {
  type: 'relation' | 'permission' | 'inheritance';
  description: string;
  from: {
    type: string;
    id: string;
    name?: string;
  };
  to: {
    type: string;
    id: string;
    name?: string;
  };
  relation?: string;
  permission?: string;
}

interface PermissionPath {
  steps: PermissionStep[];
  actorIndexes: any[];
  objectIndexes: any[];
}

interface PermissionGraphVisualizerProps {
  path: PermissionPath;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Custom node types
const EntityNode = ({
  data,
}: {
  data: { label: string; type: string; id: string };
}) => {
  const getIcon = () => {
    switch (data.type) {
      case 'User':
        return <User className="h-4 w-4 text-chart-1" />;
      case 'Team':
        return <Users className="h-4 w-4 text-chart-4" />;
      default:
        return <FileText className="h-4 w-4 text-chart-3" />;
    }
  };

  return (
    <div className="graph-node rounded-md border border-border-strong bg-surface-1 px-4 py-2 text-center text-foreground shadow-md min-w-[140px]">
      <Handle
        type="target"
        position={Position.Left}
        className="bg-graph-edge!"
      />
      <div className="flex items-center justify-center gap-2">
        {getIcon()}
        <div className="font-medium">{data.label}</div>
      </div>
      <div className="text-xs text-muted-foreground mt-1">{data.id}</div>
      <Handle
        type="source"
        position={Position.Right}
        className="bg-graph-edge!"
      />
    </div>
  );
};

const RelationNode = ({ data }: { data: { relation: string } }) => {
  return (
    <div className="graph-node rounded-md border border-graph-middleware bg-graph-middleware-muted px-3 py-1 text-center text-graph-middleware-foreground shadow-xs min-w-[100px]">
      <Handle
        type="target"
        position={Position.Left}
        className="bg-graph-middleware!"
      />
      <div className="flex items-center justify-center gap-1">
        <Link className="h-3.5 w-3.5" />
        <div className="text-sm font-medium">{data.relation}</div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="bg-graph-middleware!"
      />
    </div>
  );
};

const PermissionNode = ({ data }: { data: { permission: string } }) => {
  return (
    <div className="graph-node rounded-md border border-graph-route bg-graph-route-muted px-3 py-1 text-center text-graph-route-foreground shadow-xs min-w-[100px]">
      <Handle
        type="target"
        position={Position.Left}
        className="bg-graph-route!"
      />
      <div className="flex items-center justify-center gap-1">
        <Shield className="h-3.5 w-3.5" />
        <div className="text-sm font-medium">{data.permission}</div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="bg-graph-route!"
      />
    </div>
  );
};

// Node types mapping
const nodeTypes = {
  entity: EntityNode,
  relation: RelationNode,
  permission: PermissionNode,
};

export default function PermissionGraphVisualizer({
  path,
  open,
  onOpenChange,
}: PermissionGraphVisualizerProps) {
  const colors = useChartColors();

  // Create nodes and edges from the permission path
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const nodeMap = new Map<string, number>(); // Map to track node indices

    // Helper to get a unique node ID
    const getNodeId = (type: string, id: string, nodeType: string) => {
      const key = `${nodeType}-${type}-${id}`;
      if (!nodeMap.has(key)) {
        nodeMap.set(key, nodeMap.size);
      }
      return key;
    };

    // Process each step in the path
    path.steps.forEach((step, stepIndex) => {
      const fromId = getNodeId(step.from.type, step.from.id, 'entity');
      const toId = getNodeId(step.to.type, step.to.id, 'entity');

      // Add from entity node if it doesn't exist
      if (!nodes.find(n => n.id === fromId)) {
        nodes.push({
          id: fromId,
          type: 'entity',
          data: {
            label: step.from.type,
            type: step.from.type,
            id: step.from.id,
          },
          position: { x: 100 + stepIndex * 400, y: 100 },
        });
      }

      // Add to entity node if it doesn't exist
      if (!nodes.find(n => n.id === toId)) {
        nodes.push({
          id: toId,
          type: 'entity',
          data: {
            label: step.to.type,
            type: step.to.type,
            id: step.to.id,
          },
          position: { x: 100 + (stepIndex + 1) * 400, y: 100 },
        });
      }

      // For relation steps, add a relation node
      if (step.type === 'relation' && step.relation) {
        const relationId = `relation-${stepIndex}`;
        nodes.push({
          id: relationId,
          type: 'relation',
          data: {
            relation: step.relation,
          },
          position: { x: 100 + stepIndex * 300 + 250, y: 115 },
        });

        // Connect from entity to relation
        edges.push({
          id: `e-${fromId}-${relationId}`,
          source: fromId,
          target: relationId,
          style: { stroke: colors.chart5 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: colors.chart5,
          },
        });

        // Connect relation to to entity
        edges.push({
          id: `e-${relationId}-${toId}`,
          source: relationId,
          target: toId,
          style: { stroke: colors.chart5 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: colors.chart5,
          },
        });
      }

      // For permission steps, add a permission node
      if (step.type === 'permission' && step.permission) {
        const permissionId = `permission-${stepIndex}`;
        nodes.push({
          id: permissionId,
          type: 'permission',
          data: {
            permission: step.permission,
          },
          position: { x: 100 + stepIndex * 300 + 350, y: 115 },
        });

        // Connect from entity to permission
        edges.push({
          id: `e-${fromId}-${permissionId}`,
          source: fromId,
          target: permissionId,
          style: { stroke: colors.chart2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: colors.chart2,
          },
        });

        // Connect permission to to entity
        edges.push({
          id: `e-${permissionId}-${toId}`,
          source: permissionId,
          target: toId,
          style: { stroke: colors.chart2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: colors.chart2,
          },
        });
      }

      // For inheritance steps, directly connect the entities
      if (step.type === 'inheritance') {
        edges.push({
          id: `e-${fromId}-${toId}`,
          source: fromId,
          target: toId,
          label: 'inherits',
          labelStyle: { fill: colors.chart1, fontWeight: 500 },
          style: { stroke: colors.chart1 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: colors.chart1,
          },
        });
      }
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [path, colors]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Force a re-render when the modal opens to ensure the graph is displayed
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setNodes([...initialNodes]);
        setEdges([...initialEdges]);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open, initialNodes, initialEdges, setNodes, setEdges]);

  // Handle zoom controls
  const [zoomLevel, setZoomLevel] = useState(1);
  const onZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  }, []);

  const onZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  }, []);

  const onResetZoom = useCallback(() => {
    setZoomLevel(1);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[90vw] max-h-[90vh] h-[90vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle>Permission Graph</DialogTitle>
        </DialogHeader>

        <div className="h-[600px] w-full overflow-hidden rounded-md border bg-surface-2">
          <ReactFlow
            //@ts-ignore
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.5}
            maxZoom={2}
            zoomOnScroll={true}
            zoomOnPinch={true}
            panOnScroll={true}
            panOnDrag={true}
            defaultZoom={zoomLevel}
            className="semantic-react-flow"
            style={{ background: 'var(--color-surface-2)' }}
          >
            <Controls showInteractive={false} />
            <Background color={colors.chartGrid} />
            <Panel
              position="top-left"
              className="rounded border bg-graph-panel p-2 text-sm text-foreground shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Badge variant="outline">Permission Path Visualization</Badge>
                <Badge>{path.steps.length} steps</Badge>
              </div>
            </Panel>
            <Panel position="top-right" className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={onZoomIn}
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={onZoomOut}
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={onResetZoom}
                title="Reset Zoom"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </Panel>
            <Panel
              position="bottom-left"
              className="rounded border bg-graph-panel p-2 text-xs text-foreground shadow-xs"
            >
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-chart-1" />
                  <span>User</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-chart-4" />
                  <span>Team</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3 text-chart-3" />
                  <span>Resource</span>
                </div>
                <div className="flex items-center gap-1">
                  <Link className="h-3 w-3 text-graph-middleware-foreground" />
                  <span>Relation</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-graph-route-foreground" />
                  <span>Permission</span>
                </div>
              </div>
            </Panel>
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-md border bg-graph-panel p-4 text-foreground shadow-md">
                  <p className="text-lg font-medium">
                    No permission path data available
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try refreshing or selecting a different permission.
                  </p>
                </div>
              </div>
            )}
          </ReactFlow>
        </div>
      </DialogContent>
    </Dialog>
  );
}

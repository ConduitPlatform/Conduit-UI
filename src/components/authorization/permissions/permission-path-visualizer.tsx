'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  ArrowRight,
  User,
  Users,
  FileText,
  FolderKanban,
  Shield,
  Link,
} from 'lucide-react';

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

interface PermissionPathVisualizerProps {
  path: PermissionPath;
}

type PermissionStepType = PermissionStep['type'];

export default function PermissionPathVisualizer({
  path,
}: Readonly<PermissionPathVisualizerProps>) {
  // Get icon for resource type
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'User':
        return <User className="h-4 w-4" />;
      case 'Team':
        return <Users className="h-4 w-4" />;
      case 'Document':
        return <FileText className="h-4 w-4" />;
      case 'Project':
        return <FolderKanban className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  // Get color for step type
  const getStepColor = (type: PermissionStepType) => {
    switch (type) {
      case 'relation':
        return 'bg-graph-middleware-muted border-graph-middleware text-graph-middleware-foreground';
      case 'permission':
        return 'bg-graph-route-muted border-graph-route text-graph-route-foreground';
      case 'inheritance':
        return 'bg-graph-router-muted border-graph-router text-graph-router-foreground';
      default: {
        const exhaustive: never = type;
        return exhaustive;
      }
    }
  };

  // Get icon for step type
  const getStepIcon = (type: PermissionStepType) => {
    switch (type) {
      case 'relation':
        return <Link className="h-4 w-4 text-graph-middleware-foreground" />;
      case 'permission':
        return <Shield className="h-4 w-4 text-graph-route-foreground" />;
      case 'inheritance':
        return <ArrowRight className="h-4 w-4 text-graph-router-foreground" />;
      default: {
        const exhaustive: never = type;
        return exhaustive;
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Permission Path</h3>
        <Badge variant="outline">Steps: {path.steps.length}</Badge>
      </div>

      <div className="relative">
        {/* Vertical line connecting steps */}
        <div className="absolute bottom-8 left-6 top-8 z-0 w-0.5 bg-graph-edge-muted"></div>

        {/* Steps */}
        <div className="space-y-4 relative z-10">
          {path.steps.map((step, index) => (
            <Card
              key={index}
              className={`p-4 border ${getStepColor(step.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-surface-1">
                  {getStepIcon(step.type)}
                </div>
                <div className="flex-1">
                  <div className="font-medium mb-1 flex items-center gap-2">
                    <span>
                      Step {index + 1}:{' '}
                      {step.type.charAt(0).toUpperCase() + step.type.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{step.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 bg-surface-1 text-foreground"
                    >
                      {getResourceIcon(step.from.type)}
                      <span>
                        {step.from.type}:{step.from.id}
                      </span>
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    {step.relation && (
                      <Badge className="border-graph-middleware bg-graph-middleware-muted text-graph-middleware-foreground hover:bg-graph-middleware-muted">
                        {step.relation}
                      </Badge>
                    )}
                    {step.permission && (
                      <Badge className="border-graph-route bg-graph-route-muted text-graph-route-foreground hover:bg-graph-route-muted">
                        {step.permission}
                      </Badge>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 bg-surface-1 text-foreground"
                    >
                      {getResourceIcon(step.to.type)}
                      <span>
                        {step.to.type}:{step.to.id}
                      </span>
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

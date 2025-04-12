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
  const getStepColor = (type: string) => {
    switch (type) {
      case 'relation':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'permission':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'inheritance':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  // Get icon for step type
  const getStepIcon = (type: string) => {
    switch (type) {
      case 'relation':
        return <Link className="h-4 w-4 text-purple-600" />;
      case 'permission':
        return <Shield className="h-4 w-4 text-green-600" />;
      case 'inheritance':
        return <ArrowRight className="h-4 w-4 text-blue-600" />;
      default:
        return null;
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
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-muted z-0"></div>

        {/* Steps */}
        <div className="space-y-4 relative z-10">
          {path.steps.map((step, index) => (
            <Card
              key={index}
              className={`p-4 border ${getStepColor(step.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white flex items-center justify-center border">
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
                      className="flex items-center gap-1 bg-white text-background"
                    >
                      {getResourceIcon(step.from.type)}
                      <span>
                        {step.from.type}:{step.from.id}
                      </span>
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    {step.relation && (
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100">
                        {step.relation}
                      </Badge>
                    )}
                    {step.permission && (
                      <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                        {step.permission}
                      </Badge>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 bg-white text-background"
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

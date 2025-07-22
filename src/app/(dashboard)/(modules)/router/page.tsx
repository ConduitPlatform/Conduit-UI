import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Route, Shield, Settings, BarChart3 } from 'lucide-react';

export default function RouterDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Router Dashboard</h2>
        <p className="text-muted-foreground">
          Manage your router configuration, security, and monitor routes
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Route Visualization
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Visualize</div>
            <p className="text-xs text-muted-foreground">
              Interactive graph view of your routes and middlewares
            </p>
            <Button asChild className="mt-4 w-full">
              <Link href="/router/vizualize">
                <Route className="h-4 w-4 mr-2" />
                View Routes
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Security Clients
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Manage</div>
            <p className="text-xs text-muted-foreground">
              Create and manage security clients for your applications
            </p>
            <Button asChild className="mt-4 w-full">
              <Link href="/router/security">
                <Shield className="h-4 w-4 mr-2" />
                Security Clients
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Router Settings
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Configure</div>
            <p className="text-xs text-muted-foreground">
              Configure CORS, rate limiting, and transport settings
            </p>
            <Button asChild className="mt-4 w-full">
              <Link href="/router/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common router management tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/router/vizualize">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Route Graph
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/router/security">
                <Shield className="h-4 w-4 mr-2" />
                Manage Security Clients
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/router/settings">
                <Settings className="h-4 w-4 mr-2" />
                Configure Router
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Router Overview</CardTitle>
            <CardDescription>
              Key information about your router configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <span className="text-sm text-green-600">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Transport Protocols</span>
              <span className="text-sm text-muted-foreground">
                REST, GraphQL, WebSocket
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Security</span>
              <span className="text-sm text-muted-foreground">
                Client validation enabled
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

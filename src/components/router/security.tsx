'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/lib/hooks/use-toast';
import {
  LoaderIcon,
  Plus,
  Edit,
  Trash2,
  Shield,
  Globe,
  Smartphone,
  Monitor,
} from 'lucide-react';
import {
  SecurityClientsResponse,
  SecurityClient,
  CreateSecurityClientRequest,
  UpdateSecurityClientRequest,
} from '@/lib/models/Router';
import {
  getSecurityClients,
  createSecurityClient,
  updateSecurityClient,
  deleteSecurityClient,
} from '@/lib/api/router';

const CreateClientSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  domain: z.string().optional(),
  alias: z.string().optional(),
  notes: z.string().optional(),
});

const UpdateClientSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  domain: z.string().optional(),
  alias: z.string().optional(),
  notes: z.string().optional(),
});

interface Props {
  data: SecurityClientsResponse;
}

export const SecurityClients = ({ data }: Props) => {
  const [clients, setClients] = useState<SecurityClient[]>(data.clients);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<SecurityClient | null>(
    null
  );

  const createForm = useForm<CreateSecurityClientRequest>({
    resolver: zodResolver(CreateClientSchema),
    defaultValues: {
      platform: '',
      domain: '',
      alias: '',
      notes: '',
    },
  });

  const updateForm = useForm<UpdateSecurityClientRequest>({
    resolver: zodResolver(UpdateClientSchema),
    defaultValues: {
      platform: '',
      domain: '',
      alias: '',
      notes: '',
    },
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform.toUpperCase()) {
      case 'WEB':
        return <Globe className="h-4 w-4" />;
      case 'IOS':
      case 'ANDROID':
      case 'IPADOS':
        return <Smartphone className="h-4 w-4" />;
      case 'WINDOWS':
      case 'MACOS':
      case 'LINUX':
        return <Monitor className="h-4 w-4" />;
      case 'CLI':
        return <Shield className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toUpperCase()) {
      case 'WEB':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IOS':
      case 'ANDROID':
      case 'IPADOS':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'WINDOWS':
      case 'MACOS':
      case 'LINUX':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'CLI':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleCreateClient = async (formData: CreateSecurityClientRequest) => {
    try {
      const { id, dismiss } = toast({
        title: 'Security Client',
        description: (
          <div className={'flex flex-row items-center space-x-2.5'}>
            <LoaderIcon className={'w-8 h-8 animate-spin'} />
            <p className="text-sm text-foreground">
              Creating Security Client...
            </p>
          </div>
        ),
      });

      console.log('Creating security client with data:', formData);
      const response = await createSecurityClient(formData);
      console.log('Security client creation response:', response);

      // Refresh the clients list
      const updatedData = await getSecurityClients();
      setClients(updatedData.clients);

      dismiss();
      toast({
        title: 'Security Client',
        description: 'Security client created successfully',
      });

      setIsCreateOpen(false);
      createForm.reset();
    } catch (error) {
      console.error('Error creating security client:', error);
      toast({
        title: 'Error',
        description: 'Failed to create security client',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateClient = async (formData: UpdateSecurityClientRequest) => {
    if (!editingClient) return;

    try {
      const { id, dismiss } = toast({
        title: 'Security Client',
        description: (
          <div className={'flex flex-row items-center space-x-2.5'}>
            <LoaderIcon className={'w-8 h-8 animate-spin'} />
            <p className="text-sm text-foreground">
              Updating Security Client...
            </p>
          </div>
        ),
      });

      console.log('Updating security client with data:', formData);
      const response = await updateSecurityClient(editingClient._id, formData);
      console.log('Security client update response:', response);

      // Refresh the clients list
      const updatedData = await getSecurityClients();
      setClients(updatedData.clients);

      dismiss();
      toast({
        title: 'Security Client',
        description: 'Security client updated successfully',
      });

      setIsEditOpen(false);
      setEditingClient(null);
      updateForm.reset();
    } catch (error) {
      console.error('Error updating security client:', error);
      toast({
        title: 'Error',
        description: 'Failed to update security client',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      const { id, dismiss } = toast({
        title: 'Security Client',
        description: (
          <div className={'flex flex-row items-center space-x-2.5'}>
            <LoaderIcon className={'w-8 h-8 animate-spin'} />
            <p className="text-sm text-foreground">
              Deleting Security Client...
            </p>
          </div>
        ),
      });

      console.log('Deleting security client with ID:', clientId);
      await deleteSecurityClient(clientId);
      console.log('Security client deleted successfully');

      // Refresh the clients list
      const updatedData = await getSecurityClients();
      setClients(updatedData.clients);

      dismiss();
      toast({
        title: 'Security Client',
        description: 'Security client deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting security client:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete security client',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (client: SecurityClient) => {
    setEditingClient(client);
    updateForm.reset({
      platform: client.platform,
      domain: client.domain || '',
      alias: client.alias || '',
      notes: client.notes || '',
    });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Security Clients
          </h2>
          <p className="text-muted-foreground">
            Manage security clients for your router
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Security Client</DialogTitle>
              <DialogDescription>
                Add a new security client for your router
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form
                onSubmit={createForm.handleSubmit(handleCreateClient)}
                className="space-y-4"
              >
                <FormField
                  control={createForm.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="WEB">Web</SelectItem>
                          <SelectItem value="IOS">Mobile (iOS)</SelectItem>
                          <SelectItem value="WINDOWS">
                            Desktop (Windows)
                          </SelectItem>
                          <SelectItem value="CLI">Other (CLI)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Domain</FormLabel>
                      <FormControl>
                        <Input placeholder="example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        The domain this client will be used for
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="alias"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alias</FormLabel>
                      <FormControl>
                        <Input placeholder="My App" {...field} />
                      </FormControl>
                      <FormDescription>
                        A friendly name for this client
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional notes..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Create Client</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {clients.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Security Clients
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                You haven&apos;t created any security clients yet. Create your
                first client to get started.
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </CardContent>
          </Card>
        ) : (
          clients.map(client => (
            <Card key={client._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getPlatformIcon(client.platform)}
                    <div>
                      <CardTitle className="text-lg">
                        {client.alias || 'Unnamed Client'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Badge className={getPlatformColor(client.platform)}>
                          {client.platform}
                        </Badge>
                        {client.domain && (
                          <>
                            <span>•</span>
                            <span>{client.domain}</span>
                          </>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog
                      open={isEditOpen && editingClient?._id === client._id}
                      onOpenChange={setIsEditOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(client)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Security Client</DialogTitle>
                          <DialogDescription>
                            Update the security client settings
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...updateForm}>
                          <form
                            onSubmit={updateForm.handleSubmit(
                              handleUpdateClient
                            )}
                            className="space-y-4"
                          >
                            <FormField
                              control={updateForm.control}
                              name="platform"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Platform</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select platform" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="WEB">Web</SelectItem>
                                      <SelectItem value="IOS">
                                        Mobile
                                      </SelectItem>
                                      <SelectItem value="WINDOWS">
                                        Desktop
                                      </SelectItem>
                                      <SelectItem value="CLI">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={updateForm.control}
                              name="domain"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Domain</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="example.com"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={updateForm.control}
                              name="alias"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Alias</FormLabel>
                                  <FormControl>
                                    <Input placeholder="My App" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={updateForm.control}
                              name="notes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Notes</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Additional notes..."
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button type="submit">Update Client</Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete Security Client
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this security
                            client? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteClient(client._id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Client ID:</span>
                    <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                      {client.clientId}
                    </code>
                  </div>
                  {client.notes && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Notes:</span>
                      <p className="mt-1">{client.notes}</p>
                    </div>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Created: {new Date(client.createdAt).toLocaleDateString()}
                    </span>
                    <span>
                      Updated: {new Date(client.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

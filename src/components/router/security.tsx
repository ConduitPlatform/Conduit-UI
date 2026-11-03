'use client';

import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import { rhfZodResolver } from '@/lib/zod-form';
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
import {
  AlertTriangle,
  Check,
  Copy,
  Plus,
  Edit,
  Trash2,
  Shield,
  Globe,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { useSettingsSave } from '@/lib/hooks/use-settings-save';
import {
  SecurityClientsResponse,
  SecurityClient,
  CreatedSecurityClient,
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

const DOMAIN_FIELD_DESCRIPTION =
  '*.example.com does not cover example.com. localhost and IP addresses are allowed, including a port and [::1].';

type RevealedClientSecret = {
  clientId: string;
  clientSecret: string;
  platform: string;
};

function storedClient(
  client: SecurityClient & { clientSecret?: string }
): SecurityClient {
  const stored = { ...client };
  delete stored.clientSecret;
  return stored;
}

function storedClientList(clients: unknown): SecurityClient[] {
  if (!Array.isArray(clients)) return [];
  return clients.map(client =>
    storedClient(client as SecurityClient & { clientSecret?: string })
  );
}

function DomainFieldDescription() {
  return <FormDescription>{DOMAIN_FIELD_DESCRIPTION}</FormDescription>;
}

function ClientSecretDialog({
  secret,
  onClose,
}: {
  secret: RevealedClientSecret | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const nonWeb = secret != null && secret.platform.toUpperCase() !== 'WEB';

  const copySecret = async () => {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret.clientSecret);
      setCopied(true);
      toast({
        title: 'Copied',
        description: 'Client secret copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to copy client secret',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={secret != null} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Security client created</DialogTitle>
          <DialogDescription>
            Copy the secret for client{' '}
            <span className="font-mono">{secret?.clientId}</span> before you
            close this dialog.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg border border-callout-warning bg-callout-warning-muted p-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-callout-warning-foreground" />
            <p className="text-sm text-callout-warning-foreground">
              Copy this secret now. You won&apos;t see this again.
            </p>
          </div>
          {nonWeb && (
            <p className="text-sm text-muted-foreground">
              This is the HMAC key and it cannot be recovered.
            </p>
          )}
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-muted p-3 font-mono text-sm break-all">
              {secret?.clientSecret}
            </code>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                void copySecret();
              }}
              className="shrink-0"
              aria-label="Copy client secret"
            >
              {copied ? (
                <Check className="h-4 w-4 text-status-healthy" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleClose}>
            I&apos;ve copied it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface Props {
  data: SecurityClientsResponse;
}

export const SecurityClients = ({ data }: Props) => {
  const [clients, setClients] = useState<SecurityClient[]>(() =>
    storedClientList(data.clients)
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [revealedSecret, setRevealedSecret] =
    useState<RevealedClientSecret | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<SecurityClient | null>(
    null
  );
  const { save, isSaving } = useSettingsSave('Security Client');

  const createForm = useForm<CreateSecurityClientRequest>({
    resolver: rhfZodResolver(CreateClientSchema),
    defaultValues: {
      platform: '',
      domain: '',
      alias: '',
      notes: '',
    },
  });

  const updateForm = useForm<UpdateSecurityClientRequest>({
    resolver: rhfZodResolver(
      UpdateClientSchema
    ) as Resolver<UpdateSecurityClientRequest>,
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
        return 'bg-callout-info-muted text-callout-info-foreground border-callout-info';
      case 'IOS':
      case 'ANDROID':
      case 'IPADOS':
        return 'bg-callout-success-muted text-callout-success-foreground border-callout-success';
      case 'WINDOWS':
      case 'MACOS':
      case 'LINUX':
        return 'bg-graph-middleware-muted text-graph-middleware-foreground border-graph-middleware';
      case 'CLI':
        return 'bg-surface-3 text-foreground-muted border-border-strong';
      default:
        return 'bg-surface-3 text-foreground-muted border-border-strong';
    }
  };

  const handleCreateClient = async (formData: CreateSecurityClientRequest) => {
    const result = await save({
      action: async () => {
        const created: CreatedSecurityClient =
          await createSecurityClient(formData);
        const updatedData = await getSecurityClients();
        setClients(storedClientList(updatedData.clients));
        return created;
      },
      successMessage: 'Security client created',
    });

    if (result.ok) {
      setIsCreateOpen(false);
      createForm.reset();
      if (result.result.clientSecret) {
        setRevealedSecret({
          clientId: result.result.clientId,
          clientSecret: result.result.clientSecret,
          platform: result.result.platform || formData.platform,
        });
      }
    }
  };

  const handleUpdateClient = async (formData: UpdateSecurityClientRequest) => {
    if (!editingClient) return;

    const result = await save({
      action: async () => {
        await updateSecurityClient(editingClient._id, formData);
        const updatedData = await getSecurityClients();
        setClients(storedClientList(updatedData.clients));
      },
      successMessage: 'Security client updated',
    });

    if (result.ok) {
      setIsEditOpen(false);
      setEditingClient(null);
      updateForm.reset();
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    await save({
      action: async () => {
        await deleteSecurityClient(clientId);
        const updatedData = await getSecurityClients();
        setClients(storedClientList(updatedData.clients));
      },
      successMessage: 'Security client deleted',
    });
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
                      <DomainFieldDescription />
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
                                  <DomainFieldDescription />
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
      <ClientSecretDialog
        secret={revealedSecret}
        onClose={() => setRevealedSecret(null)}
      />
    </div>
  );
};

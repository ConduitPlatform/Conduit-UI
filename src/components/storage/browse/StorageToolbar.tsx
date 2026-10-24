'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import {
  Upload,
  FolderPlus,
  List,
  LayoutGrid,
  Plus,
  Search,
} from 'lucide-react';
import { useStorageBrowse } from './StorageBrowseProvider';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { rhfZodResolver } from '@/lib/zod-form';
import { createContainer } from '@/lib/api/storage';
import { useToast } from '@/lib/hooks/use-toast';
import { useDebounce } from '@uidotdev/usehooks';

const containerSchema = z.object({
  name: z.string().min(1, 'Container name is required'),
  isPublic: z.boolean().default(false),
});

export function StorageToolbar({
  onUpload,
  onCreateFolder,
}: {
  onUpload: () => void;
  onCreateFolder: () => void;
}) {
  const {
    containers,
    container,
    search,
    viewMode,
    setContainer,
    setSearch,
    setViewMode,
    refreshContainers,
  } = useStorageBrowse();
  const { toast } = useToast();

  const [searchValue, setSearchValue] = useState(search);
  const debouncedSearch = useDebounce(searchValue, 300);
  const [createContainerOpen, setCreateContainerOpen] = useState(false);

  useEffect(() => {
    if (debouncedSearch === search) return;
    setSearch(debouncedSearch);
  }, [debouncedSearch, search, setSearch]);

  useEffect(() => {
    setSearchValue(search);
  }, [search]);

  const form = useForm<z.infer<typeof containerSchema>>({
    resolver: rhfZodResolver(containerSchema),
    defaultValues: { name: '', isPublic: false },
  });

  const handleCreateContainer = async (
    data: z.infer<typeof containerSchema>
  ) => {
    try {
      const res = await createContainer(data);
      await refreshContainers();
      setContainer(res.name);
      toast({ title: 'Storage', description: 'Container created' });
      setCreateContainerOpen(false);
      form.reset();
    } catch {
      toast({
        title: 'Storage',
        description: 'Failed to create container',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Select value={container ?? undefined} onValueChange={setContainer}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select container" />
              </SelectTrigger>
              <SelectContent>
                {containers.map(c => (
                  <SelectItem key={c._id} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setCreateContainerOpen(true)}
              title="Create container"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateFolder}
              disabled={!container}
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              New Folder
            </Button>
            <Button size="sm" onClick={onUpload} disabled={!container}>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files and folders..."
              className="pl-9"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              disabled={!container}
            />
          </div>
          <Tabs
            value={viewMode}
            onValueChange={v => setViewMode(v as 'list' | 'grid')}
          >
            <TabsList className="h-9">
              <TabsTrigger value="list" className="px-2.5">
                <List className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="grid" className="px-2.5">
                <LayoutGrid className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Dialog
        open={createContainerOpen}
        onOpenChange={v => {
          if (!v) form.reset();
          setCreateContainerOpen(v);
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Create Container</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCreateContainer)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Container Name</FormLabel>
                    <FormControl>
                      <Input placeholder="my-container" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormLabel className="mt-0">Public</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateContainerOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

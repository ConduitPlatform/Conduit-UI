import { Container } from '@/lib/models/storage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useSearchParams } from 'next/navigation';
import { SelectContainerDialog } from '@/components/storage/units/container/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateContainerDialog } from '@/components/storage/units/container/create';
import { useEffect, useState } from 'react';
import { getContainers } from '@/lib/api/storage';

export const ContainerDialog = ({
  refreshContainers,
}: {
  refreshContainers: () => Promise<Awaited<ReturnType<typeof getContainers>>>;
}) => {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState<boolean>(!searchParams.get('container'));
  const [containers, setContainers] = useState<Container[]>([]);

  useEffect(() => {
    refreshContainers().then(res => setContainers(res.containers));
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button>{searchParams.get('container') ?? 'Select Container'}</button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Container Options</DialogTitle>
        </DialogHeader>
        <Tabs
          defaultValue="select"
          className="mt-4 grid space-y-5 place-content-center"
        >
          <TabsList>
            <TabsTrigger value="select">Select Container</TabsTrigger>
            <TabsTrigger value="create">Create Container</TabsTrigger>
          </TabsList>
          <TabsContent value="select">
            <SelectContainerDialog
              containers={containers}
              callback={() => setOpen(!open)}
            />
          </TabsContent>
          <TabsContent value="create" className="overflow-auto h-full">
            <CreateContainerDialog
              callback={(data: Container) => {
                setOpen(!open);
                setContainers(prevState => [...prevState, data]);
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

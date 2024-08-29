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
import { useState } from 'react';

export const ContainerDialog = ({
  containers,
  refreshContainers,
}: {
  containers: Container[];
  refreshContainers: (container: Container) => void;
}) => {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState<boolean>(!searchParams.get('container'));

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
                refreshContainers(data);
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

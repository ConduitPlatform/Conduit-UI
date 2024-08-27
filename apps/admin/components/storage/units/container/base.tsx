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

export const ContainerDialog = ({
  containers,
  refreshContainers,
}: {
  containers: Container[];
  refreshContainers: (container: Container) => void;
}) => {
  const searchParams = useSearchParams();

  return (
    <Dialog>
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
            <SelectContainerDialog containers={containers} />
          </TabsContent>
          <TabsContent value="create" className="overflow-auto h-full">
            <CreateContainerDialog refreshContainers={refreshContainers} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

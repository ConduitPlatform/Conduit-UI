import { LogsAccordionList } from './LogsAccordionList';
import LogsFiltersPanel from './LogsFiltersPanel';
import { Module as BaseModule } from '@/lib/models/Module';

type Module = BaseModule & {
  serving: boolean;
};
type LogsProps = {
  modules: Module[];
};

export default function LogsViewer({ modules }: LogsProps) {
  return (
    <div className={'flex flex-col'}>
      <div
        className={
          'flex flex-row w-full justify-between p-4 border-b items-center sticky top-0 z-40 bg-background'
        }
      >
        <h1 className={'font-light text-xl'}>Logs Viewer</h1>
      </div>
      <LogsFiltersPanel modules={modules} open />
      <LogsAccordionList />
    </div>
  );
}

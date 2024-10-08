import React from 'react';
import { LogsAccordionList } from './LogsAccordionList';
import LogsFilters from './LogsFilters';

type Module = {
  moduleName: string;
  serving: boolean;
};
type LogsProps = {
  modules: Module[];
};

export default function LogsViewer({ modules }: LogsProps) {
  const servedModuleOptions = modules
    .filter(module => module.serving)
    .map(module => ({
      label: module.moduleName,
      value: module.moduleName,
    }));

  return (
    <div className={'flex flex-col'}>
      <div
        className={
          'flex flex-row w-full justify-between p-4 border-b items-center sticky top-0 z-40 bg-background'
        }
      >
        <h1 className={'font-light text-xl'}>Logs Viewer</h1>
      </div>
      <div className="container py-5 mx-auto">
        <LogsFilters moduleOptions={servedModuleOptions} />
        <LogsAccordionList />
      </div>
    </div>
  );
}

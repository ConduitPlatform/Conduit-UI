'use client';

import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { PlusCircleIcon } from 'lucide-react';
import { CreateFileForm } from '@/components/storage/units/file/forms/createForm';
import { SearchInput } from '@/components/storage/search';

export const Header = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex justify-between items-center gap-x-4">
        <h1 className="font-semibold text-3xl">Files</h1>
        <div className="flex gap-x-4 items-center">
          <CollapsibleTrigger>
            <Button
              variant="default"
              size="sm"
              className="w-fit space-x-2 px-2.5 py-1.5"
            >
              <PlusCircleIcon className="h-4 w-4" />
              <span>New File</span>
            </Button>
          </CollapsibleTrigger>
          <SearchInput field="fileName" />
        </div>
      </div>
      <CollapsibleContent className="w-full">
        <CreateFileForm />
      </CollapsibleContent>
    </Collapsible>
  );
};

'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import * as React from 'react';
import { ExtensionsForm } from '@/components/database/policies/extensions';
import { PermissionsForm } from '@/components/database/policies/permissions';
import { CrudForm } from '@/components/database/policies/crud';
import { DeclaredSchemas } from '@/lib/models/database';

export const Policies = ({ model }: { model?: DeclaredSchemas }) => {
  return (
    <div className="space-y-5">
      <Collapsible defaultOpen className="group/collapsible">
        <CollapsibleTrigger className="items-center flex w-full">
          <span className="font-semibold text-base">
            Extensions Configuration
          </span>
          <ChevronDown className="w-4 h-4 ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="gap-y-1">
          <ExtensionsForm model={model} />
        </CollapsibleContent>
      </Collapsible>
      <Collapsible defaultOpen className="group/collapsible">
        <CollapsibleTrigger className="items-center flex w-full">
          <span className="font-semibold text-base">
            Permissions Configuration
          </span>
          <ChevronDown className="w-4 h-4 ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="gap-y-1">
          <PermissionsForm model={model} />
        </CollapsibleContent>
      </Collapsible>
      <Collapsible defaultOpen className="group/collapsible">
        <CollapsibleTrigger className="items-center flex w-full">
          <span className="font-semibold text-base">Crud Configuration</span>
          <ChevronDown className="w-4 h-4 ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="gap-y-1">
          <CrudForm model={model} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

'use client';
import React from 'react';
import { Form } from '@/components/ui/form';
import MultiOptionsField from '@/components/ui/form-inputs/MultiOptionsField';
import SelectField from '@/components/ui/form-inputs/SelectField';
import {
  logsFormSchema,
  logsFormSchemaT,
} from '@/lib/models/logs-viewer/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useForm } from 'react-hook-form';

const limitOptions = ['100', '500', '1000', '5000'];
const timeOptions = [
  'last 10 minutes',
  'last 30 minutes',
  'last 1 hour',
  'last 24 hours',
  'today',
];

const levelsOptions = [
  { label: 'info', value: 'info' },
  { label: 'error', value: 'error' },
];

type Option = {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
};

interface LogsFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  moduleOptions?: Option[];
}

export default function LogsFiltersForm({
  moduleOptions,
  ...restProps
}: LogsFormProps) {
  const pathname = usePathname();
  const showModuleFilter = pathname === '/logs-viewer';

  const form = useForm<logsFormSchemaT>({
    resolver: zodResolver(logsFormSchema),
    defaultValues: {},
  });

  const selectTriggerClass = 'bg-background mt-0';

  return (
    <Form {...form}>
      <form
        className={
          'flex flex-col px-3 pt-3 pb-4 border mx-5 mb-5 rounded-md border-input bg-secondary data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:hidden'
        }
        {...restProps}
      >
        <div className="grid grid-cols-3 gap-4">
          <SelectField
            label={'Time'}
            fieldName={'time_range'}
            placeholder={'Select one option'}
            options={timeOptions}
            classNames={{ selectTrigger: selectTriggerClass }}
          />
          <SelectField
            label={'Limit'}
            fieldName={'limit'}
            options={limitOptions}
            placeholder={'Select one option'}
            classNames={{ selectTrigger: selectTriggerClass }}
          />
          <MultiOptionsField
            label={'Level'}
            fieldName={'level'}
            options={levelsOptions}
            placeholder={'Select options'}
            classNames={{ selectTrigger: selectTriggerClass }}
          />
        </div>
        {!showModuleFilter && (
          <Link
            href="logs-viewer"
            className="self-end pt-2 text-sm text-muted-foreground hover:dark:text-white hover:underline hover:text-black"
          >
            More filters
          </Link>
        )}
        {showModuleFilter && (
          <MultiOptionsField
            label={'Module'}
            fieldName={'module'}
            options={moduleOptions}
            placeholder={'Select options'}
            className="mt-2 space-y-1"
            classNames={{ selectTrigger: selectTriggerClass }}
          />
        )}
      </form>
    </Form>
  );
}

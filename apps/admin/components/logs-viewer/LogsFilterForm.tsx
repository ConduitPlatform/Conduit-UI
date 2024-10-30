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
import { DatePickerField } from '@/components/ui/form-inputs/DatePickerField';
import { cn } from '@/lib/utils';

const limitOptions = ['100', '500', '1000', '5000'];

const timeOptions = [
  'Last 10 minutes',
  'Last 30 minutes',
  'Last 1 hour',
  'Last 24 hours',
  'Today',
];

const levelsOptions = [
  { label: 'Info', value: 'info' },
  { label: 'Error', value: 'error' },
  { label: 'Warning', value: 'warning' },
  { label: 'Debug', value: 'debug' },
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
    defaultValues: {
      limit: 0,
      level: '',
      module: '',
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  const selectTriggerClass = 'bg-background mt-0';
  const formItemClass = 'space-y-1';

  return (
    <Form {...form}>
      <form
        className={
          'flex flex-col px-3 pt-3 pb-4 border mx-5 mb-5 rounded-md border-input bg-secondary'
        }
        {...restProps}
      >
        {showModuleFilter && (
          <div className="grid grid-cols-2 gap-3 mb-2">
            <MultiOptionsField
              label={'Level'}
              fieldName={'level'}
              options={levelsOptions}
              placeholder={'Select options'}
              classNames={{
                selectTrigger: cn('capitalize', selectTriggerClass),
              }}
              className={formItemClass}
            />
            <MultiOptionsField
              label={'Module'}
              fieldName={'module'}
              options={moduleOptions}
              placeholder={'Select options'}
              className={formItemClass}
              classNames={{ selectTrigger: selectTriggerClass }}
            />
          </div>
        )}
        <div
          className={cn(
            'grid grid-cols-3 gap-4',
            showModuleFilter && 'grid-cols-2'
          )}
        >
          {showModuleFilter ? (
            <div className="flex gap-3">
              <DatePickerField
                fieldName="startDate"
                label={'Start date'}
                className={formItemClass}
                classNames={{ trigger: 'min-w-32' }}
                showIcon
              />
              <DatePickerField
                fieldName="endDate"
                label={'End date'}
                className={formItemClass}
                classNames={{ trigger: 'min-w-32' }}
                showIcon
              />
            </div>
          ) : (
            <SelectField
              label={'Time'}
              options={timeOptions}
              fieldName={'timeRange'}
              placeholder={'Select one option'}
              classNames={{ selectTrigger: selectTriggerClass }}
              className={formItemClass}
            />
          )}
          <SelectField
            label={'Limit'}
            options={limitOptions}
            fieldName={'limit'}
            placeholder={'Select one option'}
            classNames={{ selectTrigger: selectTriggerClass }}
            className={formItemClass}
          />
          {!showModuleFilter && (
            <MultiOptionsField
              label={'Level'}
              fieldName={'level'}
              options={levelsOptions}
              placeholder={'Select options'}
              classNames={{ selectTrigger: selectTriggerClass }}
              className={formItemClass}
            />
          )}
        </div>
        {!showModuleFilter && (
          <Link
            href="/logs-viewer"
            className="self-end mt-2 text-sm text-muted-foreground hover:dark:text-white hover:underline hover:text-primary"
          >
            More filters
          </Link>
        )}
      </form>
    </Form>
  );
}

'use client';
import { Form } from '@/components/ui/form';
import MultiOptionsField from '@/components/ui/form-inputs/MultiOptionsField';
import SelectField from '@/components/ui/form-inputs/SelectField';
import SwitchField from '@/components/ui/form-inputs/SwitchField';
import {
  logsFormSchema,
  logsFormSchemaT,
} from '@/lib/models/logs-viewer/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePathname } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { SearchInput } from '@/components/ui/form-inputs/SearchInput';

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

type LogsFormProps = {
  moduleOptions?: Option[];
};
export default function LogsFilters({ moduleOptions }: LogsFormProps) {
  const pathname = usePathname();
  const showModuleFilter = pathname === '/logs-viewer';

  const form = useForm<logsFormSchemaT>({
    resolver: zodResolver(logsFormSchema),
    defaultValues: {},
  });

  return (
    <Form {...form}>
      <form>
        <div className="grid items-center py-3.5 justify-between grid-cols-[80px,repeat(3,1fr)] gap-5">
          <SwitchField label={'Live'} fieldName={'live'} className="mt-7" />
          <MultiOptionsField
            label={'Level'}
            fieldName={'level'}
            options={levelsOptions}
            placeholder={'Select options'}
          />
          <SelectField
            label={'Time range'}
            fieldName={'time_range'}
            placeholder={'Select one option'}
            options={timeOptions}
          />
          <SelectField
            label={'Limit'}
            fieldName={'limit'}
            options={limitOptions}
            placeholder={'Select one option'}
          />
        </div>
        {showModuleFilter && (
          <div className="grid mb-4 grid-cols">
            <MultiOptionsField
              label={'Module'}
              fieldName={'module'}
              options={moduleOptions}
              placeholder={'Select options'}
            />
          </div>
        )}
        <SearchInput className="w-1/2 ml-auto" />
      </form>
    </Form>
  );
}

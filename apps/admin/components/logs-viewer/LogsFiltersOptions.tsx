import { generateMultiSelectOptions } from '@/lib/models/logs-viewer/utils';
import MultiOptionsField from '@/components/ui/form-inputs/MultiOptionsField';
import SelectField from '@/components/ui/form-inputs/SelectField';
import Link from 'next/link';
import {
  knownModuleNames,
  limitOptions,
  timeOptions,
} from '@/lib/models/logs-viewer/constants';
import { cn } from '@/lib/utils';
import { DatePickerField } from '@/components/ui/form-inputs/DatePickerField';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface LogsFiltersOptionsProps
  extends React.FormHTMLAttributes<HTMLDivElement> {
  levels: string[];
  type?: 'drawer' | 'viewer';
  logsFilters: {
    selectedLevels: string[];
    selectedLimit: string | undefined;
    selectedModules: string[] | undefined;
    selectedTime: string | undefined;
    selectedStartDate: Date | undefined;
    selectedEndDate: Date | undefined;
  };
  setLogsFilters: Dispatch<
    SetStateAction<{
      selectedLevels: string[];
      selectedLimit: string | undefined;
      selectedModules: string[];
      selectedTime: string | undefined;
      selectedStartDate: Date | undefined;
      selectedEndDate: Date | undefined;
    }>
  >;
  className?: string;
  disabledPopover?: boolean;
}

export default function LogsFiltersOptions({
  type = 'drawer',
  levels,
  logsFilters,
  setLogsFilters,
  disabledPopover = false,
  className,
  ...restProps
}: LogsFiltersOptionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    selectedLevels,
    selectedLimit,
    selectedModules,
    selectedTime,
    selectedStartDate,
    selectedEndDate,
  } = logsFilters;

  const wrapperClass =
    'flex flex-col px-3 pt-3 pb-4 mx-5 mb-5 border rounded-md border-input bg-secondary';
  const selectTriggerClass = 'bg-background mt-0';
  const formItemClass = 'space-y-1';

  const levelOptions = generateMultiSelectOptions(levels);
  const moduleOptions = generateMultiSelectOptions(knownModuleNames);

  const updateURLParams = () => {
    const params = new URLSearchParams();
    if (selectedTime) params.set('time', selectedTime);
    if (selectedLimit) params.set('limit', selectedLimit);
    if (selectedLevels && selectedLevels.length > 0)
      params.set('levels', selectedLevels.join(','));
    if (selectedModules && selectedModules.length > 0)
      params.set('modules', selectedModules.join(','));
    if (selectedStartDate)
      params.set('startDate', selectedStartDate.toISOString());
    if (selectedEndDate) params.set('endDate', selectedEndDate.toISOString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    updateURLParams();
  }, [
    selectedTime,
    selectedLimit,
    selectedLevels,
    selectedModules,
    selectedStartDate,
    selectedEndDate,
  ]);

  const renderDrawerFilters = (
    <div className={cn(wrapperClass, className)} {...restProps}>
      <div className="grid grid-cols-3 gap-4">
        <SelectField
          label="Time"
          value={selectedTime}
          disabled={disabledPopover}
          onValueChange={newValue =>
            setLogsFilters(prevState => ({
              ...prevState,
              selectedTime: newValue,
            }))
          }
          options={timeOptions}
          classNames={{ selectTrigger: selectTriggerClass }}
          className={formItemClass}
        />
        <SelectField
          label="Limit"
          value={selectedLimit}
          onValueChange={newValue =>
            setLogsFilters(prevState => ({
              ...prevState,
              selectedLimit: newValue,
            }))
          }
          options={limitOptions}
          classNames={{ selectTrigger: selectTriggerClass }}
          className={formItemClass}
        />
        <MultiOptionsField
          label="Level"
          options={levelOptions}
          selectedOptions={selectedLevels}
          setSelectedOptions={newValue =>
            setLogsFilters(prevState => ({
              ...prevState,
              selectedLevels: newValue(prevState.selectedLevels),
            }))
          }
          placeholder="Select options"
          classNames={{ selectTrigger: selectTriggerClass }}
          className={formItemClass}
        />
      </div>
      <Link
        href={`logs-viewer/?${searchParams}`}
        className="self-end mt-2 text-sm text-muted-foreground hover:dark:text-white hover:underline hover:text-primary"
      >
        More filters
      </Link>
    </div>
  );

  const renderViewerFilters = (
    <div className={cn(wrapperClass, className)} {...restProps}>
      <div className="grid grid-cols-2 gap-3 mb-2">
        <MultiOptionsField
          label="Level"
          options={levelOptions}
          selectedOptions={selectedLevels}
          setSelectedOptions={newValue =>
            setLogsFilters(prevState => ({
              ...prevState,
              selectedLevels: newValue(prevState.selectedLevels),
            }))
          }
          classNames={{
            selectTrigger: cn('capitalize', selectTriggerClass),
          }}
          className={formItemClass}
        />
        <MultiOptionsField
          label="Module"
          options={moduleOptions}
          selectedOptions={selectedModules}
          setSelectedOptions={newValue =>
            setLogsFilters(prevState => ({
              ...prevState,
              selectedModules: newValue(prevState.selectedModules),
            }))
          }
          className={formItemClass}
          classNames={{ selectTrigger: selectTriggerClass }}
        />
      </div>
      <div className={cn('grid grid-cols-2 gap-4')}>
        <div className="flex gap-3">
          <DatePickerField
            label="Start date"
            disabledPopover={disabledPopover}
            disabled
            selectedDate={selectedStartDate}
            setSelectedDate={(newValue: Date | undefined) =>
              setLogsFilters(prevState => ({
                ...prevState,
                selectedStartDate: newValue,
              }))
            }
            className={formItemClass}
            showIcon
          />
          <DatePickerField
            label="End date"
            disabledDates={{ after: new Date(), before: new Date() }}
            disabledPopover={disabledPopover}
            selectedDate={selectedEndDate}
            setSelectedDate={(newValue: Date | undefined) =>
              setLogsFilters(prevState => ({
                ...prevState,
                selectedEndDate: newValue,
              }))
            }
            className={formItemClass}
            showIcon
          />
        </div>
        <SelectField
          label="Limit"
          placeholder={undefined}
          options={limitOptions}
          value={selectedLimit}
          onValueChange={newValue =>
            setLogsFilters(prevState => ({
              ...prevState,
              selectedLimit: newValue,
            }))
          }
          classNames={{ selectTrigger: selectTriggerClass }}
          className={formItemClass}
        />
      </div>
    </div>
  );

  return type === 'drawer' ? renderDrawerFilters : renderViewerFilters;
}

'use client';

import { generateMultiSelectOptions } from '@/lib/models/logs-viewer/utils';
import MultiSelectField from '@/components/ui/form-inputs/MultiSelectField';
import SelectField from '@/components/ui/form-inputs/SelectField';
import Link from 'next/link';
import { limitOptions, timeOptions } from '@/lib/models/logs-viewer/constants';
import { cn } from '@/lib/utils';
import { DatePickerField } from '@/components/ui/form-inputs/DatePickerField';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LogsFiltersState } from '@/lib/models/logs-viewer';

interface LogsFiltersOptionsProps {
  levels: string[];
  modules: string[];
  type?: 'drawer' | 'viewer';
  logsFilters: LogsFiltersState;
  setLogsFilters: Dispatch<SetStateAction<LogsFiltersState>>;
  className?: string;
  disabledPopover?: boolean;
}

export default function LogsFiltersOptions({
  type = 'drawer',
  levels,
  modules,
  logsFilters,
  setLogsFilters,
  disabledPopover = false,
  className,
}: LogsFiltersOptionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    selectedLevels,
    selectedLimit,
    selectedModules,
    selectedTime,
    selectedStartDate,
    selectedEndDate,
    searchTerm,
  } = logsFilters;

  const wrapperClass =
    'mx-4 mb-3 flex flex-col rounded-md border border-border bg-surface-2 px-3 pt-3 pb-4';
  const selectTriggerClass = 'mt-0 bg-surface-1';
  const formItemClass = 'flex flex-col gap-1';

  const levelOptions = generateMultiSelectOptions(levels);
  const moduleOptions = generateMultiSelectOptions(modules);

  const moreFiltersParams = new URLSearchParams();
  if (selectedTime) moreFiltersParams.set('time', selectedTime);
  if (selectedLimit) moreFiltersParams.set('limit', selectedLimit);
  if (selectedLevels.length > 0)
    moreFiltersParams.set('levels', selectedLevels.join(','));
  if (searchTerm) moreFiltersParams.set('search', searchTerm);
  const moreFiltersQuery = moreFiltersParams.toString();
  const moreFiltersHref = moreFiltersQuery
    ? `/logs-viewer?${moreFiltersQuery}`
    : '/logs-viewer';

  useEffect(() => {
    if (type !== 'viewer') return;
    const params = new URLSearchParams();
    if (selectedTime) params.set('time', selectedTime);
    if (selectedLimit) params.set('limit', selectedLimit);
    if (selectedLevels.length > 0)
      params.set('levels', selectedLevels.join(','));
    if (selectedModules.length > 0)
      params.set('modules', selectedModules.join(','));
    if (selectedStartDate)
      params.set('startDate', selectedStartDate.toISOString());
    if (selectedEndDate) params.set('endDate', selectedEndDate.toISOString());
    if (searchTerm) params.set('search', searchTerm);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [
    pathname,
    router,
    searchTerm,
    selectedEndDate,
    selectedLevels,
    selectedLimit,
    selectedModules,
    selectedStartDate,
    selectedTime,
    type,
  ]);

  const renderDrawerFilters = (
    <div className={cn(wrapperClass, className)}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
        <MultiSelectField
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
        href={moreFiltersHref}
        className="mt-2 self-end text-sm text-muted-foreground underline-offset-3 hover:text-primary hover:underline"
      >
        More filters
      </Link>
    </div>
  );

  const renderViewerFilters = (
    <div className={cn(wrapperClass, className)}>
      <div className="mb-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MultiSelectField
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
        <MultiSelectField
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-3 sm:flex-row">
          <DatePickerField
            label="Start date"
            disabledPopover={disabledPopover}
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
            disabledDates={{ after: new Date() }}
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

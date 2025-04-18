'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { DatePickerField } from '@/components/ui/form-inputs/DatePickerField';
import { useUserPicker } from '@/components/helpers/UserPicker/UserPicker';

interface EmailFiltersProps {
  initialFilters: {
    messageId?: string;
    templateId?: string;
    receiver?: string;
    sender?: string;
    cc?: string;
    replyTo?: string;
    startDate?: string;
    endDate?: string;
  };
  onFilterChange: (filters: Record<string, string | undefined>) => void;
}

export function EmailFilters({
  initialFilters,
  onFilterChange,
}: Readonly<EmailFiltersProps>) {
  const [filters, setFilters] = useState(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState<
    Array<{ key: string; value: string }>
  >([]);
  const { openPicker } = useUserPicker();
  // Initialize filters from props
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Update active filters
  useEffect(() => {
    const active: Array<{ key: string; value: string }> = [];

    Object.entries(initialFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        let displayKey = key.charAt(0).toUpperCase() + key.slice(1);
        let displayValue = value;

        // Format dates for better display
        if (key === 'startDate' || key === 'endDate') {
          displayValue = format(new Date(value), 'MMM d, yyyy');
          displayKey = key === 'startDate' ? 'From' : 'To';
        }

        active.push({ key: displayKey, value: displayValue });
      }
    });

    setActiveFilters(active);
  }, [initialFilters]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (
    date: Date | undefined,
    field: 'startDate' | 'endDate'
  ) => {
    setFilters(prev => ({
      ...prev,
      [field]: date ? format(date, 'yyyy-MM-dd') : undefined,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      messageId: undefined,
      templateId: undefined,
      receiver: undefined,
      sender: undefined,
      cc: undefined,
      replyTo: undefined,
      startDate: undefined,
      endDate: undefined,
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const openUserModal = (type: 'receiver' | 'sender' | 'cc' | 'replyTo') => {
    openPicker(
      selectedUsers => {
        const emails = selectedUsers
          .filter(user => user.email)
          .map(user => user.email);
        setFilters(prev => ({
          ...prev,
          [type]: type === 'cc' ? emails : emails?.[0],
        }));
      },
      {
        multiple: type === 'cc',
        title: 'Select Users',
        description: 'Select users to filter by email',
      }
    );
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const removeFilter = (key: string) => {
    // Convert display key back to original key if needed
    let originalKey = key.toLowerCase();
    if (key === 'From') originalKey = 'startDate';
    if (key === 'To') originalKey = 'endDate';

    const updatedFilters = { ...filters };
    updatedFilters[originalKey as keyof typeof filters] = undefined;

    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  return (
    <div className="bg-background border-input border-2 rounded-lg shadow">
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold">Filter Emails</h2>
          {activeFilters.length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-6 h-6 text-sm font-medium rounded-full bg-primary text-primary-foreground">
              {activeFilters.length}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleExpanded}
          aria-expanded={isExpanded}
        >
          <Filter className="h-4 w-4 mr-2" />
          {isExpanded ? 'Hide Filters' : 'Show Filters'}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 ml-1" />
          ) : (
            <ChevronDown className="h-4 w-4 ml-1" />
          )}
        </Button>
      </div>

      {/* Active filters display when collapsed */}
      {!isExpanded && activeFilters.length > 0 && (
        <div className="px-4 pb-4 flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 px-3 py-1"
            >
              <span className="font-medium">{filter.key}:</span> {filter.value}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => removeFilter(filter.key)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {activeFilters.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs"
            >
              Clear All
            </Button>
          )}
        </div>
      )}

      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="p-4 pt-0 border-t">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div className="space-y-2">
              <Label htmlFor="messageId">Message ID</Label>
              <Input
                id="messageId"
                name="messageId"
                value={filters.messageId || ''}
                onChange={handleInputChange}
                placeholder="Filter by message ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateId">Template ID</Label>
              <Input
                id="templateId"
                name="templateId"
                value={filters.templateId || ''}
                onChange={handleInputChange}
                placeholder="Filter by template ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiver">Receiver</Label>
              <div className="flex">
                <Input
                  id="receiver"
                  name="receiver"
                  value={filters.receiver || ''}
                  onChange={handleInputChange}
                  placeholder="Filter by receiver email"
                  className="rounded-r-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-l-none border-l-0"
                  onClick={() => openUserModal('receiver')}
                >
                  Select
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sender">Sender</Label>
              <div className="flex">
                <Input
                  id="sender"
                  name="sender"
                  value={filters.sender || ''}
                  onChange={handleInputChange}
                  placeholder="Filter by sender email"
                  className="rounded-r-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-l-none border-l-0"
                  onClick={() => openUserModal('sender')}
                >
                  Select
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cc">CC</Label>
              <div className="flex">
                <Input
                  id="cc"
                  name="cc"
                  value={filters.cc || ''}
                  onChange={handleInputChange}
                  placeholder="Filter by CC emails (comma separated)"
                  className="rounded-r-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-l-none border-l-0"
                  onClick={() => openUserModal('cc')}
                >
                  Select
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="replyTo">Reply To</Label>
              <div className="flex">
                <Input
                  id="replyTo"
                  name="replyTo"
                  value={filters.replyTo || ''}
                  onChange={handleInputChange}
                  placeholder="Filter by reply-to email"
                  className="rounded-r-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-l-none border-l-0"
                  onClick={() => openUserModal('replyTo')}
                >
                  Select
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <DatePickerField
                label={'Start Date'}
                selectedDate={
                  filters.startDate ? new Date(filters.startDate) : undefined
                }
                setSelectedDate={date => handleDateChange(date, 'startDate')}
                showIcon={true}
                initialFocus
              />
            </div>

            <div className="space-y-2">
              <DatePickerField
                label={'End Date'}
                showIcon
                selectedDate={
                  filters.endDate ? new Date(filters.endDate) : undefined
                }
                setSelectedDate={date => handleDateChange(date, 'endDate')}
                initialFocus
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset Filters
              </Button>
              <Button type="submit">Apply Filters</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

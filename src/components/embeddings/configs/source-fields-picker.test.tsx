import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { SourceFieldsPicker } from './source-fields-picker';

function PickerHarness({ hasSchema }: { hasSchema: boolean }) {
  const form = useForm({
    defaultValues: { sourceFields: [] as string[] },
  });
  return (
    <FormProvider {...form}>
      <SourceFieldsPicker choices={[]} hasSchema={hasSchema} />
    </FormProvider>
  );
}

describe('SourceFieldsPicker', () => {
  it('asks the operator to select a schema before listing fields', () => {
    render(<PickerHarness hasSchema={false} />);
    expect(
      screen.getByText('Select a schema to see eligible fields.')
    ).toBeInTheDocument();
  });

  it('explains when a selected schema has no eligible fields', () => {
    render(<PickerHarness hasSchema={true} />);
    expect(
      screen.getByText('No eligible string fields on this schema.')
    ).toBeInTheDocument();
  });
});

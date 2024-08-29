'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { dndVariants, DropzoneInput } from '@/components/ui/dnd';
import { VariantProps } from 'class-variance-authority';

type DndProps = {
  fieldName: string;
} & React.ComponentProps<typeof DropzoneInput> &
  VariantProps<typeof dndVariants>;

export const DragAndDropField: React.FC<DndProps> = ({
  fieldName,
  ...props
}) => {
  const formRef = useFormContext();
  return (
    <FormField
      control={formRef.control}
      name={fieldName}
      render={({ field: { onChange } }) => (
        <FormItem className="space-y-1.5">
          <FormControl>
            <DropzoneInput
              onChange={e => {
                onChange(e.target.files);
              }}
              {...props}
            ></DropzoneInput>
          </FormControl>
          <FormMessage className="text-error" />
        </FormItem>
      )}
    />
  );
};

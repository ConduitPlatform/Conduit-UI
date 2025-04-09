'use client';

import React, { ChangeEventHandler } from 'react';
import Dropzone, { useDropzone } from 'react-dropzone';
import { cva, VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { UploadCloudIcon } from 'lucide-react';

export const dndVariants = cva(
  'flex items-center w-full rounded-3xl cursor-pointer',
  {
    variants: {
      variant: {
        colored: 'bg-royal-blue-50 [&>div]:border-contrast-border',
      },
    },
  }
);

type DropzoneProps = {
  variant?: string;
  compressed?: boolean;
  description?: string;
  className?: string;
  showIcon?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
} & React.ComponentProps<typeof Dropzone> &
  VariantProps<typeof dndVariants>;

export const DropzoneInput: React.FC<DropzoneProps> = ({
  className,
  variant,
  compressed,
  description,
  showIcon,
  onChange,
  ...props
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone(props);
  return (
    <div {...getRootProps()} className={className}>
      <input {...getInputProps({ onChange })} />
      {compressed ? (
        <div className="flex space-x-3 hover:cursor-pointer">
          <p className="text-sm">{description || 'Drag and drop files'}</p>
          <UploadCloudIcon width={20} height={20} />
        </div>
      ) : (
        <div className={cn(dndVariants({ variant }))}>
          <div className="rounded-3xl h-60 flex flex-col justify-center w-full border-2 border-dashed text-center p-10 text-base font-light leading-6">
            {isDragActive ? (
              <p>Drag and Drop you files here...</p>
            ) : (
              <div className="flex flex-col items-center justify-between space-y-4">
                {showIcon && (
                  <div className="flex justify-center w-full">
                    <div className="rounded-full justify-center flex items-center border-8 bg-border w-[58px] h-[58px] p-2">
                      <UploadCloudIcon width={20} height={20} />
                    </div>
                  </div>
                )}
                <p>
                  Click to open file explorer or drag and drop files here...
                </p>
                {props.accept && (
                  <p>
                    Supported files
                    {Object.keys(props.accept).join(', ')}{' '}
                    {props.maxSize && `Max ${props.maxSize} MB size`}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

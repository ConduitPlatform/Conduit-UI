'use client';

import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Clipboard, SquareArrowOutUpRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { z } from 'zod';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ModelDetails } from '@/components/database/model';
import { useToast } from '@/lib/hooks/use-toast';
import { DocumentUpdateForm } from '@/components/database/docUpdate';
import TooltipHelper from '@/components/ui/helpers/TooltipHelper';
import moment from 'moment';

const uuid = z.string().regex(/^[0-9a-f]{24}$/);
const date = z.string().datetime();

export const useColumns = (data: any, model: string) => {
  const { toast } = useToast();
  return useMemo<ColumnDef<any, any>[]>(
    () =>
      Object.keys(data[0]).map(key => {
        return {
          Header: key,
          accessorKey: key,
          cell: ({ row, cell }) => {
            if (key === '_id' || key === '__v') {
              return <div>{cell.getValue()}</div>;
            }
            if (uuid.safeParse(cell.getValue()).success && key !== '_id') {
              return (
                <Sheet>
                  <div className="flex items-center space-x-1 group">
                    <SheetTrigger asChild>
                      <Button variant="link">
                        <Badge variant="secondary">
                          {key}:{cell.getValue()}
                        </Badge>
                      </Button>
                    </SheetTrigger>
                    <Clipboard
                      className={
                        'w-4 h-4 invisible group-hover:visible cursor-pointer'
                      }
                      onClick={() => {
                        toast({
                          description: 'Copied to clipboard',
                        });
                        navigator.clipboard.writeText(
                          cell.getValue() as string
                        );
                      }}
                    />
                  </div>
                  <SheetContent side="right" className="sm:max-w-3xl">
                    <SheetTitle>Model Details</SheetTitle>
                    <ModelDetails
                      id={cell.getValue()}
                      modelName={key.charAt(0).toUpperCase() + key.slice(1)}
                    />
                  </SheetContent>
                </Sheet>
              );
            }
            if (date.safeParse(cell.getValue()).success) {
              return (
                <TooltipHelper content={cell.getValue()}>
                  <span className="w-80">
                    {moment(cell.getValue()).format('YYYY-MM-DD')}
                  </span>
                </TooltipHelper>
              );
            }
            if (
              typeof cell.getValue() === 'object' ||
              typeof cell.getValue() === 'string' ||
              typeof cell.getValue() === 'number' ||
              typeof cell.getValue() === 'boolean'
            ) {
              return (
                <div className="flex justify-between group">
                  <div className="w-60 truncate">
                    {JSON.stringify(cell.getValue())}
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="invisible group-hover:visible cursor-pointer">
                        <SquareArrowOutUpRight className="w-4 h-4 text-primary" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="min-w-fit max-w-4xl">
                      <DialogHeader>
                        <DialogTitle
                          className={'flex flex-row justify-between mt-5'}
                        >
                          <span>Edit Document</span>
                        </DialogTitle>
                        <DialogDescription>On column {key}</DialogDescription>
                      </DialogHeader>
                      <DocumentUpdateForm
                        row={row}
                        fieldName={key}
                        model={model}
                        value={JSON.stringify(cell.getValue(), null, 2)}
                        label={''}
                        placeholder={''}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              );
            }
            return (
              cell.getValue() ?? <span className="text-secondary">NULL</span>
            );
          },
        };
      }),
    [data]
  );
};

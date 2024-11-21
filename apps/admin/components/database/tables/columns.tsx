'use client';

import { useMemo } from 'react';
import { CellContext, ColumnDef } from '@tanstack/react-table';

export const columns = (data: any) => {
  return useMemo<ColumnDef<any, any>[]>(
    () =>
      Object.keys(data[0]).map(key => {
        return {
          Header: key,
          accessorKey: key,
          cell: (cell: CellContext<any, any>) => {
            if (typeof cell.getValue() === 'object') {
              return (
                <div className="w-60 truncate">
                  {JSON.stringify(cell.getValue())}
                </div>
              );
            }
            return (
              <div className="w-60 truncate">
                {cell.getValue() ?? (
                  <span className="text-secondary">NULL</span>
                )}
              </div>
            );
          },
        };
      }),
    [data]
  );
};

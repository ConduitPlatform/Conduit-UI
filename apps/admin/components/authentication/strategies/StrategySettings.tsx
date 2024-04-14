'use client';

import React from 'react';
import { StrategyInterface } from '@/components/authentication/strategies/interface/Strategy.interface';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { patchAuthenticationSettings } from '@/lib/api/authentication';
import { useRouter } from 'next/navigation';

export interface StrategySettingsProps {
  strategy: StrategyInterface;
  children?: React.ReactNode;

}

export const StrategySettings: React.FC<StrategySettingsProps> = ({ strategy, children }) => {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const onSubmit = (data: any) => {
    debugger;
    patchAuthenticationSettings({ [strategy.key as string]: data })
      .then(() => {
        router.refresh();
        setOpen(false);
      });

  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={'flex flex-row justify-between mt-5'}>{strategy.name} settings configuration<a
            href={strategy.documentation}
            className={'text-sm underline text-accent-foreground'}
            target='_blank'>Documentation</a></DialogTitle>
          <DialogDescription>
            <hr className={'my-2'} />
            {strategy.form ?
              <strategy.form name={strategy.name} data={strategy.data} onSubmit={onSubmit} onCancel={() => {
                setOpen(false);
              }} /> : 'No settings available'}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

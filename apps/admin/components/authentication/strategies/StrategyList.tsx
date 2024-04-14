'use client';

import React from 'react';
import { StrategyInterface } from '@/components/authentication/strategies/interface/Strategy.interface';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LoaderIcon } from 'lucide-react';
import { patchAuthenticationSettings } from '@/lib/api/authentication';
import { useRouter } from 'next/navigation';

export interface StrategySettingsProps {
  strategies: StrategyInterface[];
  children?: React.ReactNode;

}

export const StrategyList: React.FC<StrategySettingsProps> = ({ strategies, children }) => {
  const [open, setOpen] = React.useState(false);
  const [selectedStrategy, setSelectedStrategy] = React.useState<StrategyInterface | null>(null);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const activateStrategy = async () => {
    setLoading(true);
    patchAuthenticationSettings({ [selectedStrategy?.key as string]: { enabled: true } }).then(() => {
      setLoading(false);
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Available Strategies</DialogTitle>
          <DialogDescription className={'flex flex-col gap-y-2 h-96 overflow-y-scroll'}>
            {strategies.map((strategy) => {
              return (
                <Card className={cn('px-0 cursor-pointer', selectedStrategy?.name === strategy.name ? 'border-primary' : '')}
                      key={`${strategy.name}`} onClick={() => setSelectedStrategy(strategy)}>
                  <CardHeader>
                    <CardTitle className={'flex flex-row justify-between'}><p>{strategy.name}</p>
                    </CardTitle>
                    <CardDescription>{strategy.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button disabled={!selectedStrategy || loading} onClick={activateStrategy} className={'gap-x-2'}>
            Add Strategy
            {loading && <LoaderIcon className={'animate-spin w-4 h-4'} />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

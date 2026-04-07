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
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CheckIcon, LoaderIcon, LucideX } from 'lucide-react';
import { ErrorPre } from '@/components/ui/error-pre';
import { patchAuthenticationSettingsMerged } from '@/lib/api/authentication';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/hooks/use-toast';

export interface StrategySettingsProps {
  strategies: StrategyInterface[];
  children?: React.ReactNode;
}

export const StrategyList: React.FC<StrategySettingsProps> = ({
  strategies,
  children,
}) => {
  const [open, setOpen] = React.useState(false);
  const [selectedStrategy, setSelectedStrategy] =
    React.useState<StrategyInterface | null>(null);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const activateStrategy = async () => {
    if (!selectedStrategy) return;
    setLoading(true);
    try {
      await patchAuthenticationSettingsMerged({
        [selectedStrategy.key as string]: { enabled: true },
      });
      toast({
        title: 'Strategy',
        description: (
          <div className={'flex flex-row items-center space-x-2.5'}>
            <CheckIcon className={'w-8 h-8'} />
            <p className="text-sm text-foreground">
              Strategy added successfully.
            </p>
          </div>
        ),
      });
      setOpen(false);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: 'Strategy',
        description: (
          <div className={'flex flex-col'}>
            <div className={'flex flex-row text-destructive items-center'}>
              <LucideX className={'w-8 h-8'} />
              <p className="text-sm">Failed to add strategy:</p>
            </div>
            <ErrorPre>{message}</ErrorPre>
          </div>
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Available Strategies</DialogTitle>
          <DialogDescription
            className={'flex flex-col gap-y-2 h-96 overflow-y-scroll'}
          >
            {strategies.map(strategy => {
              return (
                <Card
                  className={cn(
                    'px-0 cursor-pointer',
                    selectedStrategy?.name === strategy.name
                      ? 'border-primary'
                      : ''
                  )}
                  key={`${strategy.name}`}
                  onClick={() => setSelectedStrategy(strategy)}
                >
                  <CardHeader>
                    <CardTitle className={'flex flex-row justify-between'}>
                      <span>{strategy.name}</span>
                    </CardTitle>
                    <CardDescription>{strategy.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            disabled={!selectedStrategy || loading}
            onClick={activateStrategy}
            className={'gap-x-2'}
          >
            Add Strategy
            {loading && <LoaderIcon className={'animate-spin w-4 h-4'} />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

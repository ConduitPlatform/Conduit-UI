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
import { patchAuthenticationSettingsMerged } from '@/lib/api/authentication';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/hooks/use-toast';
import { CheckIcon, LucideX } from 'lucide-react';

export interface StrategySettingsProps {
  strategy: StrategyInterface;
  children?: React.ReactNode;
}

export const StrategySettings: React.FC<StrategySettingsProps> = ({
  strategy,
  children,
}) => {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const onSubmit = async (data: unknown) => {
    try {
      await patchAuthenticationSettingsMerged({
        [strategy.key as string]: data as Record<string, unknown>,
      });
      toast({
        title: strategy.name,
        description: (
          <div className={'flex flex-row items-center space-x-2.5'}>
            <CheckIcon className={'w-8 h-8'} />
            <p className="text-sm text-foreground">
              Settings saved successfully.
            </p>
          </div>
        ),
      });
      router.refresh();
      setOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: strategy.name,
        description: (
          <div className={'flex flex-col'}>
            <div className={'flex flex-row text-destructive items-center'}>
              <LucideX className={'w-8 h-8'} />
              <p className="text-sm">Failed to save settings:</p>
            </div>
            <pre className="mt-2 w-[340px] rounded-md bg-secondary p-4 text-destructive">
              <code className="text-sm text-foreground">{message}</code>
            </pre>
          </div>
        ),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={'flex flex-row justify-between mt-5'}>
            {strategy.name} settings configuration
            <a
              href={strategy.documentation}
              className={'text-sm underline text-accent-foreground'}
              target="_blank"
            >
              Documentation
            </a>
          </DialogTitle>
          <DialogDescription>
            <hr className={'my-2'} />
            {strategy.form ? (
              <strategy.form
                name={strategy.name}
                data={strategy.data}
                onSubmit={onSubmit}
                onCancel={() => {
                  setOpen(false);
                }}
              />
            ) : (
              'No settings available'
            )}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

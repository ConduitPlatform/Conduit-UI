'use client';
import { useEffect, useState } from 'react';
import { toast } from '@/lib/hooks/use-toast';
import { CheckIcon, LoaderIcon, LucideX } from 'lucide-react';
import { useAlerts } from '@/components/providers/AlertProvider';
import { Switch } from '@/components/ui/switch';
import { FunctionsSettings } from '@/lib/models/Functions';
import { patchFunctionsSettings } from '@/lib/api/functions';

interface Props {
  data: FunctionsSettings;
}

export const Settings = ({ data }: Props) => {
  const [functionsModule, setFunctionsModule] = useState<boolean>(false);
  const { addAlert } = useAlerts();

  useEffect(() => {
    if (data) {
      setFunctionsModule(data.active);
    }
  }, [data]);
  const handleSwitchChange = () => {
    addAlert({
      title: 'Functions Module',
      description: `Are you sure you want to ${functionsModule ? 'disable' : 'enable'} functions module?`,
      cancelText: 'Cancel',
      actionText: 'Proceed',
      onDecision: cancel => {
        if (!cancel) {
          const { id, dismiss } = toast({
            title: 'Functions',
            description: (
              <div className={'flex flex-row items-center space-x-2.5'}>
                <LoaderIcon className={'w-8 h-8 animate-spin'} />
                <p className="text-sm text-foreground">
                  Updating Functions Settings...
                </p>
              </div>
            ),
          });
          const updatedSettings = {
            active: !functionsModule,
          };
          setFunctionsModule(!functionsModule);
          patchFunctionsSettings(updatedSettings)
            .then(res => {
              dismiss();
              toast({
                title: 'Functions',
                description: (
                  <div className={'flex flex-row items-center space-x-2.5'}>
                    <CheckIcon className={'w-8 h-8'} />
                    <p className="text-sm text-foreground">
                      Functions Settings Updated!
                    </p>
                  </div>
                ),
              });
            })
            .catch(err => {
              dismiss();
              setFunctionsModule(data.active);
              toast({
                title: 'Functions',
                description: (
                  <div className={'flex flex-col'}>
                    <div
                      className={'flex flex-row text-destructive items-center'}
                    >
                      <LucideX className={'w-8 h-8'} />
                      <p className="text-sm">Failed to update with:</p>
                    </div>
                    <pre className="mt-2 w-[340px] rounded-md bg-secondary p-4 text-destructive">
                      <code className="text-sm text-foreground">
                        {err.message}
                      </code>
                    </pre>
                  </div>
                ),
              });
            });
        }
      },
    });
  };

  return (
    <div className={'container mx-auto py-10 main-scrollbar'}>
      <div className={'flex flex-col gap-6'}>
        <div className="space-y-0.5">
          <div className={'flex gap-2 items-center'}>
            <p className="text-2xl font-medium">Functions Module</p>
            <Switch
              checked={functionsModule}
              onCheckedChange={() => {
                handleSwitchChange();
              }}
            />
          </div>
          <div className={'pr-2'}>
            <p className={'text-xs text-[#94A3B8]'}>
              To see more information regarding the Functions config, visit our
              docs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

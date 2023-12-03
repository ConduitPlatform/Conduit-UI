'use client';
import { useEffect, useState } from 'react';
import { toast } from '@/lib/hooks/use-toast';
import { CheckIcon, LoaderIcon, LucideX } from 'lucide-react';
import { useAlerts } from '@/components/providers/AlertProvider';
import { Switch } from '@/components/ui/switch';
import { AuthorizationSettings } from '@/lib/models/Authorization';
import { patchAuthorizationSettings } from '@/lib/api/authorization';

interface Props {
  data: AuthorizationSettings;
}

export const Settings = ({ data }: Props) => {
  const [authorizationModule, setAuthorizationModule] = useState<boolean>(false);
  const { addAlert } = useAlerts();

  useEffect(() => {
    if (data) {
      setAuthorizationModule(data.active);
    }
  }, [data]);
  const handleSwitchChange = () => {
    addAlert({
      title: 'Authorization Module',
      description: `Are you sure you want to ${authorizationModule ? 'disable' : 'enable'} Authorization module?`,
      cancelText: 'Cancel',
      actionText: 'Proceed',
      onDecision: (cancel) => {
        if (!cancel) {
          const { id, dismiss } = toast({
            title: 'Authorization',
            description: (
              <div className={'flex flex-row items-center space-x-2.5'}>
                <LoaderIcon className={'w-8 h-8 animate-spin'} />
                <p className='text-sm text-foreground'>Updating Authorization Settings...</p>
              </div>
            ),
          });
          const updatedSettings = {
            active: !authorizationModule,
          };
          setAuthorizationModule(!authorizationModule);
          patchAuthorizationSettings(updatedSettings).then(() => {
              dismiss();
              toast({
                title: 'Authorization',
                description: (
                  <div className={'flex flex-row items-center space-x-2.5'}>
                    <CheckIcon className={'w-8 h-8'} />
                    <p className='text-sm text-foreground'>Authorization Settings Updated!</p>
                  </div>
                ),
              });
            },
          ).catch(err => {
            dismiss();
            setAuthorizationModule(data.active);
            toast({
              title: 'Authorization',
              description: (
                <div className={'flex flex-col'}>
                  <div className={'flex flex-row text-destructive items-center'}>
                    <LucideX className={'w-8 h-8'} />
                    <p className='text-sm'>Failed to update with:</p>
                  </div>
                  <pre className='mt-2 w-[340px] rounded-md bg-secondary p-4 text-destructive'>
                    <code className='text-sm text-foreground'>{err.message}</code>
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
        <div className='space-y-0.5'>
          <div className={'flex gap-2 items-center'}>
            <p className='text-2xl font-medium'>
              Authorization Module
            </p>
            <Switch
              checked={authorizationModule}
              onCheckedChange={() => {
                handleSwitchChange();
              }}
            />
          </div>
          <div className={'pr-2'}>
            <p className={'text-xs text-[#94A3B8]'}>
              To see more information regarding Authorization config, visit our docs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

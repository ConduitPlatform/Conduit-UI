'use client';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import * as z from 'zod';
import { toast } from '@/lib/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAlerts } from '@/components/providers/AlertProvider';
import { Switch } from '@/components/ui/switch';
import { setTwoFA, verifyQrCodeRequest } from '@/lib/api/settings';
import { CheckIcon, LucideX } from 'lucide-react';

const FormSchema = z.object({
  code: z.string(),
});

export const TwoFASheet = ({ hasTwoFa }: { hasTwoFa: boolean }) => {
  const [open, setOpen] = useState(false);
  const [qr, setQr] = useState<string>('');
  const [switchValue, setSwitchValue] = useState<boolean>(false);

  const { addAlert } = useAlerts();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const { reset, formState, handleSubmit, control } = form;

  useEffect(() => {
    if (hasTwoFa) {
      setSwitchValue(hasTwoFa);
    } else {
      setSwitchValue(false);
    }
  }, [hasTwoFa]);

  useEffect(() => {
    if (!open && formState.isSubmitted) {
      setOpen(false);
      reset();
    }
    if (!open && formState.isDirty) {
      addAlert({
        title: '2FA',
        description:
          'Are you sure you want to close this sheet? 2FA is not enabled yet',
        cancelText: 'Cancel',
        actionText: 'Close',
        onDecision: cancel => {
          if (!cancel) {
            return reset();
          }
          setOpen(true);
        },
      });
    }
  }, [open]);

  const handleToggle = () => {
    let enable = false;
    if (switchValue === false) {
      enable = true;
    } else {
      enable = false;
    }
    setTwoFA(enable).then(res => {
      if (res.message === 'OK') {
        toast({
          title: '2FA',
          description: (
            <div className={'flex flex-row items-center space-x-2.5'}>
              <CheckIcon className={'w-8 h-8'} />
              <p className="text-sm text-foreground">
                Successfully disabled Two Factor Authentication!
              </p>
            </div>
          ),
        });
        setSwitchValue(!switchValue);
      } else {
        setQr(res.result);
        setOpen(true);
      }
    });
  };

  function onSubmit(data: z.infer<typeof FormSchema>) {
    verifyQrCodeRequest(data.code)
      .then(res => {
        setOpen(false);
        toast({
          title: '2FA',
          description: (
            <div className={'flex flex-row items-center space-x-2.5'}>
              <p className="text-sm text-foreground">
                Two factor Authentication Enabled!
              </p>
            </div>
          ),
        });
      })
      .catch(err => {
        toast({
          title: '2FA',
          description: (
            <div className={'flex flex-col'}>
              <div className={'flex flex-row text-destructive items-center'}>
                <LucideX className={'w-8 h-8'} />
                <p className="text-sm">Failed to update with:</p>
              </div>
              <pre className="mt-2 w-[340px] rounded-md bg-secondary p-4 text-destructive">
                <code className="text-sm text-foreground">{err.message}</code>
              </pre>
            </div>
          ),
        });
      });
  }

  return (
    <Sheet open={open} onOpenChange={open => setOpen(open)}>
      <Switch
        onClick={() => handleToggle()}
        checked={switchValue}
        defaultValue={switchValue.toString()}
        value={switchValue.toString()}
      />
      <SheetContent side="right">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <SheetHeader>
              <SheetTitle>Enable Two Factor Authentication</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 py-4 items-center">
              <img
                src={qr}
                style={{ border: `2px solid` }}
                width="200px"
                height="auto"
                alt="qrCode"
              />
              <FormField
                control={control}
                name="code"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-4">
                    <FormLabel className={'text-center'}>
                      Please scan the QR code above and insert your verification
                      code to continue
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="verification code"
                        type={'password'}
                        className="col-span-3"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className={'text-right col-span-4'} />
                  </FormItem>
                )}
              />
            </div>
            <SheetFooter>
              <Button type="submit">Proceed</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

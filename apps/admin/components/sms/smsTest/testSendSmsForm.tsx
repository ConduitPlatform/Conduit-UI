'use client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/form-inputs/InputField';
import { TextAreaField } from '@/components/ui/form-inputs/TextAreaField';
import { toast } from '@/lib/hooks/use-toast';
import { testSendSMS } from '@/lib/api/sms';

const FormSchema = z.object({
  to: z.string().min(8),
  message: z.string(),
});

export const TestSendSmsForm = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const { reset, handleSubmit, setValue, watch } = form;

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    await testSendSMS({
      ...data,
    })
      .then(() => {
        toast({
          title: 'SMS',
          description: 'Text sent',
        });
      })
      .catch(e => {
        toast({
          title: 'SMS',
          description: 'Failed to send',
        });
      });
    reset();
  };

  return (
    <div className={'container mx-auto py-10 main-scrollbar'}>
      <div className={'flex flex-col gap-6'}>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className={'space-y-4'}>
            <InputField label={'Receiver Phone'} fieldName={'to'} />
            <TextAreaField label={'Text'} fieldName={'message'} />
            <div className={'flex flex-row justify-end gap-2'}>
              <Button variant={'secondary'} onClick={() => reset()}>
                Reset
              </Button>
              <Button type={'submit'}>Send SMS</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

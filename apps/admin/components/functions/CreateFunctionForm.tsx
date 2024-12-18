'use client';

import { ConfigForm } from '@/components/functions/ConfigForm';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { z } from 'zod';
import {
  schema,
  WebhookOptions,
  CronOptions,
  EventOptions,
  MiddlewareOptions,
  RequestOptions,
  SocketOptions,
} from '@/components/functions/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CodeField } from '@/components/ui/form-inputs/CodeField';
import { Button } from '@/components/ui/button';
import { GetMiddlewaresResponseType } from '@/app/(dashboard)/(modules)/functions/functions/new/page';
import { uploadFunction } from '@/lib/api/functions';
import { toast } from '@/lib/hooks/use-toast';
import { useRouter } from 'next/navigation';

type CreateFunctionFormProps = {
  middlewares: GetMiddlewaresResponseType;
};

export const CreateFunctionForm = ({
  middlewares,
}: CreateFunctionFormProps) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof schema>>({
    mode: 'onChange',
    resolver: zodResolver(schema),
    shouldUnregister: false,
    defaultValues: {
      functionType: 'request',
      options: {
        functionType: 'request',
        verb: 'GET',
        middlewares: [],
      },
    },
  });

  const submit = async (data: z.infer<typeof schema>) => {
    let { options } = data;
    if (options.functionType === 'webhook') {
      type WebhookOptionsType = z.infer<typeof WebhookOptions>;
      options = options as WebhookOptionsType;
      uploadFunction({
        name: data.functionName,
        functionCode: data.functionCode,
        functionType: data.functionType,
        timeout: data.timeout,
        inputs: {
          auth: options.middlewares.includes('authMiddleware'),
          method: options.http.verb,
          ...options.http.queryParams,
          ...options.http.urlParams,
        },
        returns: options.http.returnTypes,
      })
        .then(() => {
          toast({
            title: 'Functions',
            description: 'Function uploaded successfully',
          });
          router.push('/functions/functions');
        })
        .catch(() =>
          toast({
            title: 'Functions',
            description: 'Failed to upload function',
          })
        );
    } else if (options.functionType === 'request') {
      type RequestOptionsType = z.infer<typeof RequestOptions>;
      options = options as RequestOptionsType;
      uploadFunction({
        name: data.functionName,
        functionCode: data.functionCode,
        functionType: data.functionType,
        timeout: data.timeout,
        inputs: {
          auth: options.middlewares.includes('authMiddleware'),
          method: options.verb,
          ...options.http.queryParams,
          ...options.http.urlParams,
        },
        returns: options.http.returnTypes,
      })
        .then(() => {
          toast({
            title: 'Functions',
            description: 'Function uploaded successfully',
          });
          router.push('/functions/functions');
        })
        .catch(() =>
          toast({
            title: 'Functions',
            description: 'Failed to upload function',
          })
        );
    } else if (options.functionType === 'event') {
      type EventOptionsType = z.infer<typeof EventOptions>;
      options = options as EventOptionsType;
      uploadFunction({
        name: data.functionName,
        functionCode: data.functionCode,
        functionType: data.functionType,
        timeout: data.timeout,
        inputs: {
          event: options.eventName,
        },
      })
        .then(() => {
          toast({
            title: 'Functions',
            description: 'Function uploaded successfully',
          });
          router.push('/functions/functions');
        })
        .catch(() =>
          toast({
            title: 'Functions',
            description: 'Failed to upload function',
          })
        );
    } else if (options.functionType === 'cron') {
      type CronOptionsType = z.infer<typeof CronOptions>;
      options = options as CronOptionsType;
      uploadFunction({
        name: data.functionName,
        functionCode: data.functionCode,
        functionType: data.functionType,
        timeout: data.timeout,
        inputs: {
          event: options.cronString,
        },
      })
        .then(() => {
          toast({
            title: 'Functions',
            description: 'Function uploaded successfully',
          });
          router.push('/functions/functions');
        })
        .catch(() =>
          toast({
            title: 'Functions',
            description: 'Failed to upload function',
          })
        );
    } else if (options.functionType === 'socket') {
      type SocketOptionsType = z.infer<typeof SocketOptions>;
      options = options as SocketOptionsType;
      uploadFunction({
        name: data.functionName,
        functionCode: data.functionCode,
        functionType: data.functionType,
        timeout: data.timeout,
      })
        .then(() => {
          toast({
            title: 'Functions',
            description: 'Function uploaded successfully',
          });
          router.push('/functions/functions');
        })
        .catch(() =>
          toast({
            title: 'Functions',
            description: 'Failed to upload function',
          })
        );
    } else if (options.functionType === 'middleware') {
      type MiddlewareOptionsType = z.infer<typeof MiddlewareOptions>;
      options = options as MiddlewareOptionsType;
      uploadFunction({
        name: data.functionName,
        functionCode: data.functionCode,
        functionType: data.functionType,
        timeout: data.timeout,
      })
        .then(() => {
          toast({
            title: 'Functions',
            description: 'Function uploaded successfully',
          });
          router.push('/functions/functions');
        })
        .catch(() =>
          toast({
            title: 'Functions',
            description: 'Failed to upload function',
          })
        );
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submit, errors => console.log(errors))}
        className="space-y-4"
      >
        <div className="w-full grid grid-cols-2 gap-x-5 min-h-[600px]">
          <div className="col-span-1 overflow-visible">
            <ConfigForm middlewares={middlewares} />
          </div>
          <div className="flex flex-col bg-[#161b22] text-sm col-span-1 p-5 h-full text-[#c9d1d9]">
            <span>module.exports = function(grpcSdk, req, res) {' {'}</span>
            <CodeField
              label={''}
              fieldName={'functionCode'}
              placeholder={'Write your code here...'}
              language={'javascript'}
              className="h-full"
            />
            <span>{'}'} </span>
          </div>
        </div>
        <Button>Save Function</Button>
      </form>
    </Form>
  );
};

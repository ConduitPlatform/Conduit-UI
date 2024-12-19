import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { InputField } from '@/components/ui/form-inputs/InputField';
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFormContext } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GetMiddlewaresResponseType } from '@/app/(dashboard)/(modules)/functions/functions/new/page';
import { OptionsForm } from '@/components/functions/params';
import { BodyParamsForm } from '@/components/functions/params/BodyForm';
import { QueryParamsForm } from '@/components/functions/params/QueryForm';
import { UrlParamsForm } from '@/components/functions/params/UrlParams';
import { ReturnParamsForm } from '@/components/functions/params/ReturnForm';
import { FunctionModel } from '@/lib/models/functions';

type ConfigFormProps = {
  middlewares: GetMiddlewaresResponseType;
  data?: FunctionModel;
};

export const ConfigForm = ({ middlewares, data }: ConfigFormProps) => {
  const form = useFormContext();
  return (
    <div className="flex flex-col space-y-4">
      <InputField fieldName={'functionName'} label={'Function Name'} />
      <div className="w-full flex justify-between items-center space-x-4">
        <FormField
          control={form.control}
          name="functionType"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Function Type</FormLabel>
              <Select
                onValueChange={value => {
                  field.onChange(value);
                  form.setValue('options.functionType', value);
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className={'bg-white dark:bg-popover'}>
                  <SelectItem value={'request'}>
                    <div className={'flex items-center gap-2'}>Request</div>
                  </SelectItem>
                  <SelectItem value={'webhook'}>
                    <div className={'flex items-center gap-2'}>Webhook</div>
                  </SelectItem>
                  <SelectItem value={'event'}>
                    <div className={'flex items-center gap-2'}>Event</div>
                  </SelectItem>
                  <SelectItem value={'cron'}>
                    <div className={'flex items-center gap-2'}>Cron</div>
                  </SelectItem>
                  <SelectItem value={'socket'}>
                    <div className={'flex items-center gap-2'}>Socket</div>
                  </SelectItem>
                  <SelectItem value={'middleware'}>
                    <div className={'flex items-center gap-2'}>Middleware</div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {(form.watch('functionType') === 'webhook' ||
          form.watch('functionType') === 'request') && (
          <FormField
            control={form.control}
            name="options.verb"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Verb</FormLabel>
                <Select
                  onValueChange={value => {
                    if (value === '') return;
                    field.onChange(value);
                    form.setValue('options.http.verb', value);
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a verb" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className={'bg-white dark:bg-popover'}>
                    <SelectItem value={'GET'}>
                      <div className={'flex items-center gap-2'}>GET</div>
                    </SelectItem>
                    <SelectItem value={'POST'}>
                      <div className={'flex items-center gap-2'}>POST</div>
                    </SelectItem>
                    <SelectItem value={'PUT'}>
                      <div className={'flex items-center gap-2'}>PUT</div>
                    </SelectItem>
                    <SelectItem value={'DELETE'}>
                      <div className={'flex items-center gap-2'}>DELETE</div>
                    </SelectItem>
                    <SelectItem value={'PATCH'}>
                      <div className={'flex items-center gap-2'}>PATCH</div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
      <InputField
        fieldName={'timeout'}
        label={'Function Timeout (milliseconds)'}
        type={'number'}
      />
      {form.watch('functionType') === 'event' && (
        <InputField fieldName={'options.eventName'} label={'Event Name'} />
      )}
      {form.watch('functionType') === 'cron' && (
        <InputField fieldName={'options.cronString'} label={'Cron String'} />
      )}
      {(form.watch('functionType') === 'webhook' ||
        form.watch('functionType') === 'request') && (
        <Tabs defaultValue="query">
          <TabsList className="bg-transparent">
            <TabsTrigger
              value="query"
              className="rounded-none data-[state=active]:border-b data-[state=active]:border-b-amber-200"
            >
              <span>Query</span>
            </TabsTrigger>
            {(form.watch('options.verb') === 'POST' ||
              form.watch('options.verb') === 'PUT' ||
              form.watch('options.verb') === 'PATCH') && (
              <TabsTrigger
                value="body"
                className="rounded-none data-[state=active]:border-b data-[state=active]:border-b-amber-200 flex items-center space-x-2"
              >
                <span>Body</span>
              </TabsTrigger>
            )}
            <TabsTrigger
              value="url"
              className="rounded-none data-[state=active]:border-b data-[state=active]:border-b-amber-200"
            >
              <span>Url</span>
            </TabsTrigger>
            <TabsTrigger
              value="return"
              className="rounded-none data-[state=active]:border-b data-[state=active]:border-b-amber-200"
            >
              <span>Return</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="query">
            <OptionsForm middlewares={middlewares}>
              <QueryParamsForm />
            </OptionsForm>
          </TabsContent>
          {(form.watch('options.verb') === 'POST' ||
            form.watch('options.verb') === 'PUT' ||
            form.watch('options.verb') === 'PATCH') && (
            <TabsContent value="body">
              <OptionsForm middlewares={middlewares}>
                <BodyParamsForm />
              </OptionsForm>
            </TabsContent>
          )}
          <TabsContent value="url">
            <OptionsForm middlewares={middlewares}>
              <UrlParamsForm />
            </OptionsForm>
          </TabsContent>
          <TabsContent value="return">
            <OptionsForm middlewares={middlewares}>
              <ReturnParamsForm />
            </OptionsForm>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

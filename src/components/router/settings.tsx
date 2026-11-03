'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { rhfZodResolver } from '@/lib/zod-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useRef, useState } from 'react';
import { Copy } from 'lucide-react';
import { useSettingsSave } from '@/lib/hooks/use-settings-save';
import { toast } from '@/lib/hooks/use-toast';
import { SettingsFormActions } from '@/components/settings/SettingsFormActions';
import { Button } from '@/components/ui/button';
import {
  CaptchaProvider,
  generateClientSecretEncryptionKey,
  REDACTED_CONFIG_VALUE,
  RouterSettings,
  securitySettingsPatch,
} from '@/lib/models/Router';
import { patchRouterSettings } from '@/lib/api/router';

const FormSchema = z
  .object({
    hostUrl: z.string().url(),
    captcha: z.object({
      enabled: z.boolean(),
      provider: z.enum(['recaptcha', 'hcaptcha', 'turnstile']),
      secretKey: z.string(),
    }),
    rateLimit: z.object({
      maxRequests: z.number(),
      resetInterval: z.number(),
    }),
    cors: z.object({
      enabled: z.boolean(),
      origin: z.string(),
      methods: z.string(),
      allowedHeaders: z.string(),
      exposedHeaders: z.string(),
      credentials: z.boolean(),
      maxAge: z.number(),
    }),
    transports: z.object({
      rest: z.boolean(),
      graphql: z.boolean(),
      sockets: z.boolean(),
    }),
    security: z.object({
      clientValidation: z.boolean(),
      clientSecretEncryptionKey: z.string(),
      clientSignaturePathPrefix: z.string(),
    }),
  })
  .refine(
    schema => {
      if (schema.captcha.enabled && schema.captcha.secretKey === '')
        return false;
      return true;
    },
    {
      message: 'You need to provide secret key to enable captcha',
      path: ['captcha.secretKey'],
    }
  );

interface Props {
  data: RouterSettings;
}

function settingsFormValues(data: RouterSettings): z.infer<typeof FormSchema> {
  return {
    ...data,
    security: {
      clientValidation: data.security?.clientValidation ?? false,
      clientSecretEncryptionKey: data.security?.clientSecretEncryptionKey ?? '',
      clientSignaturePathPrefix: data.security?.clientSignaturePathPrefix ?? '',
    },
  };
}

export const Settings = ({ data }: Props) => {
  const [edit, setEdit] = useState<boolean>(false);
  const encryptionKeyEdited = useRef(false);
  const { save, isSaving } = useSettingsSave('Router');
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: rhfZodResolver(FormSchema),
    defaultValues: settingsFormValues(data),
  });

  const { reset, control, handleSubmit, watch, setValue } = form;
  const encryptionKeyValue = watch('security.clientSecretEncryptionKey');
  const canCopyEncryptionKey =
    encryptionKeyValue.length > 0 &&
    encryptionKeyValue !== REDACTED_CONFIG_VALUE;

  const onSubmit = async (formData: z.infer<typeof FormSchema>) => {
    const security = securitySettingsPatch(
      formData.security,
      encryptionKeyEdited.current
    );
    const dataToSubmit = {
      ...formData,
      security,
      cors: {
        ...formData.cors,
        maxAge: formData.cors.maxAge as number,
      },
    };
    const result = await save({
      action: () => patchRouterSettings(dataToSubmit),
    });
    if (result.ok) {
      const displayedKey =
        security.clientSecretEncryptionKey === undefined
          ? formData.security.clientSecretEncryptionKey
          : security.clientSecretEncryptionKey === ''
            ? ''
            : REDACTED_CONFIG_VALUE;
      encryptionKeyEdited.current = false;
      reset({
        ...formData,
        security: {
          ...formData.security,
          clientSecretEncryptionKey: displayedKey,
        },
      });
      setEdit(false);
    }
  };

  const generateEncryptionKey = () => {
    encryptionKeyEdited.current = true;
    setValue(
      'security.clientSecretEncryptionKey',
      generateClientSecretEncryptionKey(),
      { shouldDirty: true, shouldValidate: true }
    );
  };

  const copyEncryptionKey = async () => {
    if (!canCopyEncryptionKey) return;
    try {
      await navigator.clipboard.writeText(encryptionKeyValue);
      toast({ title: 'Encryption key copied' });
    } catch {
      toast({
        title: 'Failed to copy encryption key',
        variant: 'destructive',
      });
    }
  };
  return (
    <div className={'container mx-auto py-10 main-scrollbar'}>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={'flex flex-col gap-4'}>
            <div className={'flex flex-col gap-2'}>
              <p className={'text-2xl font-medium'}>General</p>
              <p className={'text-xs text-muted-foreground w-9/12'}>
                Router provides a way for modules to register application routes
                for REST and GraphQL APIs. Endpoint documentation is
                automatically generated so as to further facilitate development.
                It also provides support for application-level WebSockets. See{' '}
                <a
                  href={'https://getconduit.dev/docs/modules/router/'}
                  className="hover:underline"
                >
                  more
                </a>
                .
              </p>
            </div>
            <FormField
              control={control}
              name="hostUrl"
              render={({ field }) => (
                <FormItem className={'w-4/12'}>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input
                      disabled={!edit}
                      type={'url'}
                      title={'URL'}
                      placeholder={'Enter url'}
                      className={'text-accent-foreground'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className={'grid grid-cols-3 gap-4'}>
              <FormField
                control={control}
                name="transports.rest"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border px-3 py-2">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">REST</FormLabel>
                      <FormDescription className={'pr-2'}>
                        Note: Disabling REST will affect webhook functionality.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        disabled={!edit}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="transports.graphql"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border px-3 py-2">
                    <FormLabel className="text-base">GraphQL</FormLabel>
                    <FormControl>
                      <Switch
                        disabled={!edit}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="transports.sockets"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border px-3 py-2">
                    <FormLabel className="text-base">WebSockets</FormLabel>
                    <FormControl>
                      <Switch
                        disabled={!edit}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <Separator className={'my-3'} />
            <h1 className="text-2xl font-medium pt-2">Rate Limit settings</h1>
            <div className={'flex flex-row space-x-4'}>
              <FormField
                control={control}
                name="rateLimit.maxRequests"
                render={({ field }) => (
                  <FormItem className={'w-1/2'}>
                    <FormLabel>Max Requests</FormLabel>
                    <FormDescription className={'pr-2'}>
                      The maximum number of requests allowed within the
                      specified interval.
                    </FormDescription>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        type={'number'}
                        title={'Max Requests'}
                        placeholder={'eg. 50'}
                        className={'text-accent-foreground'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="rateLimit.resetInterval"
                render={({ field }) => (
                  <FormItem className={'w-1/2'}>
                    <FormLabel>Interval</FormLabel>
                    <FormDescription className={'pr-2'}>
                      The interval in seconds after which the rate limit counter
                      will be reset.
                    </FormDescription>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        type={'number'}
                        title={'Interval'}
                        placeholder={'eg. 1'}
                        className={'text-accent-foreground'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Separator className={'my-3'} />
            <FormField
              control={control}
              name="cors.enabled"
              render={({ field }) => (
                <FormItem className="flex items-center gap-4">
                  <FormLabel className="text-2xl font-medium pt-2">
                    Cross Origin Resource Sharing
                  </FormLabel>
                  <FormControl>
                    <Switch
                      disabled={!edit}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {watch('cors.enabled') && (
              <div className={'grid grid-cols-2 gap-4'}>
                <FormField
                  control={control}
                  name="cors.origin"
                  render={({ field }) => (
                    <FormItem className={'w-full'}>
                      <FormLabel>Origin</FormLabel>
                      <FormControl>
                        <Input
                          disabled={!edit}
                          title={'Origin'}
                          placeholder={'Enter a value'}
                          className={'text-accent-foreground'}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="cors.methods"
                  render={({ field }) => (
                    <FormItem className={'w-full'}>
                      <FormLabel>
                        Allowed Methods
                        <p className={'text-xs text-muted-foreground w-9/12'}>
                          Make sure Methods are comma-separated
                        </p>
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={!edit}
                          title={'Allowed Methods'}
                          placeholder={'Enter allowed Methods'}
                          className={'text-accent-foreground'}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="cors.allowedHeaders"
                  render={({ field }) => (
                    <FormItem className={'w-full'}>
                      <FormLabel>
                        Allowed Headers
                        <p className={'text-xs text-muted-foreground w-9/12'}>
                          Make sure Headers are comma-separated
                        </p>
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={!edit}
                          title={'Allowed Headers'}
                          placeholder={'Enter allowed Headers'}
                          className={'text-accent-foreground'}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="cors.exposedHeaders"
                  render={({ field }) => (
                    <FormItem className={'w-full'}>
                      <FormLabel>
                        Exposed Headers
                        <p className={'text-xs text-muted-foreground w-9/12'}>
                          Make sure Methods are comma-separated
                        </p>
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={!edit}
                          title={'Exposed Headers'}
                          placeholder={'Enter exposed Headers'}
                          className={'text-accent-foreground'}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="cors.maxAge"
                  render={({ field }) => (
                    <FormItem className={'w-full'}>
                      <FormLabel>Max Age</FormLabel>
                      <FormControl>
                        <Input
                          disabled={!edit}
                          type={'number'}
                          title={'Max Age'}
                          placeholder={'Max Age'}
                          className={'text-accent-foreground'}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="cors.credentials"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <FormLabel className="text-base">Credentials</FormLabel>
                      <FormControl>
                        <Switch
                          disabled={!edit}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}
            <Separator className={'my-3'} />
            <FormField
              control={control}
              name="security.clientValidation"
              render={({ field }) => (
                <FormItem className="flex items-center gap-4">
                  <FormLabel className="text-2xl font-medium">
                    Security Client Validation
                  </FormLabel>
                  <FormControl>
                    <Switch
                      disabled={!edit}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="mt-2 mb-4 flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                When enabled, the router will validate security clients for all
                requests. This requires security clients to be configured in the
                Security section. Non-web clients must sign each request, and
                existing non-web clients must be recreated. A bcrypt secret will
                not verify.
              </p>
              <FormField
                control={control}
                name="security.clientSecretEncryptionKey"
                render={({ field }) => (
                  <FormItem className="max-w-xl">
                    <FormLabel>Client secret encryption key</FormLabel>
                    <FormDescription>
                      Write-only. A saved key is shown as [REDACTED] and is not
                      sent again unless you type or generate a new value. An
                      empty field is left out of the save, so the stored key
                      stays. Generate uses 32 random bytes as standard base64.
                      Changing a saved key makes every stored client secret
                      unreadable.
                    </FormDescription>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          disabled={!edit}
                          title="Client secret encryption key"
                          autoComplete="off"
                          spellCheck={false}
                          placeholder="Not set"
                          className="font-mono text-accent-foreground"
                          {...field}
                          onChange={event => {
                            encryptionKeyEdited.current = true;
                            field.onChange(event);
                          }}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!edit}
                        onClick={generateEncryptionKey}
                      >
                        Generate
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!canCopyEncryptionKey}
                        onClick={() => {
                          void copyEncryptionKey();
                        }}
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="security.clientSignaturePathPrefix"
                render={({ field }) => (
                  <FormItem className="w-4/12">
                    <FormLabel>Signature path prefix</FormLabel>
                    <FormDescription>
                      Saved with the router settings and prepended to the path
                      used when signatures are verified. A proxy that strips
                      /api is fixed by /api.
                    </FormDescription>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        title="Signature path prefix"
                        placeholder="/api"
                        className="font-mono text-accent-foreground"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Separator className={'my-3'} />
            <FormField
              control={control}
              name="captcha.enabled"
              render={({ field }) => (
                <FormItem className="flex items-center gap-4">
                  <FormLabel className="text-2xl font-medium">
                    Captcha
                  </FormLabel>
                  <FormControl>
                    <Switch
                      disabled={!edit}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {watch('captcha.enabled') && (
              <div className={'grid grid-cols-3 gap-4'}>
                <FormField
                  control={control}
                  name="captcha.provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider</FormLabel>
                      <Select
                        onValueChange={(p: CaptchaProvider) =>
                          field.onChange(p)
                        }
                        value={field.value}
                        defaultValue={'recaptcha'}
                        disabled={!edit}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={'recaptcha'}>recaptcha</SelectItem>
                          <SelectItem value={'hcaptcha'}>hcaptcha</SelectItem>
                          <SelectItem value={'turnstile'}>turnstile</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="captcha.secretKey"
                  render={({ field }) => (
                    <FormItem className={'w-full'}>
                      <FormLabel>Secret key</FormLabel>
                      <FormControl>
                        <Input
                          disabled={!edit}
                          title={'Secret key'}
                          placeholder={'Enter a value'}
                          className={'text-accent-foreground'}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
          <SettingsFormActions
            edit={edit}
            isSaving={isSaving}
            onEdit={() => setEdit(true)}
            onCancel={() => {
              encryptionKeyEdited.current = false;
              reset();
              setEdit(false);
            }}
          />
        </form>
      </Form>
    </div>
  );
};

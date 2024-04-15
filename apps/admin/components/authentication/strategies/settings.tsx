'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { toast } from '@/lib/hooks/use-toast';
import { CheckIcon, LoaderIcon, LucideX } from 'lucide-react';
import { CaptchaProvider } from '@/lib/models/Router';
import { AuthenticationConfig } from '@/lib/models/authentication';
import { patchAuthenticationSettings } from '@/lib/api/authentication';
import { InputField } from '@/components/ui/form-inputs/InputField';
import SwitchField from '@/components/ui/form-inputs/SwitchField';

const tokensSchema = z.object({
  httpOnly: z.boolean().default(true),
  secure: z.boolean().default(false),
  signed: z.boolean().default(false),
  domain: z.string().default(''),
  path: z.string().default(''),
  sameSite: z.string().default('Lax'),
});
const accessTokenSchema = z.object({
  jwtSecret: z.string().default('S3CR3T'),
  expiryPeriod: z.number().default(3600000),
  setCookie: z.boolean().default(false),
}).merge(tokensSchema);

const refreshTokenSchema = z.object({
  enabled: z.boolean().default(true),
  expiryPeriod: z.number().default(86400000 * 7),
  setCookie: z.boolean().default(false),
}).merge(tokensSchema);

const clientsSchema = z.object({
  multipleUserSessions: z.boolean().default(false),
  multipleClientLogins: z.boolean().default(true),
});
const teamsSchema = z.object({
  enabled: z.boolean().default(false),
  enableDefaultTeam: z.boolean().default(false),
  allowAddWithoutInvite: z.boolean().default(false),
  allowRegistrationWithoutInvite: z.boolean().default(true),
  allowEmailMismatchForInvites: z.boolean().default(false),
  invites: z.object({
    enabled: z.boolean().default(false),
    sendEmail: z.boolean().default(false),
    inviteUrl: z.string().default('https://mydomain.conduit/invite'),
  }),
});
const FormSchema = z.object({
  captcha: z.object({
    enabled: z.boolean().default(false),
    routes: z.object({
      login: z.boolean().default(false),
      register: z.boolean().default(false),
      oAuth2: z.boolean().default(false),
    }),
    acceptablePlatform: z.object({
      android: z.boolean().default(false),
      web: z.boolean().default(true),
    }),
  }),
  redirectUris: z.object({
    allowAny: z.boolean().default(false),
    whitelistedUris: z.array(z.string()).default([]),
  }),
  teams: teamsSchema,
  clients: clientsSchema,
  accessTokens: accessTokenSchema,
  refreshTokens: refreshTokenSchema,
});

interface Props {
  data: AuthenticationConfig;
}

export const AuthenticationSettings = ({ data }: Props) => {
  const [edit, setEdit] = useState<boolean>(false);
  type formSchema = z.infer<typeof FormSchema>;
  const form = useForm<formSchema>({
    resolver: zodResolver(FormSchema),
    defaultValues: data,
  });

  const { reset, control, handleSubmit, watch } = form;

  const onSubmit = async (formData: formSchema) => {
    setEdit(false);
    const { id, dismiss } = toast({
      title: 'Authentication',
      description: (
        <div className={'flex flex-row items-center space-x-2.5'}>
          <LoaderIcon className={'w-8 h-8 animate-spin'} />
          <p className='text-sm text-foreground'>Updating Authentication Settings...</p>
        </div>
      ),
    });
    const res = await patchAuthenticationSettings(formData).catch((err) => {
      dismiss();
      toast({
        title: 'Authentication',
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
      return null;
    });
    if (!res) return;
    dismiss();
    toast({
      title: 'Authentication',
      description: (
        <div className={'flex flex-row items-center space-x-2.5'}>
          <CheckIcon className={'w-8 h-8'} />
          <p className='text-sm text-foreground'>Authentication Settings Updated!</p>
        </div>
      ),
    });
  };

  return (
    <div className={'container mx-auto py-10 main-scrollbar'}>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={'flex flex-col gap-4'}>
            <div className={'flex flex-col gap-2'}>
              <p className={'text-2xl font-medium'}>General</p>
              <p className={'text-xs text-[#94A3B8] w-9/12'}>Authentication provides you with various authentication
                strategies for your application/platform. You can configure those, along with two-factor authentication,
                biometric/passkey and various customizations for your general posture. See <a
                  href={'https://getconduit.dev/docs/modules/authentication/'} className='underline'
                  target='_blank'>more</a>.</p>
            </div>

            <h1 className='text-2xl font-medium pt-2'>Access Token settings</h1>
            <div className={'flex flex-col space-y-4'}>
              <div className={'flex flex-row space-x-4'}>
                <InputField label={'JWT Secret'} fieldName={'accessTokens.jwtSecret'} defaultValue={'S3CR3T'} />
                <InputField type={'number'} label={'Expiry Period (ms)'} fieldName={'accessTokens.expiryPeriod'}
                            defaultValue={3600000}
                            onChange={(e) => {
                              form.setValue('accessTokens.expiryPeriod', parseInt(e.target.value));
                            }} />
              </div>
              <SwitchField label={'Use Cookies'} fieldName={'accessTokens.setCookie'} />
              {form.watch('accessTokens.setCookie') && (
                <div className={'grid grid-cols-2 gap-4 items-center'}>
                  <InputField label={'Domain'} fieldName={'accessTokens.domain'} />
                  <InputField label={'Path'} fieldName={'accessTokens.path'} />
                  <InputField label={'SameSite'} fieldName={'accessTokens.sameSite'} />
                  <SwitchField label={'Secure'} fieldName={'accessTokens.secure'} />
                  <SwitchField label={'HTTP Only'} fieldName={'accessTokens.httpOnly'} />
                  <SwitchField label={'Signed'} fieldName={'accessTokens.signed'} />
                </div>
              )}
            </div>
            <h1 className='text-2xl font-medium pt-2 flex flex-row items-center gap-x-3'>Refresh Token
              settings <SwitchField label={''} fieldName={'refreshTokens.enabled'} /></h1>
            {form.watch('refreshTokens.enabled') && (
              <div className={'flex flex-col space-y-4'}>
                <div className={'flex flex-row space-x-4'}>
                  <InputField type={'number'} label={'Expiry Period (ms)'} fieldName={'refreshTokens.expiryPeriod'}
                              defaultValue={86400000 * 7}
                              onChange={(e) => {
                                form.setValue('refreshTokens.expiryPeriod', parseInt(e.target.value));
                              }} />
                </div>
                <SwitchField label={'Use Cookies'} fieldName={'refreshTokens.setCookie'} />
                {form.watch('refreshTokens.setCookie') && (
                  <div className={'grid grid-cols-2 gap-4 items-center'}>
                    <InputField label={'Domain'} fieldName={'refreshTokens.domain'} />
                    <InputField label={'Path'} fieldName={'refreshTokens.path'} />
                    <InputField label={'SameSite'} fieldName={'refreshTokens.sameSite'} />
                    <SwitchField label={'Secure'} fieldName={'refreshTokens.secure'} />
                    <SwitchField label={'HTTP Only'} fieldName={'refreshTokens.httpOnly'} />
                    <SwitchField label={'Signed'} fieldName={'refreshTokens.signed'} />
                  </div>
                )}
              </div>
            )}

            <Separator className={'my-3'} />
            <h1 className='text-2xl font-medium pt-2 flex flex-row items-center gap-x-3'>Teams
              settings <SwitchField label={''} fieldName={'teams.enabled'} /></h1>
            {form.watch('teams.enabled') && (
              <div className={'flex flex-col space-y-4'}>
                <div className={'grid grid-cols-2 gap-4 items-center'}>
                  <SwitchField label={'Enable default team'} fieldName={'teams.enableDefaultTeam'} />
                  <SwitchField label={'Allow add without invite'} fieldName={'teams.allowAddWithoutInvite'} />
                  <SwitchField label={'Allow registration without an invite'}
                               fieldName={'teams.allowRegistrationWithoutInvite'} />
                  <SwitchField label={'Allow email mismatch for invites'}
                               fieldName={'teams.allowEmailMismatchForInvites'} />
                </div>
                <h1 className='text-xl font-medium pt-2'>Invites</h1>
                <div className={'grid grid-cols-2 gap-4 items-center'}>
                  <SwitchField label={'Enabled'} fieldName={'teams.invites.enabled'} />
                  <SwitchField label={'Send email'} fieldName={'teams.invites.sendEmail'} />
                  <InputField label={'Invite URL'} fieldName={'teams.invites.inviteUrl'} />
                </div>
              </div>
            )}

            <Separator className={'my-3'} />
            <h1 className='text-2xl font-medium pt-2'>Client settings</h1>
            <div className={'flex flex-col space-y-4'}>
              <SwitchField label={'Multiple user sessions in different clients'} fieldName={'clients.multipleUserSessions'}/>
              <SwitchField label={'Multiple same-client sessions'} fieldName={'clients.multipleClientLogins'} />
            </div>
            <Separator className={'my-3'} />
            <h1 className='text-2xl font-medium pt-2 flex flex-row items-center gap-x-3'>Captcha <SwitchField label={''} fieldName={'captcha.enabled'} /></h1>
            {form.watch('captcha.enabled') && (
              <div className={'flex flex-col space-y-4'}>
                <h1 className='text-lg font-medium pt-2'>Enabled for the following routes:</h1>
                <div className={'grid grid-cols-2 gap-4 items-center'}>

                  <SwitchField label={'Login'} fieldName={'captcha.routes.login'} />
                  <SwitchField label={'Register'} fieldName={'captcha.routes.register'} />
                  <SwitchField label={'OAuth2'} fieldName={'captcha.routes.oAuth2'} />
                </div>
                <h1 className='text-lg font-medium pt-2'>Acceptable Platforms</h1>
                <div className={'grid grid-cols-2 gap-4 items-center'}>
                  <SwitchField label={'Android'} fieldName={'captcha.acceptablePlatform.android'} />
                  <SwitchField label={'Web'} fieldName={'captcha.acceptablePlatform.web'} />
                </div>
              </div>

            )}
          </div>
          <div className={'w-full py-4 flex justify-end'}>
            {edit ?
              <div className={'flex gap-2'}>
                <Button
                  type='button'
                  className={'dark:border-gray-500'}
                  variant={'outline'}
                  onClick={() => {
                    reset();
                    setEdit(false);
                  }}>Cancel</Button>
                <Button type='submit'>Submit</Button>
              </div> :
              <Button onClick={() => {
                setEdit(true);
              }}>Edit</Button>
            }
          </div>
        </form>
      </Form>
    </div>
  );
};

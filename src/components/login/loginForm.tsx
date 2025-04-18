'use client';

import * as React from 'react';
import { useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoaderIcon } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { adminLogin, loginSecondFactor } from '@/lib/api';
import SelectField from '@/components/ui/form-inputs/SelectField';

export function LoginForm({ envs }: { envs: string[] }) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [username, setUsername] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [code, setCode] = React.useState<string>('');
  const [twoFaRequired, setTwoFaRequired] = React.useState<boolean>(false);
  const [environment, setEnvironment] = React.useState<string>(envs[0]);
  const router = useRouter();
  const { toast } = useToast();

  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsLoading(true);
      adminLogin(username, password, environment)
        .then(twoFaRequired => {
          if (twoFaRequired) {
            toast({
              title: 'Two Factor Authentication Required',
              description: 'Please enter your 2FA code.',
            });
            setIsLoading(false);
            setTwoFaRequired(true);
            return;
          }
          setIsLoading(false);
          toast({
            title: 'Hello there',
          });
          router.replace('/');
        })
        .catch(() => {
          toast({
            title: "That's not right",
            variant: 'destructive',
          });
          setIsLoading(false);
        });
    },
    [username, password, environment, toast, router]
  );

  const onTwoFa = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsLoading(true);
      loginSecondFactor(code, environment)
        .then(() => {
          setIsLoading(false);
          toast({
            title: 'Hello there',
          });
          router.replace('/');
        })
        .catch(() => {
          toast({
            title: "That's not right",
            variant: 'destructive',
          });
          setIsLoading(false);
        });
    },
    [code, environment, toast, router]
  );

  if (twoFaRequired) {
    return (
      <form onSubmit={onTwoFa} className="mt-6">
        <div className="space-y-3">
          <div>
            <Label className="sr-only" htmlFor="username">
              Authenticator Code
            </Label>
            <Input
              id="code"
              placeholder="******"
              type="text"
              autoCapitalize="none"
              autoComplete="one-time-code"
              autoCorrect="off"
              disabled={isLoading}
              value={code}
              onChange={e => setCode(e.target.value)}
            />
          </div>
          <Button disabled={isLoading} className="w-full">
            {isLoading && <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />}
            Sign In
          </Button>
        </div>
      </form>
    );
  } else {
    return (
      <form onSubmit={onSubmit} className="mt-6">
        <div className="space-y-3">
          <div>
            <Label className="sr-only" htmlFor="username">
              Username
            </Label>
            <Input
              id="username"
              placeholder="username"
              type="text"
              autoCapitalize="none"
              autoComplete="username"
              autoCorrect="off"
              disabled={isLoading}
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div>
            <Label className="sr-only" htmlFor="password">
              Password
            </Label>
            <Input
              id="password"
              placeholder="******"
              type="password"
              autoCapitalize="none"
              autoComplete="password"
              autoCorrect="off"
              disabled={isLoading}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div>
            <SelectField
              label={'Environment'}
              placeholder={'Select Environment'}
              options={envs}
              value={environment}
              onValueChange={e => setEnvironment(e)}
            />
          </div>
          <Button disabled={isLoading} className="w-full">
            {isLoading && <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />}
            Sign In
          </Button>
        </div>
      </form>
    );
  }
}

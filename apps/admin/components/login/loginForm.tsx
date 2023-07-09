'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoaderIcon } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface LoginFormProps extends React.HTMLAttributes<HTMLDivElement> {
  loginAction: (username: string, password: string) => Promise<any>;
}

export function LoginForm({ className, ...props }: LoginFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [username, setUsername] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const router = useRouter();
  const { toast } = useToast();

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);
    props.loginAction(username, password)
      .then(() => {
        setIsLoading(false);
        toast({
          title: 'Hello there',
        });
        router.replace('/');
      })
      .catch(() => {
        toast({
          title: 'That\'s not right',
          variant: 'destructive',
        });
        setIsLoading(false);
      });
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className='grid gap-2'>
          <div className='grid gap-1'>
            <Label className='sr-only' htmlFor='username'>
              Username
            </Label>
            <Input
              id='username'
              placeholder='username'
              type='text'
              autoCapitalize='none'
              autoComplete='username'
              autoCorrect='off'
              disabled={isLoading}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className='grid gap-1'>
            <Label className='sr-only' htmlFor='password'>
              Password
            </Label>
            <Input
              id='password'
              placeholder='******'
              type='password'
              autoCapitalize='none'
              autoComplete='password'
              autoCorrect='off'
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button disabled={isLoading}>
            {isLoading && (
              <LoaderIcon className='mr-2 h-4 w-4 animate-spin' />
            )}
            Sign In
          </Button>
        </div>
      </form>
    </div>
  );
}

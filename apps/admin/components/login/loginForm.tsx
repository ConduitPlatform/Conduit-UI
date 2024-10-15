'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoaderIcon } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { adminLogin } from '@/lib/api';

export function LoginForm() {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [username, setUsername] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const router = useRouter();
  const { toast } = useToast();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    adminLogin(username, password)
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
  }

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
        <Button disabled={isLoading} className="w-full">
          {isLoading && <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />}
          Sign In
        </Button>
      </div>
    </form>
  );
}

'use server';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React from 'react';
import { Strategy } from '@/components/authentication/strategies/Strategy';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export interface StrategyCardProps {
  strategy: Strategy;

}

export const StrategyCard = ({ strategy }: StrategyCardProps) => {
  return (
    <Card className={'col-span-2 px-0 '} key={`${strategy.name}`}>
      <CardHeader>
        <CardTitle className={'flex flex-row justify-between'}><p>{strategy.name}</p>
          <a href={strategy.documentation} className={'text-sm underline text-accent-foreground'}
             target='_blank'>Documentation</a></CardTitle>
        <CardDescription>{strategy.description}</CardDescription>
      </CardHeader>
      <CardContent
        className={cn('flex flex-row', strategy.oauth ? 'justify-between' : 'justify-start gap-x-6')}>
        Supports:
        <ul>
          {strategy.supports.login &&
            <li className={'flex flex-row items-center'} key={`${strategy.name}-login &&`}>
              <CheckIcon className={'w-4 h-4 mr-2'} /> Login
            </li>}
          {strategy.supports.register &&
            <li className={'flex flex-row items-center'} key={`${strategy.name}-register`}><CheckIcon
              className={'w-4 h-4 mr-2'} /> Register</li>}
        </ul>
        {strategy.oauth && (
          <>
            OAuth:
            <ul>
              {strategy.oauth?.redirect &&
                <li className={'flex flex-row items-center'} key={`${strategy.name}-redirect`}><CheckIcon
                  className={'w-4 h-4 mr-2'} /> Redirect
                </li>}
              {strategy.oauth?.native &&
                <li className={'flex flex-row items-center'} key={`${strategy.name}-native`}><CheckIcon
                  className={'w-4 h-4 mr-2'} /> Native
                </li>}
            </ul>
          </>
        )}
      </CardContent>
      <CardFooter className={'flex flex-row justify-end gap-x-2 pb-2'}>
        <Dialog>
          <DialogTrigger>
            <Button variant='outline'>
              Settings
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your account
                and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

      </CardFooter>
    </Card>
  );
};

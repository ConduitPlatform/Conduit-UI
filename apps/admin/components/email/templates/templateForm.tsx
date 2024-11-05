'use client';

import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import React, { ReactNode } from 'react';

export const TemplateForm = ({ children }: { children: ReactNode }) => {
  const form = useFormContext();
  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Name</FormLabel>
              <FormControl>
                <Input
                  title={'Template Name'}
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
          control={form.control}
          name="sender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sender</FormLabel>
              <FormControl>
                <Input
                  title={'Sender'}
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
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input
                  title={'Subject'}
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
      <FormField
        control={form.control}
        name="externalManaged"
        render={({ field }) => (
          <FormItem className="flex items-center space-x-3">
            <FormLabel>External Managed</FormLabel>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
      <Button type="submit">{children}</Button>
    </div>
  );
};

'use client';
import { ReactNode, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { UrlTagInput } from '@/components/ui/form-inputs/TagInputField';
import { ErrorPre } from '@/components/ui/error-pre';
import { useAlerts } from '@/components/providers/AlertProvider';
import { toast } from '@/lib/hooks/use-toast';
import { rhfZodResolver } from '@/lib/zod-form';
import { promoteTeamToRealm } from '@/lib/api/authentication';
import {
  buildPromoteBody,
  DEFAULT_REALM_POLICIES,
  DEFAULT_REALM_REGISTRATION,
  DEFAULT_REALM_STRATEGIES,
  promoteRealmSchema,
  REALM_SLUG_MESSAGE,
  suggestRealmSlug,
  type PromoteRealmFormValues,
} from '@/lib/authentication/realms';
import type { Team } from '@/lib/models/Team';
import {
  HOME_STRATEGIES,
  OAUTH_PROVIDERS,
} from '@/components/authentication/teams/manageTeam/realm/realmStrategies.config';
import { RealmSwitchRow } from '@/components/authentication/teams/manageTeam/realm/RealmSwitchRow';

export function PromoteRealmSheet({
  team,
  memberCount,
  children,
}: Readonly<{
  team: Team;
  memberCount: number;
  children: ReactNode;
}>) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const { addAlert } = useAlerts();

  const form = useForm<PromoteRealmFormValues>({
    resolver: rhfZodResolver(promoteRealmSchema),
    mode: 'onChange',
    defaultValues: {
      slug: suggestRealmSlug(team.name),
      active: true,
      // Every provider row needs a boolean up front: a checkbox registered with an
      // undefined value fails the schema and silently blocks the submit.
      strategies: {
        ...DEFAULT_REALM_STRATEGIES,
        oauth: Object.fromEntries(
          OAUTH_PROVIDERS.map(provider => [provider.key, { enabled: false }])
        ),
      },
      registration: DEFAULT_REALM_REGISTRATION,
      policies: DEFAULT_REALM_POLICIES,
    },
  });
  const { control, watch, handleSubmit, formState } = form;
  const strategies = watch('strategies');
  const noMethod =
    !HOME_STRATEGIES.some(s => strategies[s.key]?.enabled) &&
    !OAUTH_PROVIDERS.some(p => strategies.oauth?.[p.key]?.enabled);

  const showError = (title: string, message: string) =>
    toast({
      title,
      description: <ErrorPre>{message}</ErrorPre>,
      variant: 'destructive',
    });

  const promote = async (values: PromoteRealmFormValues) => {
    setPending(true);
    try {
      const result = await promoteTeamToRealm(
        team._id,
        buildPromoteBody(values)
      );
      if (!result.ok) {
        switch (result.code) {
          case 'REALM_SLUG_TAKEN':
            form.setError(
              'slug',
              { type: 'server', message: 'This slug is already taken.' },
              { shouldFocus: true }
            );
            break;
          case 'REALM_NESTED':
            showError('A realm cannot be nested', result.message);
            break;
          case 'GUESTS_NOT_ALLOWED':
            // The message lists the members that would become disallowed guests.
            showError('Guests are not allowed', result.message);
            break;
          default:
            showError('Failed to create realm', result.message);
        }
        return;
      }
      toast({
        title: 'Realm created',
        description: `${team.name} is now the realm ${values.slug}.`,
      });
      setOpen(false);
      router.refresh();
    } catch (error) {
      showError(
        'Failed to create realm',
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      setPending(false);
    }
  };

  const onSubmit = (values: PromoteRealmFormValues) => {
    addAlert({
      title: `Make ${team.name} a realm?`,
      description: `${memberCount} existing ${
        memberCount === 1
          ? 'member becomes a home user'
          : 'members become home users'
      } of "${values.slug}" and can only sign in there from now on. Members who already belong to another realm become guests instead. Sign-in methods are replaced by the ones you selected.`,
      cancelText: 'Cancel',
      actionText: 'Make realm',
      onDecision: cancel => {
        if (!cancel) void promote(values);
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="overflow-y-auto sm:max-w-md">
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <SheetHeader>
              <SheetTitle>Make this team a realm</SheetTitle>
              <SheetDescription>
                {memberCount} existing{' '}
                {memberCount === 1
                  ? 'member becomes a home user'
                  : 'members become home users'}
                . You can change everything below afterwards, except the slug.
              </SheetDescription>
            </SheetHeader>

            <FormField
              control={control}
              name="slug"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="font-mono"
                      placeholder="acme"
                      autoComplete="off"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Clients send this to sign in to the realm.{' '}
                    {REALM_SLUG_MESSAGE}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 text-sm font-medium">
                Sign-in methods
              </legend>
              {HOME_STRATEGIES.map(strategy => (
                <FormField
                  key={strategy.key}
                  control={control}
                  name={`strategies.${strategy.key}.enabled`}
                  render={({ field }) => (
                    <StrategyCheckbox
                      id={`promote-strategy-${strategy.key}`}
                      label={strategy.name}
                      description={strategy.description}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              ))}
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                Social providers (use the global credentials)
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {OAUTH_PROVIDERS.map(provider => (
                  <FormField
                    key={provider.key}
                    control={control}
                    name={`strategies.oauth.${provider.key}.enabled`}
                    render={({ field }) => (
                      <StrategyCheckbox
                        id={`promote-oauth-${provider.key}`}
                        label={provider.name}
                        checked={field.value === true}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                ))}
              </div>
              {noMethod && (
                <p
                  role="status"
                  className="rounded-md bg-callout-warning-muted px-3 py-2 text-xs text-callout-warning-foreground"
                >
                  No sign-in method selected. Nobody will be able to sign in to
                  this realm until you enable one.
                </p>
              )}
            </fieldset>

            <Separator />
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 text-sm font-medium">Policies</legend>
              <Controller
                control={control}
                name="policies.requireTwoFa"
                render={({ field }) => (
                  <RealmSwitchRow
                    id="promote-policy-2fa"
                    label="Require 2FA"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="policies.requireVerifiedEmail"
                render={({ field }) => (
                  <RealmSwitchRow
                    id="promote-policy-verified-email"
                    label="Require verified email"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="policies.guests.allowed"
                render={({ field }) => (
                  <RealmSwitchRow
                    id="promote-policy-guests"
                    label="Allow guests"
                    description="Users whose home is elsewhere can be added as guests."
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <UrlTagInput
                name="policies.allowedClientIds"
                label="Allowed client ids"
                description="Leave empty to allow any client."
                placeholder="Type a client id and press Enter..."
              />
            </fieldset>

            <SheetFooter>
              <Button type="submit" disabled={pending || !formState.isValid}>
                Make this team a realm
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

function StrategyCheckbox({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: Readonly<{
  id: string;
  label: string;
  description?: string;
  checked: boolean | undefined;
  onCheckedChange: (checked: boolean) => void;
}>) {
  return (
    <div className="flex flex-row items-start gap-2">
      <Checkbox
        id={id}
        checked={checked === true}
        onCheckedChange={value => onCheckedChange(value === true)}
        className="mt-0.5"
      />
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

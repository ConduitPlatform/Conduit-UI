'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  hasFilter,
  type UserAdminCapabilities,
} from '@/lib/authentication/userCapabilities';
import {
  providerLabel,
  type UserListPatch,
  type UserListQuery,
} from '@/lib/authentication/userListParams';
import {
  HOME_REALM_ALL,
  HOME_REALM_GLOBAL,
  homeRealmParamToFilter,
} from '@/lib/authentication/realmMembers';

const ALL = 'all';

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
}>) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-40" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function UserFilters({
  search,
  onSearchChange,
  query,
  capabilities,
  providers,
  realmsEnabled,
  realmSlugs,
  onPatch,
}: Readonly<{
  search: string;
  onSearchChange: (value: string) => void;
  query: UserListQuery;
  capabilities: UserAdminCapabilities;
  providers: readonly string[];
  realmsEnabled: boolean;
  realmSlugs: ReadonlyMap<string, string>;
  onPatch: (patch: UserListPatch) => void;
}>) {
  const providerOptions =
    query.provider && !providers.includes(query.provider)
      ? [...providers, query.provider]
      : [...providers];
  const anonymousOptions = [
    { value: ALL, label: 'All accounts' },
    { value: 'only', label: 'Only anonymous' },
    ...(hasFilter(capabilities, 'isAnonymousExclusive')
      ? [{ value: 'hide', label: 'Hide anonymous' }]
      : []),
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        placeholder="Search"
        aria-label="Search users"
        className="w-44"
        value={search}
        onChange={event => onSearchChange(event.target.value)}
      />
      <FilterSelect
        label="Status"
        value={
          query.isActive === undefined
            ? ALL
            : query.isActive
              ? 'active'
              : 'blocked'
        }
        onChange={value =>
          onPatch({
            isActive: value === ALL ? null : value === 'active',
          })
        }
        options={[
          { value: ALL, label: 'All statuses' },
          { value: 'active', label: 'Active' },
          { value: 'blocked', label: 'Blocked' },
        ]}
      />
      {hasFilter(capabilities, 'isVerified') && (
        <FilterSelect
          label="Verified"
          value={
            query.isVerified === undefined
              ? ALL
              : query.isVerified
                ? 'verified'
                : 'unverified'
          }
          onChange={value =>
            onPatch({
              isVerified: value === ALL ? null : value === 'verified',
            })
          }
          options={[
            { value: ALL, label: 'All verification' },
            { value: 'verified', label: 'Verified' },
            { value: 'unverified', label: 'Unverified' },
          ]}
        />
      )}
      {hasFilter(capabilities, 'hasTwoFA') && (
        <FilterSelect
          label="2FA"
          value={
            query.hasTwoFA === undefined ? ALL : query.hasTwoFA ? 'on' : 'off'
          }
          onChange={value =>
            onPatch({
              hasTwoFA: value === ALL ? null : value === 'on',
            })
          }
          options={[
            { value: ALL, label: 'All 2FA' },
            { value: 'on', label: '2FA on' },
            { value: 'off', label: '2FA off' },
          ]}
        />
      )}
      <FilterSelect
        label="Anonymous"
        value={
          query.isAnonymous === undefined
            ? ALL
            : query.isAnonymous
              ? 'only'
              : 'hide'
        }
        onChange={value =>
          onPatch({
            isAnonymous: value === ALL ? null : value === 'only',
          })
        }
        options={anonymousOptions}
      />
      <FilterSelect
        label="Provider"
        value={query.provider ?? ALL}
        onChange={value => onPatch({ provider: value === ALL ? null : value })}
        options={[
          { value: ALL, label: 'All providers' },
          ...providerOptions.map(provider => ({
            value: provider,
            label: providerLabel(provider),
          })),
        ]}
      />
      {realmsEnabled && (
        <FilterSelect
          label="Home realm filter"
          value={homeRealmParamToFilter(query.homeRealm)}
          onChange={value =>
            onPatch({
              homeRealm: value === HOME_REALM_ALL ? null : value,
            })
          }
          options={[
            { value: HOME_REALM_ALL, label: 'All home realms' },
            { value: HOME_REALM_GLOBAL, label: 'Global' },
            ...Array.from(realmSlugs, ([id, slug]) => ({
              value: id,
              label: slug,
            })),
          ]}
        />
      )}
    </div>
  );
}

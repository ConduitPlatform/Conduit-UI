export const dynamic = 'force-dynamic';

import { getAuthenticationSettings, getRealms } from '@/lib/api/authentication';
import {
  REALM_COUNT_CAP,
  countRealmsEnablingStrategy,
  realmsEnabled,
} from '@/lib/authentication/realms';
import React from 'react';
import { StrategyCard } from '@/components/authentication/strategies/StrategyCard';
import strategyMap from '@/components/authentication/strategies/stategyMap.config';
import { StrategyList } from '@/components/authentication/strategies/StrategyList';
import { isStrategyEnabled } from '@/components/authentication/strategies/strategy-config';
import {
  PageHeader,
  PageTitle,
  PageActions,
} from '@/components/ui/page-header';

const strategyKeys = Object.keys(strategyMap);

export default async function Strategies() {
  const { config } = await getAuthenticationSettings();

  // Realms only exist behind the flag: with it off there is no extra request.
  let realmCounts = new Map<string, number>();
  // More realms than were loaded: the counts are lower bounds ("100+").
  let realmCountsCapped = false;
  if (realmsEnabled(config)) {
    try {
      const { realms, count } = await getRealms(0, REALM_COUNT_CAP);
      realmCounts = countRealmsEnablingStrategy(realms);
      realmCountsCapped = count > realms.length;
    } catch {
      // The footnote is informational: never block the page on it.
    }
  }

  const enabledStrategies = strategyKeys
    .filter(key => isStrategyEnabled(config, key))
    .sort((a, b) => strategyMap[a].name.localeCompare(strategyMap[b].name));

  const availableStrategies = strategyKeys
    .filter(key => !isStrategyEnabled(config, key))
    .sort((a, b) => strategyMap[a].name.localeCompare(strategyMap[b].name))
    .map(strategy => ({
      ...strategyMap[strategy],
      key: strategy,
    }));

  return (
    <div className={'flex flex-col'}>
      <PageHeader className="border-b py-2">
        <PageTitle>Active Strategies</PageTitle>
        <PageActions>
          <StrategyList
            strategies={availableStrategies}
            realmCounts={Object.fromEntries(realmCounts)}
            realmCountsCapped={realmCountsCapped}
          />
        </PageActions>
      </PageHeader>
      <div className={'grid grid-cols-6 gap-3 py-5'}>
        {enabledStrategies.map(strategy => (
          <StrategyCard
            key={strategy}
            strategy={{
              ...strategyMap[strategy],
              data: config[strategy as keyof typeof config],
              key: strategy,
            }}
            realmCount={realmCounts.get(strategy) ?? 0}
            realmCountCapped={realmCountsCapped}
          />
        ))}
      </div>
    </div>
  );
}

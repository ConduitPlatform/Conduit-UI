export const dynamic = 'force-dynamic';

import { getAuthenticationSettings } from '@/lib/api/authentication';
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
          <StrategyList strategies={availableStrategies} />
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
          />
        ))}
      </div>
    </div>
  );
}

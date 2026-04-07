export const dynamic = 'force-dynamic';

import { getAuthenticationSettings } from '@/lib/api/authentication';
import { Button } from '@/components/ui/button';
import React from 'react';
import { AuthenticationConfig } from '@/lib/models/authentication';
import { StrategyCard } from '@/components/authentication/strategies/StrategyCard';
import strategyMap from '@/components/authentication/strategies/stategyMap.config';
import { StrategyList } from '@/components/authentication/strategies/StrategyList';
import {
  PageHeader,
  PageTitle,
  PageActions,
} from '@/components/ui/page-header';

export default async function Strategies() {
  const { config } = await getAuthenticationSettings();
  const enabledStrategies = Object.keys(config)
    .filter(
      option =>
        strategyMap.hasOwnProperty(option) &&
        config[option as keyof AuthenticationConfig].hasOwnProperty(
          'enabled'
        ) &&
        // @ts-ignore
        config[option as keyof AuthenticationConfig].enabled
    )
    .sort((a, b) => {
      if (strategyMap[a].name < strategyMap[b].name) return -1;
      if (strategyMap[a].name > strategyMap[b].name) return 1;
      return 0;
    });
  const availableStrategies = Object.keys(config)
    .filter(
      option =>
        strategyMap.hasOwnProperty(option) &&
        (!config[option as keyof AuthenticationConfig].hasOwnProperty(
          'enabled'
        ) ||
          // @ts-ignore
          !config[option as keyof AuthenticationConfig].enabled)
    )
    .sort((a, b) => {
      if (strategyMap[a].name < strategyMap[b].name) return -1;
      if (strategyMap[a].name > strategyMap[b].name) return 1;
      return 0;
    })
    .map(strategy => {
      return {
        ...strategyMap[strategy],
        key: strategy,
      };
    });
  return (
    <div className={'flex flex-col'}>
      <PageHeader className="border-b py-2">
        <PageTitle>Active Strategies</PageTitle>
        <PageActions>
          <StrategyList strategies={availableStrategies}>
            <Button variant="outline">Add Strategy</Button>
          </StrategyList>
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

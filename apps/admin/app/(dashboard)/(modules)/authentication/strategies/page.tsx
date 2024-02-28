import { getAuthenticationSettings } from '@/lib/api/authentication';
import { Button } from '@/components/ui/button';
import React from 'react';
import { AuthenticationConfig } from '@/lib/models/authentication';
import strategyMap from '@/app/(dashboard)/(modules)/authentication/strategies/stategyMap';
import { StrategyCard } from '@/components/authentication/strategies/StrategyCard';

export default async function Strategies({
                                           searchParams,
                                         }: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { config } = await getAuthenticationSettings();
  return (
    <div className={'flex flex-col'}>
      <div className={'flex flex-row justify-between border-b py-2'}>
        <h1> Active Strategies</h1>
        <Button variant='outline'>Add Strategy</Button>
      </div>
      <div className={'grid grid-cols-6 gap-3 py-5'}>
        {Object.keys(config)
          .filter(option => strategyMap.hasOwnProperty(option) &&
            config[option as keyof AuthenticationConfig].hasOwnProperty('enabled') &&
            // @ts-ignore
            config[option as keyof AuthenticationConfig].enabled)
          .sort((a, b) => {
            if (strategyMap[a].name < strategyMap[b].name) return -1;
            if (strategyMap[a].name > strategyMap[b].name) return 1;
            return 0;
          })
          .map((strategy) => <StrategyCard strategy={strategyMap[strategy]} />)}
      </div>
    </div>
  );
}

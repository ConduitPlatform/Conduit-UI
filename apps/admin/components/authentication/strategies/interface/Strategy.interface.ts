import { StrategyFormProps } from '@/components/authentication/strategies/interface/StrategyFormProps.interface';
import React from 'react';

export type StrategyInterface = {
  key?: string;
  name: string;
  description: string;
  supports: {
    login: boolean;
    register: boolean;
  };
  oauth?: {
    redirect: boolean;
    native: boolean;
  };
  documentation: string;
  data?: any;
  form?: React.FC<StrategyFormProps<any>>;
}

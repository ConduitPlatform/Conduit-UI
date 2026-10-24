'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Module } from '@/lib/models/Module';
import { getModules } from '@/lib/api/modules';
import { getModuleHealthMap } from '@/lib/prometheus/metrics';
import {
  isModuleAvailable as checkModuleAvailable,
  isModuleServing as checkModuleServing,
} from '@/lib/utils/module-utils';
import type { HealthStatus } from '@/lib/status';

interface ModuleAvailabilityContextType {
  modules: Module[];
  isLoading: boolean;
  isModuleAvailable: (moduleName: string) => boolean;
  isModuleServing: (moduleName: string) => boolean;
  getModuleHealth: (moduleName: string) => HealthStatus | undefined;
}

const ModuleAvailabilityContext = createContext<
  ModuleAvailabilityContextType | undefined
>(undefined);

export function ModuleAvailabilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [healthMap, setHealthMap] = useState<Record<string, HealthStatus>>({});

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const availableModules = await getModules();
        setModules(availableModules);

        getModuleHealthMap(availableModules)
          .then(map => setHealthMap(map))
          .catch(() => {});
      } catch (error) {
        console.error('Failed to fetch modules:', error);
        setModules([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModules();
  }, []);

  const isModuleAvailable = (moduleName: string): boolean => {
    return checkModuleAvailable(modules, moduleName);
  };

  const isModuleServing = (moduleName: string): boolean => {
    return checkModuleServing(modules, moduleName);
  };

  const getModuleHealth = (moduleName: string): HealthStatus | undefined => {
    return healthMap[moduleName];
  };

  const value: ModuleAvailabilityContextType = {
    modules,
    isLoading,
    isModuleAvailable,
    isModuleServing,
    getModuleHealth,
  };

  return (
    <ModuleAvailabilityContext.Provider value={value}>
      {children}
    </ModuleAvailabilityContext.Provider>
  );
}

export function useModuleAvailability() {
  const context = useContext(ModuleAvailabilityContext);
  if (context === undefined) {
    throw new Error(
      'useModuleAvailability must be used within a ModuleAvailabilityProvider'
    );
  }
  return context;
}

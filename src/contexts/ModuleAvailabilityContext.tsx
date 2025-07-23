'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Module } from '@/lib/models/Module';
import { getModules } from '@/lib/api/modules';

interface ModuleAvailabilityContextType {
  modules: Module[];
  isLoading: boolean;
  isModuleAvailable: (moduleName: string) => boolean;
  isModuleServing: (moduleName: string) => boolean;
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

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const availableModules = await getModules();
        setModules(availableModules);
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
    return modules.some(module => module.moduleName === moduleName);
  };

  const isModuleServing = (moduleName: string): boolean => {
    return modules.some(
      module => module.moduleName === moduleName && module.serving
    );
  };

  const value: ModuleAvailabilityContextType = {
    modules,
    isLoading,
    isModuleAvailable,
    isModuleServing,
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

'use client';

import * as React from 'react';

export type PendingNavigation = () => void;

export interface QueryWorkspaceContextValue {
  selectedQueryId?: string;
  isDirty: boolean;
  setDirty: (dirty: boolean) => void;
  requestNavigation: (navigate: PendingNavigation) => void;
  refreshQueries: () => Promise<void>;
  requestDelete: (id: string, name: string) => void;
  closeListSheet: () => void;
}

const QueryWorkspaceContext =
  React.createContext<QueryWorkspaceContextValue | null>(null);

export function QueryWorkspaceProvider({
  value,
  children,
}: {
  value: QueryWorkspaceContextValue;
  children: React.ReactNode;
}) {
  return (
    <QueryWorkspaceContext.Provider value={value}>
      {children}
    </QueryWorkspaceContext.Provider>
  );
}

export function useQueryWorkspace() {
  const ctx = React.useContext(QueryWorkspaceContext);
  if (!ctx) {
    throw new Error(
      'useQueryWorkspace must be used within QueryWorkspaceProvider'
    );
  }
  return ctx;
}

export function useQueryWorkspaceOptional() {
  return React.useContext(QueryWorkspaceContext);
}

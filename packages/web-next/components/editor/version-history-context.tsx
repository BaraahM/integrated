
'use client';

import React, { createContext, useContext } from 'react';

import { useVersionHistory } from '@/hooks/use-version-history';

type VersionHistoryContextType = ReturnType<typeof useVersionHistory>;

const VersionHistoryContext = createContext<VersionHistoryContextType | null>(null);

export function VersionHistoryProvider({ children }: { children: React.ReactNode }) {
  const versionHistory = useVersionHistory();
  
  return (
    <VersionHistoryContext.Provider value={versionHistory}>
      {children}
    </VersionHistoryContext.Provider>
  );
}

export function useVersionHistoryContext() {
  const context = useContext(VersionHistoryContext);
  if (!context) {
    throw new Error('useVersionHistoryContext must be used within a VersionHistoryProvider');
  }
  return context;
}

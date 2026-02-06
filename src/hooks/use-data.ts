'use client';
import { useContext } from 'react';
import { DataContext, type DataContextState } from '@/contexts/data-context';

export const useData = (): DataContextState => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

'use client';
import { useContext } from 'react';
import { AboutContext, type AboutContextState } from '@/contexts/about-context';

export const useAbout = (): AboutContextState => {
  const context = useContext(AboutContext);
  if (context === undefined) {
    throw new Error('useAbout must be used within an AboutProvider');
  }
  return context;
};



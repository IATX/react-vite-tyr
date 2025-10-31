// src/context/BreadcrumbContext.tsx
import React, { createContext, useState, useContext, type ReactNode } from 'react';

export type BreadcrumbItem = {
  name: string;
  url?: string;
};

interface BreadcrumbContextType {
  defaultActiveItemId: string;
  setDefaultActiveItemId: (defaultItemId: string) => void;
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (newBreadcrumbs: BreadcrumbItem[]) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export const useBreadcrumbs = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumbs must be used within a BreadcrumbProvider');
  }
  return context;
};

export const BreadcrumbProvider = ({ children }: { children: ReactNode }) => {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [defaultActiveItemId, setDefaultActiveItemId] = useState<string>('');
  return (
    <BreadcrumbContext.Provider value={{ defaultActiveItemId, setDefaultActiveItemId, breadcrumbs, setBreadcrumbs }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};
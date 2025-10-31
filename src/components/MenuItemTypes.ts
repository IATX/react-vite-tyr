// types.ts
import { type ReactNode } from 'react';

export interface MenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  children?: MenuItem[];
}
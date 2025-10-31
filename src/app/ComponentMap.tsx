// src/components/ComponentMap.tsx
import React from 'react';

// Import all dynamic routing page components

// Define the component mapping interface, the key is a string and the value is the React component type
export type ComponentType = 'view' | 'query' | 'other';

export interface IComponentItem {
  elem: React.ReactNode;
  type: ComponentType;
  path?: string;
}

export interface IComponentMap {
  [key: string]: IComponentItem;
}

// Define a mapping object containing all dynamic routing components
const componentMap: IComponentMap = {
		
};

export default componentMap;
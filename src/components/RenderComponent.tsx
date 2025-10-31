import React, { type ReactElement } from 'react';
import componentMap from '../app/ComponentMap';

export default function Parameterization<T extends object>(
    componentName: string,
    props?: T
  ): React.ReactElement | null {
    const componentInfo = componentMap[componentName];

    // Check if componentInfo exists
    if (!componentInfo) {
      console.warn(`Component with name '${componentName}' not found.`);
      return null;
    }

    // Checks if elem is a valid React element
    if (React.isValidElement(componentInfo.elem)) {
      // Explicitly tell TypeScript that elem is a ReactElement<any>
      // This solves the type mismatch problem
      const element = componentInfo.elem as ReactElement<any>;

      // Clone the element and inject props
      return React.cloneElement<T>(element, props);
    }

    // If elem is not a valid element, returns null.
    return null;
  }
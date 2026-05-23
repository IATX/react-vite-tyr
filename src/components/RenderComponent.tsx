import React, { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import componentMap from '../app/ComponentMap';

const InlineFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
    <CircularProgress size={16} />
  </Box>
);

export default function Parameterization<T extends object>(
  componentName: string,
  props?: T
): React.ReactElement | null {
  const componentInfo = componentMap[componentName];

  if (!componentInfo) {
    console.warn(`Component '${componentName}' not found.`);
    return null;
  }

  const Comp = componentInfo.elem;
  return (
    <Suspense fallback={<InlineFallback />}>
      <Comp {...(props as any)} />
    </Suspense>
  );
}

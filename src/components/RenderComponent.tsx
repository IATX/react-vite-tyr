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
  // key 不能通过展开传入 JSX，需单独提取后直接作为 key 传递
  const { key, ...restProps } = (props ?? {}) as any;
  return (
    <Suspense fallback={<InlineFallback />}>
      <Comp key={key} {...restProps} />
    </Suspense>
  );
}

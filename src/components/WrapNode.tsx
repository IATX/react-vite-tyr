import React, { Suspense, type ReactNode } from 'react';
import { Box, CircularProgress } from '@mui/material';

type AnyComponent = React.ComponentType<any>;

const LazyFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
    <CircularProgress size={24} />
  </Box>
);

export function WrapRouteFormNode(Comp: AnyComponent): ReactNode {
  return (
    <div className='bg-white mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8'>
      <Suspense fallback={<LazyFallback />}>
        <Comp />
      </Suspense>
    </div>
  );
}

export function WrapRouteTableNode(Comp: AnyComponent): ReactNode {
  return (
    <div className='bg-white mx-auto p-4'>
      <Suspense fallback={<LazyFallback />}>
        <Comp />
      </Suspense>
    </div>
  );
}

export function WrapSoloFormNode(elem: ReactNode): ReactNode {
  return (
    <div className="bg-white">
      {elem}
    </div>
  );
}

export function WrapRouteOtherNode(Comp: AnyComponent): ReactNode {
  return (
    <div>
      <Suspense fallback={<LazyFallback />}>
        <Comp />
      </Suspense>
    </div>
  );
}

export function WrapRouteHubNode(Comp: AnyComponent): ReactNode {
  return (
    <div>
      <Suspense fallback={<LazyFallback />}>
        <Comp />
      </Suspense>
    </div>
  );
}
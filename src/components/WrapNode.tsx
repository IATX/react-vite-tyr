import React, { type ReactNode } from 'react';

export function WrapRouteFormNode(elem: ReactNode): ReactNode {
  return (
    <div className='bg-white mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8'>
      <div className="mx-auto max-w-2xl">
        {elem}
      </div>
    </div>
  );
}

export function WrapRouteTableNode(elem: ReactNode): ReactNode {
  return (
    <div className='bg-white mx-auto p-4'>
      {elem}
    </div>
  );
}

export function WrapSoloFormNode(elem: ReactNode): ReactNode {
  return (
    <div className="bg-white mx-auto max-w-2xl">
      {elem}
    </div>
  );
}
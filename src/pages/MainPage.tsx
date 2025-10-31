import { useEffect } from 'react';

import { useBreadcrumbs } from '../context/BreadcrumbContext';

export default function MainPage() {
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([]);
  }, []);

  return (
    <>Default main page...</>
  )
}

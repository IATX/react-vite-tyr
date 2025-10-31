import { useEffect } from 'react';

import { useBreadcrumbs } from '../context/BreadcrumbContext';

export default function DashboardPage() {
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{
      name: 'Dashboard',
      url: '/main/dashboard'
    }]);
  }, []);

  return (
    <></>
  )
}

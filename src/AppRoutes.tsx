import React, { useContext, useMemo, useRef } from 'react';
import { useRoutes, type RouteObject } from 'react-router-dom';
import { AppContext } from './context/AppContext';
import { Box, LinearProgress, Typography } from '@mui/material';
import type { IRouteConfig } from './utils/generateRoutes';

// 1. 抽离转换函数
const convertConfigToRoutes = (routes: IRouteConfig[]): RouteObject[] => {
  return routes.map((route) => ({
    path: route.path,
    element: route.element,
    index: route.index,
    children: route.children ? convertConfigToRoutes(route.children) : undefined,
  })) as RouteObject[];
};

function LinearProgressWithTopLabel({ label }: { label: string }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', pt: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{label}</Typography>
      <Box sx={{ width: '100%'}}><LinearProgress /></Box>
    </Box>
  );
}

// 2. 路由渲染组件
const RouteRenderer = React.memo(({ routes }: { routes: IRouteConfig[] }) => {
  const routeObjects = useMemo(() => {
    console.log("[Performance] Route tree transformation");
    return convertConfigToRoutes(routes);
  }, [routes]);

  const element = useRoutes(routeObjects);
  return <>{element}</>;
});

function AppRoutes() {
  // 从 Context 获取数据
  const contextData = useContext(AppContext);
  const { appRoutes, loading } = contextData;

  const renderCount = useRef(0);
  renderCount.current++;

  // 核心优化：使用 useMemo 锁定渲染结果
  // 只要loading 状态没变，下面的结果就不会重新计算
  return useMemo(() => {
    console.log(`[AppRoutes] Trigger UI update---rendering`);

    if (loading) {
      return (
        <LinearProgressWithTopLabel label="Initializing necessary system resources..." />
      );
    }

    if (!appRoutes || appRoutes.length === 0) {
      return null;
    }

    const root = document.getElementById('root');
    if (root && root.hasAttribute('inert')) {
      root.removeAttribute('inert');
    }

    return (
      <Box sx={{ width: '100%', height: '100%', pointerEvents: 'auto' }}>
        <RouteRenderer routes={appRoutes} />
      </Box>
    );
  }, [appRoutes, loading]);
}

export default AppRoutes;
// src/AppRoutes.tsx
import React, { useContext } from 'react';
import { useRoutes, type RouteObject } from 'react-router-dom';
import { AppContext } from './context/AppContext';
import { Box, LinearProgress, Typography } from '@mui/material';
import type { IRouteConfig } from './utils/generateRoutes';

interface LinearProgressWithTopLabelProps {
  label: string;
}

function LinearProgressWithTopLabel({ label }: LinearProgressWithTopLabelProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    </Box>
  );
}

function AppRoutes() {
  const { appRoutes, loading } = useContext(AppContext);

  const convertToRouteObjects = (routes: IRouteConfig[]): RouteObject[] => {
    return routes.map(route => {
      const routeObject: RouteObject = {
        path: route.path,
        element: route.element,
        index: route.index,
      };

      if (route.children) {
        // Recursively convert children if they exist
        routeObject.children = convertToRouteObjects(route.children);
      }

      return routeObject;
    });
  };

  // Show a loading indicator while routes are being fetched
  if (loading) {
    return <>
      <LinearProgressWithTopLabel label="Initializing necessary system resources..." />
    </>

    // return <div></div>;
  }

  // If routes are not yet initialized, useRoutes will return null
  const element = useRoutes(convertToRouteObjects(appRoutes || []));

  return element;
}

export default AppRoutes;
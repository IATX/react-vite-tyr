import { useContext, useEffect } from 'react';

import { useBreadcrumbs } from '../context/BreadcrumbContext';

import { ThemeProvider } from "@emotion/react";
import theme from "../theme/tyr";
import { Box, Card, CardContent, Grid, Paper, Stack, styled, Typography } from "@mui/material";
import React from "react";

import { AppContext } from '../context/AppContext';
import { WrapRouteFormNode, WrapRouteTableNode } from '../components/WrapNode';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  boxShadow: 'unset',
  textAlign: 'left',
  color: (theme.vars ?? theme).palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));

type ContentType = 'view' | 'query' | 'other' | 'blank';

export interface BayContentProp {
  title: string,
  subheader: string,
  elem: React.ReactNode | null
  type: ContentType
}

export default function AppTrayPage() {
  const { setBreadcrumbs, setDefaultActiveItemId } = useBreadcrumbs();

  const { currentBayContent } = useContext(AppContext);

  useEffect(() => {
    setBreadcrumbs([]);
    setDefaultActiveItemId('');
  }, []);

  return (
    <>
      {/* Main Content */}
      <ThemeProvider theme={theme}>
        <Box>
          {currentBayContent?.type === 'query' ? (
            WrapRouteTableNode(currentBayContent.elem)
          ) : currentBayContent?.type === 'view' ? (
            WrapRouteFormNode(currentBayContent.elem)
          ) : (
            null
          )}
        </Box>
      </ThemeProvider>
    </>
  )
}

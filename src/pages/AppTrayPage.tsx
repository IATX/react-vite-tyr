import { useContext, useEffect } from 'react';

import { useBreadcrumbs } from '../context/BreadcrumbContext';

import { ThemeProvider } from "@emotion/react";
import theme from "../theme/tyr";
import { Box } from "@mui/material";
import React from "react";

import { AppContext } from '../context/AppContext';
import { WrapRouteFormNode, WrapRouteTableNode, WrapRouteHubNode } from '../components/WrapNode';

type ContentType = 'view' | 'query' | 'hub' | 'other' | 'blank';

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
    // setBreadcrumbs([]);
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
          ) : currentBayContent?.type === 'hub' ? (
            WrapRouteHubNode(currentBayContent.elem)
          ) : (
            null
          )}
        </Box>
      </ThemeProvider>
    </>
  )
}

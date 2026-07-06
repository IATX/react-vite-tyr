import { useContext, useRef } from 'react';

import { ThemeProvider } from "@emotion/react";
import theme from "../theme/tyr";
import { Box } from "@mui/material";
import React from "react";

import { AppContext } from '../context/AppContext';
import { WrapRouteFormNode, WrapRouteTableNode, WrapRouteOtherNode, WrapRouteHubNode } from '../components/WrapNode';

type ContentType = 'view' | 'query' | 'hub' | 'other' | 'blank';

// elem 可能是组件引用（LazyExoticComponent）或已渲染的 JSX element（来自 Parameterization）
type BayElem = React.ReactNode | React.LazyExoticComponent<React.ComponentType<any>> | null;

export interface BayContentProp {
  title: string,
  subheader: string,
  elem: BayElem
  type: ContentType
}

// WrapNode 函数只接受组件引用，需要区分两种情况
function renderBayContent(elem: BayElem, type: ContentType): React.ReactNode {
  if (!elem || type === 'blank') return null;

  if (React.isValidElement(elem)) {
    // 已经是渲染好的 JSX element，直接放入对应容器，不再尝试做 <Comp />
    switch (type) {
      case 'query':
        return <div className='bg-white mx-auto p-4'>{elem}</div>;
      case 'view':
        return <div className='bg-white mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8'>{elem}</div>;
      case 'hub':
      case 'other':
      default:
        return <div>{elem}</div>;
    }
  }

  // 组件引用，交给 WrapNode 包裹 Suspense 后渲染
  const Comp = elem as unknown as React.ComponentType<any>;
  switch (type) {
    case 'query': return WrapRouteTableNode(Comp);
    case 'view': return WrapRouteFormNode(Comp);
    case 'other': return WrapRouteOtherNode(Comp);
    case 'hub': return WrapRouteHubNode(Comp);
    default: return null;
  }
}

export default function AppTrayPage() {
  const { currentBayContent } = useContext(AppContext);

  // 每次 setCurrentBayContent 都会得到一个新的 currentBayContent 引用。
  // hub 页（WrapRouteHubNode 的 <div><Suspense>…）与二级页（<div>{elem}</div>）渲染出的
  // 顶层 div 处于 <Box> 的同一位置，React 会复用同一个 div 并只 diff 其子节点，
  // 在「运维明细→账单→查询」这类切换序列下会复用到陈旧子树，导致后续导航无反应。
  // 这里用一个随导航递增的 key 强制每次导航都重新挂载，彻底规避复用问题。
  const navKeyRef = useRef(0);
  const prevBayRef = useRef<BayContentProp | null | undefined>(undefined);
  if (prevBayRef.current !== currentBayContent) {
    prevBayRef.current = currentBayContent;
    navKeyRef.current += 1;
  }

  return (
    <>
      {/* Main Content */}
      <ThemeProvider theme={theme}>
        <Box>
          <React.Fragment key={navKeyRef.current}>
            {renderBayContent(currentBayContent?.elem ?? null, currentBayContent?.type ?? 'blank')}
          </React.Fragment>
        </Box>
      </ThemeProvider>
    </>
  )
}

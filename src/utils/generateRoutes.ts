import React from 'react';
import type { SvgIconProps } from '@mui/material';

import componentMap from '../app/ComponentMap';
import { WrapRouteFormNode, WrapRouteTableNode } from '../components/WrapNode';

export interface IRouteData {
  path: string;
  name: string;
  icon?: string;
  component?: string;
  children?: IRouteData[];
}

export interface IRouteConfig {
  path: string;
  element: React.ReactNode;
  exact?: boolean;
  index?: boolean;
  children?: IRouteConfig[];
}

export type IMenu = {
  id: string;
  label: string;
  url: string;
  icon: React.ElementType<SvgIconProps>;
  children?: IMenu[];
}

/**
 * 递归生成 React Router 路由配置
 * @param routesData 从后端获取的路由数据
 * @returns React Router 配置数组
 */
export function generateRoutes(routesData: IRouteData[]): IRouteConfig[] {


  return routesData.map((route: IRouteData) => {
    // 检查 componentMap 中是否存在对应的组件
    const Component = route.component ? componentMap[route.component] : null;

    if (!Component) {
      console.warn(`未找到名为 "${route.component}" 的组件，该路由将被忽略。`);
      return null;
    }

    let elementToRender: React.ReactNode;

    if (Component.type == 'query') {
      elementToRender = WrapRouteTableNode(Component.elem);
    } else if (Component.type == 'view') {
      elementToRender = WrapRouteFormNode(Component.elem);
    } if (Component.type == 'other') {
      elementToRender = Component.elem;
    }

    const routeConfig: IRouteConfig = {
      path: route.path,
      element: elementToRender,
    };

    // 如果存在子路由，则递归生成
    if (route.children && route.children.length > 0) {
      routeConfig.children = generateRoutes(route.children) as IRouteConfig[];
    }

    return routeConfig;
  }).filter(Boolean) as IRouteConfig[]; // 过滤掉 null 值
}
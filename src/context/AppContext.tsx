/* eslint-disable @typescript-eslint/no-unused-vars */
// src/context/AppContext.tsx
import React, { createContext, useState, useEffect, type ReactNode, type SetStateAction, type Dispatch, useRef } from 'react';

import { generateRoutes, type IRouteConfig, type IRouteData, type IMenu, type IHub } from '../utils/generateRoutes';
import { useSession } from '../authority/SessionContext';
import { useAlert } from '../components/AlertContext';
import axiosRequester, { requesterConfig } from '../components/AxiosRequester';
import componentMap from '../app/ComponentMap';

import SettingsPage from '../pages/SettingsPage.tsx';
import HomePage from '../HomePage';
import AppTrayPage, { type BayContentProp } from '../pages/AppTrayPage.tsx';
import DashboardForm from '../app/ilzpxj/hub/DashboardForm.tsx';
import LoginPage from '../LoginPage';
import NotFoundPage from '../pages/PageNotFound';
import UnauthorizedPage from '../pages/UnauthorizedPage.tsx';
import PrivateRoute from '../components/PrivateRoute.tsx';

import MchElecPrice from '../app/ilzpxj/hub/MerchantElectricPriceForm.tsx';

import SubtitlesOutlinedIcon from '@mui/icons-material/SubtitlesOutlined';
import LaptopWindowsOutlinedIcon from '@mui/icons-material/LaptopWindowsOutlined';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import MainLayout from '../layouts/MainLayout.tsx';
import SuccessPage from '../pages/SuccessPage.tsx';
import PrivilegeRoute from '../components/PrivilegeRoute.tsx';
import { useNavigate } from 'react-router-dom';
import { SessionManager } from '../authority/SessionManager.tsx';
import MainPage from '../pages/MainPage.tsx';

import { Dashboard, Storefront} from "@mui/icons-material";

// Define the context data type
interface IAppContext {
  appRoutes: IRouteConfig[] | null;
  appMenus: IMenu[] | null;
  appHubs: IHub[] | null;
  loading: boolean;
  fetchDynamicRoutes: (t: string) => Promise<void>;
  currentBayContent: BayContentProp | null;
  setCurrentBayContent: React.Dispatch<React.SetStateAction<BayContentProp>>;
}

// Create the context with default values
export const AppContext = createContext<IAppContext>({
  appMenus: null,
  appHubs: null,
  appRoutes: null,
  loading: true,
  fetchDynamicRoutes: async (t: string) => { console.log(t); },
  currentBayContent: null,
  setCurrentBayContent: (() => { }) as Dispatch<SetStateAction<BayContentProp>>
});

export const getTranslatedDashboardModule = () => {
  return {
    id: 'react_vite_tyr_dashboard',
    label: 'system.dashboard',
    url: '/main/dashboard',
    icon: DashboardRoundedIcon,
    children: []
  };
};

export const getTranslatedSettingsModule = () => {
  return {
    id: 'react_vite_tyr_settings',
    label: 'system.settings',
    url: '/main/settings',
    icon: SettingsOutlinedIcon,
    children: []
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const listModuleAndMenus = (menuList: any, routeArr: IRouteData[]): IMenu[] => {
  const resultArr: IMenu[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  menuList.forEach((menu: any) => {
    const menuItem = {
      icon: CodeOutlinedIcon,
      label: menu.name,
      url: '',
      id: menu.id,
      children: listModuleAndMenus(menu.menus, routeArr)
    };

    if (menu.component != null) {
      const menuRoute = {
        name: menu.name,
        path: '',
        component: menu.component,
        children: []
      };

      try {
        const menuUrlObj = JSON.parse(menu.url);

        menuRoute.path = menuUrlObj.url.replace(/\./g, "/");

        menuItem.url = menuRoute.path;
      } catch (error) {
        menuRoute.path = menu.url;

        menuItem.url = menu.url;
      }

      routeArr.push(menuRoute);
    }

    resultArr.push(menuItem);
  });

  return resultArr;
};

// The provider component
export default function AppProvider({ children }: { children: ReactNode }) {
  const { token, user, setUser, clearSession } = useSession();
  const { showAlert } = useAlert();
  const accApiUrl = import.meta.env.VITE_JET_ASP_ACC_API;
  const navigate = useNavigate();

  const [currentBayContent, setCurrentBayContent] = React.useState<BayContentProp>({
    title: 'Initial title',
    subheader: 'Initial header',
    elem: <>Initial content</>,
    type: 'blank'
  });

  const appRouteArr: IRouteData[] = [];

  const defaultRoutes: IRouteConfig[] = [
    { path: '/', element: <HomePage /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/success', element: <SuccessPage /> },
    { path: '/401', element: <UnauthorizedPage /> },
    {
      path: '/main',
      element: <MainLayout />,
      children: [
        { index: true, path: '', element: <PrivateRoute><MainPage /></PrivateRoute> },
        { path: 'trays', element: <PrivateRoute><AppTrayPage /></PrivateRoute> },
        { path: 'dashboard', element: <PrivateRoute><DashboardForm /></PrivateRoute> },
        { path: 'settings', element: <PrivilegeRoute><SettingsPage /></PrivilegeRoute> },
        { path: 'elecpricing', element: <PrivilegeRoute><MchElecPrice /></PrivilegeRoute> },
      ]
    },
    { path: '*', element: <NotFoundPage /> },
  ];

  Object.keys(componentMap).forEach(key => {
    const comp = componentMap[key];
    if (comp.path) {
      appRouteArr.push({
        name: key, path: comp.path, component: key
      });
    }
  });

  const [appRoutes, setAppRoutes] = useState<IRouteConfig[]>(defaultRoutes);
  const [appMenus, setAppMenus] = useState<IMenu[] | null>(null);
  const [appHubs, setAppHubs] = useState<IHub[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchDynamicRoutes = async (str: string) => {
    if (processingTokenRef.current === str) return;
    
    const menuArr: IMenu[] = [];
    const hubArr: IHub[] = [];

    // menuArr.push(getTranslatedDashboardModule());

    try {
      processingTokenRef.current = str; // 立即上锁

      // setLoading(true);
      const cfg = requesterConfig(str);
      cfg.useJson();
      const client = axiosRequester(cfg);

      const res = await client.post(accApiUrl + '/session/resources');

      if (!res.data.success) {
        showAlert('Failed to get module-menu', 'error');
        setAppRoutes(defaultRoutes);
      } else {
        const accUser = SessionManager.transform(res.data.data.user);
        const modules = res.data.data.modules;

        // Set the session content twice to prevent the state from being lost due to a browser refresh (avoiding storing too much session content in localstorage).
        if (SessionManager.isGuest(user)) {
          setUser(accUser);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        modules.forEach((module: any) => {
          const moduleRoute = {
            name: module.name,
            path: '',
            component: module.component,
            children: []
          };

          if (module.url != '') {
            try {
              const moduleUrlObj = JSON.parse(module.url);

              moduleRoute.path = moduleUrlObj.url.replace(/\./g, "/");
            } catch (error) {
              moduleRoute.path = module.url;
            }

            appRouteArr.push(moduleRoute);
          }

          menuArr.push({
            id: module.id,
            label: module.name,
            url: moduleRoute.path,
            icon: (module.menus.length > 0 ? SubtitlesOutlinedIcon : LaptopWindowsOutlinedIcon),
            children: listModuleAndMenus(module.menus, appRouteArr)
          });
        });

        if (SessionManager.isAdmin(accUser)) {
          menuArr.push(getTranslatedSettingsModule());
        }

        const dynamicRoutes = generateRoutes(appRouteArr);

        const layoutRoute: IRouteConfig = {
          path: '/main',
          element: <MainLayout />,
          children: dynamicRoutes,
        };

        const allRoutes = [...defaultRoutes, layoutRoute];
        setAppRoutes(allRoutes);

        setAppMenus(menuArr);

        // 待实现的hub功能加载过程，由后端返回hub功能页面定义参数，此处先mock测试数据。。
        hubArr.push({
          id: 'Dashboard',
          label: '数据看板',
          subtitle: '数据可视化总览',
          icon: <Dashboard />
        });

        hubArr.push({
          id: 'MchElecPrice',
          label: '商户电价管理',
          subtitle: '商户信息维护和电价方案配置',
          icon: <Storefront />
        });

        setAppHubs(hubArr);
      }
    } catch (error) {
      processingTokenRef.current = null;

      console.error('Error fetching dynamic routes:', error);

      if (error instanceof Error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const wrapError = error as { response?: { status: number, data: any } };
        if (wrapError.response?.status == 400) {
          showAlert('Bad format request', 'error');
        } else if (wrapError.response?.status == 401) {
          clearSession();
          showAlert(wrapError.response?.data, 'error');

          navigate('/login', { replace: true });
        } else {
          showAlert('Error fetching dynamic routes', 'error');
        }
      }

      setAppRoutes(defaultRoutes);
    } finally {
      setLoading(false);
    }
  };

  const processingTokenRef = useRef<string | null>(null);

  // 2. 监听 Token
  useEffect(() => {
    if (token) {
      // 只有当 token 真的变了（不仅仅是引用变了，而是字符串值变了），才执行
      if (processingTokenRef.current !== token) {
        fetchDynamicRoutes(token);
      }
    } else {
      // 处理没 token 的逻辑...
      processingTokenRef.current = null; 
      setLoading(false);
    }
  }, [token, fetchDynamicRoutes]);

  return (
    <AppContext.Provider value={{ appRoutes, appMenus, appHubs, loading, fetchDynamicRoutes, currentBayContent, setCurrentBayContent }}>
      {children}
    </AppContext.Provider>
  );
}

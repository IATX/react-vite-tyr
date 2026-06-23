/* eslint-disable @typescript-eslint/no-unused-vars */
// src/context/AppContext.tsx
import React, { createContext, useState, useEffect, useCallback, type ReactNode, type SetStateAction, type Dispatch, useRef } from 'react';

import { generateRoutes, type IRouteConfig, type IRouteData, type IMenu, type IHub } from '../utils/generateRoutes';
import { useSession } from '../authority/SessionContext';
import { useAlert } from '../components/AlertContext';
import axiosRequester, { requesterConfig } from '../components/AxiosRequester';
import componentMap from '../app/ComponentMap';

import SettingsPage from '../pages/SettingsPage.tsx';
import HomePage from '../HomePage';
import AppTrayPage, { type BayContentProp } from '../pages/AppTrayPage.tsx';
import DashboardForm from '../app/ilzpxj/hub/Dashboard.tsx';
import LoginPage from '../LoginPage';
import NotFoundPage from '../pages/PageNotFound';
import UnauthorizedPage from '../pages/UnauthorizedPage.tsx';
import PrivateRoute from '../components/PrivateRoute.tsx';

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

/**
 * 菜单项接口（支持递归嵌套）
 */
export interface MenuDataItem {
  id: string;
  name: string;
  descr: string;
  url: string;
  icon: string;
  sort: string;
  moduleId?: string; // 子菜单会有这个属性
  component: string | null;
  // 递归定义：菜单下面还可以有子菜单
  menus: MenuDataItem[];
}

export interface HubItem {
  id: string;
  name: string;
  descr: string;
  url: string;
  icon: string;
  sort: string;
  component: string | null;
}

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
      ]
    },
    { path: '*', element: <NotFoundPage /> },
  ];

  const [appRoutes, setAppRoutes] = useState<IRouteConfig[]>(defaultRoutes);
  const [appMenus, setAppMenus] = useState<IMenu[] | null>(null);
  const [appHubs, setAppHubs] = useState<IHub[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const processingTokenRef = useRef<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchDynamicRoutes = useCallback(async (str: string) => {
    const menuArr: IMenu[] = [];
    const hubArr: IHub[] = [];

    // Build the base routes from the static component map fresh on every call,
    // so repeated calls can never accumulate duplicate route entries.
    const appRouteArr: IRouteData[] = [];
    Object.keys(componentMap).forEach(key => {
      const comp = componentMap[key];
      if (comp.path) {
        appRouteArr.push({ name: key, path: comp.path, component: key });
      }
    });

    try {
      const cfg = requesterConfig(str);
      cfg.useJson();
      const client = axiosRequester(cfg);

      const res = await client.post(accApiUrl + '/session/resources');

      if (!res.data.success) {
        showAlert('Failed to get module-menu', 'error');
        setAppRoutes(defaultRoutes);
      } else {
        const accUser = SessionManager.transform(res.data.data.user);
        const modules = res.data.data.modules.modules;
        const hubs = res.data.data.modules.hubs;

        // Set the session content twice to prevent the state from being lost due to a browser refresh (avoiding storing too much session content in localstorage).
        if (SessionManager.isGuest(user)) {
          setUser(accUser);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        modules?.forEach((module: MenuDataItem) => {
          const moduleRoute: IRouteData = {
            name: module.name,
            path: '',
            component: module.component || undefined,
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

        hubs?.forEach((hub: HubItem) => {
          const hubRoute: IRouteData = {
            name: hub.name,
            path: '',
            component: hub.component || undefined,
          };

          if (hub.url != '') {
            try {
              const hubUrlObj = JSON.parse(hub.url);

              hubRoute.path = hubUrlObj.url.replace(/\./g, "/");
            } catch (error) {
              hubRoute.path = hub.url;
            }

            appRouteArr.push(hubRoute);
          }

          hubArr.push({
            id: hub.id,
            label: hub.name,
            subtitle: hub.descr,
            url: hubRoute.path,
            icon: LaptopWindowsOutlinedIcon
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accApiUrl]);

  // 2. 监听 Token
  // The dedup lock and the loading flag are both driven here (single source of
  // truth), set synchronously before the async call. This guarantees that once
  // we start loading we always reach setLoading(false) in the finally block —
  // so the "Initializing..." screen can never get stranded if this effect runs
  // twice (React StrictMode) or a re-render happens while the request is in flight.
  useEffect(() => {
    if (!token) {
      processingTokenRef.current = null;
      setLoading(false);
      return;
    }

    // 只有当 token 真的变了（字符串值变了）才重新拉取
    if (processingTokenRef.current === token) return;

    processingTokenRef.current = token;
    setLoading(true);
    fetchDynamicRoutes(token);
  }, [token, fetchDynamicRoutes]);

  return (
    <AppContext.Provider value={{ appRoutes, appMenus, appHubs, loading, fetchDynamicRoutes, currentBayContent, setCurrentBayContent }}>
      {children}
    </AppContext.Provider>
  );
}

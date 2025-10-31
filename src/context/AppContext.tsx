// src/context/AppContext.tsx
import React, { createContext, useState, useEffect, type ReactNode, type SetStateAction, type Dispatch } from 'react';

import { generateRoutes, type IRouteConfig, type IRouteData, type IMenu } from '../utils/generateRoutes';
import { useSession } from '../authority/SessionContext';
import { useAlert } from '../components/AlertContext';
import axiosRequester, { requesterConfig } from '../components/AxiosRequester';
import componentMap from '../app/ComponentMap';

import SettingsPage from '../pages/SettingsPage.tsx';
import HomePage from '../HomePage';
import AppTrayPage, { type BayContentProp } from '../pages/AppTrayPage.tsx';
import DashboardPage from '../pages/DashboardPage.tsx';
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
import { Navigate, useNavigate } from 'react-router-dom';
import { SessionManager } from '../authority/SessionManager.tsx';
import MainPage from '../pages/MainPage.tsx';

// Define the context data type
interface IAppContext {
  appRoutes: IRouteConfig[] | null;
  appMenus: IMenu[] | null;
  loading: boolean;
  fetchDynamicRoutes: (t: string) => Promise<void>;
  currentBayContent: BayContentProp | null;
  setCurrentBayContent: React.Dispatch<React.SetStateAction<BayContentProp>>;
}

// Create the context with default values
export const AppContext = createContext<IAppContext>({
  appMenus: null,
  appRoutes: null,
  loading: true,
  fetchDynamicRoutes: async (t: string) => { console.log(t); },
  currentBayContent: null,
  setCurrentBayContent: (() => {}) as Dispatch<SetStateAction<BayContentProp>>
});

// The provider component
export default function AppProvider({ children }: { children: ReactNode }) {
  const { token, setToken, user, isAuthenticated, setUser, clearSession } = useSession();
  const { showAlert } = useAlert();
  const accApiUrl = import.meta.env.VITE_JET_ASP_ACC_API;
  const navigate = useNavigate();

  const [currentBayContent, setCurrentBayContent] = React.useState<BayContentProp>({
    title: '初始标题',
    subheader: '初始副标题',
    elem: <>初始内容</>, 
    type: 'blank'
  });

  const setBayContent = (c: BayContentProp) => {
    setCurrentBayContent(c);
  }

  let appRouteArr: IRouteData[] = [];

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
        { path: 'dashboard', element: <PrivateRoute><DashboardPage /></PrivateRoute> },
        { path: 'settings', element: <PrivilegeRoute><SettingsPage /></PrivilegeRoute> }
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

  const defaultModules: IMenu[] = [{
    id: 'react_vite_tyr_dashboard',
    label: 'Dashboard',
    url: '/main/dashboard',
    icon: DashboardRoundedIcon,
    children: []
  }]

  const [appRoutes, setAppRoutes] = useState<IRouteConfig[]>(defaultRoutes);
  const [appMenus, setAppMenus] = useState<IMenu[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Ensure session mechanism when refreshing the page
    if (!isAuthenticated && SessionManager.isPermanent()) {
      setToken(SessionManager.getPermanentToken());

      fetchDynamicRoutes(SessionManager.getPermanentToken());
    } else if (isAuthenticated) {
      fetchDynamicRoutes(token);
    } else {
      setAppRoutes([{ path: '/login', element: <LoginPage /> },
      { path: '/', element: <HomePage /> },
      {
        path: '/main',
        element: <MainLayout />,
        children: [
          { index: true, path: '', element: <PrivateRoute><MainPage /></PrivateRoute> }
        ]
      },
      { path: '*', element: <Navigate to="/login" replace /> }]);
      setLoading(false);
    }
  }, [token]);

  const listModuleAndMenus = (menuList: any, routeArr: IRouteData[]): IMenu[] => {
    let resultArr: IMenu[] = [];

    menuList.forEach((menu: any) => {
      let menuItem = {
        icon: CodeOutlinedIcon,
        label: menu.name,
        url: '',
        id: menu.id,
        children: listModuleAndMenus(menu.menus, routeArr)
      };

      if (menu.component != null) {
        let menuRoute = {
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

  const fetchDynamicRoutes = async (t: string) => {
    let menuArr: IMenu[] = [];

    menuArr.push(defaultModules.filter(m => m.id === 'react_vite_tyr_dashboard')[0]);

    try {
      setLoading(true);
      const cfg = requesterConfig(t);
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

        modules.forEach((module: any) => {
          let moduleRoute = {
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
          menuArr.push({
            id: 'react_vite_tyr_settings',
            label: 'Settings',
            url: '/main/settings',
            icon: SettingsOutlinedIcon,
            children: []
          });
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
      }
    } catch (error) {
      console.error('Error fetching dynamic routes:', error);

      if (error instanceof Error) {
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

  return (
    <AppContext.Provider value={{ appRoutes, appMenus, loading, fetchDynamicRoutes, currentBayContent, setCurrentBayContent }}>
      {children}
    </AppContext.Provider>
  );
}

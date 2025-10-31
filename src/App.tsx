// src/App.tsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppProvider from './context/AppContext'
import AppRoutes from './AppRoutes';
import { SessionProvider } from './authority/SessionContext';
import { BreadcrumbProvider } from './context/BreadcrumbContext';

function App() {
  const BASE_PATH = import.meta.env.VITE_JET_ASP_CONTEXT || '/';

  return (
    <BrowserRouter basename={BASE_PATH}>
      <SessionProvider>
        <BreadcrumbProvider>
          <AppProvider>
            <AppRoutes />
          </AppProvider>
        </BreadcrumbProvider>
      </SessionProvider>
    </BrowserRouter>

  );
}

export default App;
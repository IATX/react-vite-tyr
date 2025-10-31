import './index.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { StyledEngineProvider } from '@mui/material/styles';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { AlertProvider } from './components/AlertContext';
import { ConfirmDialogProvider } from './components/useConfirmDialog';
import App from './App.tsx';

document.documentElement.style.setProperty('--scrollbar-width', `15px`);

document.title = import.meta.env.VITE_APP_NAME;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <StyledEngineProvider injectFirst>
          <ConfirmDialogProvider>
            <AlertProvider>
              <App />
              {/**
              <BrowserRouter>
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="sign-in" element={<SignIn />} />
                  <Route path="index" element={<Dashboard />} />
                  <Route path="test" element={<AccountPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Routes>
              </BrowserRouter>
               */}
            </AlertProvider>
          </ConfirmDialogProvider>
      </StyledEngineProvider>
    </LocalizationProvider>
  </React.StrictMode>
);

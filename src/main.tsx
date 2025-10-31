// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { StyledEngineProvider } from '@mui/material/styles';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { AlertProvider } from './components/AlertContext';
import { ConfirmDialogProvider } from './components/useConfirmDialog';
import App from './App.tsx';

import './index.css'; // 导入你的全局样式文件

// 找到 index.html 中 id 为 "root" 的 DOM 元素
const rootElement = document.getElementById('root');

// 如果找不到，抛出错误，防止应用无法挂载
if (!rootElement) {
  throw new Error('Failed to find the root element with id "root".');
}

// 使用 ReactDOM.createRoot() 创建一个根节点
ReactDOM.createRoot(rootElement).render(
  // <React.StrictMode> 可以在开发模式下帮助你发现潜在问题
  <React.StrictMode>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <StyledEngineProvider injectFirst>
        <ConfirmDialogProvider>
          <AlertProvider>
            <App />
          </AlertProvider>
        </ConfirmDialogProvider>
      </StyledEngineProvider>
    </LocalizationProvider>
  </React.StrictMode>,
);
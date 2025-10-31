import React, { createContext, useState, useContext, type ReactNode, useCallback } from 'react';
import { Snackbar, Alert, type AlertColor, Slide, type SlideProps } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles'; // 导入 ThemeProvider 和 createTheme
import CssBaseline from '@mui/material/CssBaseline'; // 导入 CssBaseline

// 定义 Alert 状态的接口
interface AlertState {
    open: boolean;
    message: string;
    severity: AlertColor; // 'success' | 'info' | 'warning' | 'error'
    autoHideDuration: number | null;
}

// 定义 Alert Context 的接口
interface AlertContextType {
    showAlert: (message: string, severity?: AlertColor, duration?: number | null) => void;
    hideAlert: () => void;
}

// 创建 Alert Context
const AlertContext = createContext<AlertContextType | undefined>(undefined);

// 定义 AlertProvider 的 Props 接口
interface AlertProviderProps {
    children: ReactNode;
}

// 创建 MUI 主题 (可选，但推荐，以确保 MUI 组件样式一致)
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

function SlideTransition(props: SlideProps) {
    // direction="up" 表示从底部向上滑入/滑出
    return <Slide {...props} direction="up" />;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
    const [alertState, setAlertState] = useState<AlertState>({
        open: false,
        message: '',
        severity: 'info',
        autoHideDuration: 3000, // 默认 6 秒后自动隐藏
    });

    // 显示 Alert 的函数
    const showAlert = useCallback((message: string, severity: AlertColor = 'info', duration: number | null = 3000) => {
        setAlertState({
            open: true,
            message,
            severity,
            autoHideDuration: duration,
        });
    }, []);

    // 隐藏 Alert 的函数
    const hideAlert = useCallback(() => {
        setAlertState((prevState) => ({ ...prevState, open: false }));
    }, []);

    // 处理 Snackbar 关闭事件
    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        hideAlert();
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline /> {/* 提供基本的 CSS 重置 */}
            <AlertContext.Provider value={{ showAlert, hideAlert }}>
                {children}
                <Snackbar
                    open={alertState.open}
                    autoHideDuration={alertState.autoHideDuration}
                    onClose={handleClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // 设置 Alert 显示位置
                    TransitionComponent={SlideTransition}
                >
                    <Alert
                        onClose={handleClose}
                        severity={alertState.severity}
                        className='rounded-md'
                        sx={{ width: '100%' }} // MUI Alert 的宽度
                    >
                        <span className="text-sm">{alertState.message}</span> {/* 使用 Tailwind 样式化消息文本 */}
                    </Alert>
                </Snackbar>
            </AlertContext.Provider>
        </ThemeProvider>
    );
};

// 自定义 Hook，用于在组件中方便地使用 Alert 功能
export const useAlert = () => {
    const context = useContext(AlertContext);
    if (context === undefined) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};
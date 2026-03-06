import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from 'react';
import { type UserInfo, type Role } from './AccSession';

interface SessionContextType {
    token: string;
    user: UserInfo;
    isAuthenticated: boolean;
    setToken: (t: string) => void;
    setUser: (u: UserInfo) => void;
    clearSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// 提取常量，避免拼写错误
const STORAGE_KEY_TOKEN = 'acc_token';
const STORAGE_KEY_USER = 'acc_user';

export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const guest: UserInfo = { id: '-1', name: 'Guest', pictureUrl: '', roles: [] as Role[], isGuest: true };

    // 1. 初始化时：直接从本地存储读取
    const [token, setTokenState] = useState<string>(() => {
        return localStorage.getItem(STORAGE_KEY_TOKEN) || '';
    });

    const [user, setUserState] = useState<UserInfo>(() => {
        const savedUser = localStorage.getItem(STORAGE_KEY_USER);
        try {
            return savedUser ? JSON.parse(savedUser) : guest;
        } catch {
            return guest;
        }
    });

    const isAuthenticated = token !== '';

    // 2. 增强版的设置函数：同步更新内存和本地存储
    const setToken = useCallback((t: string) => {
        setTokenState(t);
        if (t) {
            localStorage.setItem(STORAGE_KEY_TOKEN, t);
        } else {
            localStorage.removeItem(STORAGE_KEY_TOKEN);
        }
    }, []);

    const setUser = useCallback((u: UserInfo) => {
        setUserState(u);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(u));
    }, []);

    const clearSession = useCallback(() => {
        setTokenState('');
        setUserState(guest);
        localStorage.removeItem(STORAGE_KEY_TOKEN);
        localStorage.removeItem(STORAGE_KEY_USER);
    }, [guest]);

    // 3. 锁定 Provider 的 Value 引用（防止 AppRoutes 10次渲染的关键！）
    const value = useMemo(() => ({
        token,
        user,
        isAuthenticated,
        setToken,
        setUser,
        clearSession,
    }), [token, user, isAuthenticated, setToken, setUser, clearSession]);

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) throw new Error('useSession must be used within a SessionProvider');
    return context;
};
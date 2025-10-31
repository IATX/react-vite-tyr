// context/SessionContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';
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

export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const guest = { id: '-1', name: 'Guest', pictureUrl: '', roles: [] as Role[], isGuest:true};

    const [token, setToken] = useState<string>('');
    const [user, setUser] = useState<UserInfo>(guest);
    const isAuthenticated = token !== '';

    const clearSession = () => {
        setToken('');
        setUser(guest);
        sessionStorage.removeItem('sharedSessionId');
        localStorage.removeItem('sharedSessionId');
    };

    return (
        <SessionContext.Provider value={{
            token,
            user,
            isAuthenticated,
            setToken,
            setUser,
            clearSession,
        }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};

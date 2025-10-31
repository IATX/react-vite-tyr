import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '../authority/SessionContext';
import { SessionManager } from '../authority/SessionManager';

// Define a type for PrivilegeRoute
interface PrivilegeRoute {
    children: React.ReactNode;
}

const PrivilegeRoute: React.FC<PrivilegeRoute> = ({ children }) => {
    const { user } = useSession(); // Get session status

    if (SessionManager.isGuest(user)) {
         return <Navigate to="/login" replace />;
    }

    if (!SessionManager.isAdmin(user)) {
        // If there is no session, redirect to the login page
        return <Navigate to="/401" replace />;
    }

    // If there is a session, render the child element
    return <>{children}</>;
};

export default PrivilegeRoute;
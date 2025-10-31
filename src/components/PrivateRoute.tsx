import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '../authority/SessionContext';

// Define types for PrivateRoute's props
interface PrivateRouteProps {
    children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const { isAuthenticated } = useSession(); // Get session status

    if (!isAuthenticated) {
        // If there is no session, redirect to the login page
        return <Navigate to="/login" replace />;
    }

    // If there is a session, render the child element
    return <>{children}</>;
};

export default PrivateRoute;
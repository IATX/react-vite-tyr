import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    // 关键：检查会话 ID

    const sessionId = sessionStorage.getItem('sharedSessionId');
    const isAuthenticated = sessionId !== null;

    if (!isAuthenticated) {
        // 如果会话为空，立即重定向到登录页
        // 这发生在路由表被渲染和匹配之前
        return <Navigate to="/login" replace />;
    }

    // 如果已登录，继续渲染子路由配置
    return <Outlet />;
};

export default ProtectedRoute;
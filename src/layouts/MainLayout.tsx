import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

import { useBreadcrumbs } from '../context/BreadcrumbContext';
import { useState } from 'react';

const LayoutContent = () => {
  const { breadcrumbs, defaultActiveItemId, setDefaultActiveItemId } = useBreadcrumbs();

  // This is the callback function passed to the child component
  const handleSidebarItemClick = (itemId: string) => {
    // The parent component updates its own state
    setDefaultActiveItemId(itemId);
  };

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 定义两个状态下的宽度常量
  const drawerWidth = 240;
  const collapsedWidth = 72;

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar activeItemId={defaultActiveItemId}
          onItemClick={handleSidebarItemClick}
          open={sidebarOpen}
          onExpandSidebar={() => setSidebarOpen(true)}
          width={sidebarOpen ? drawerWidth : collapsedWidth}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col bg-white">
          {/* Header */}
          <Header arr={breadcrumbs} sidebarOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)} />
          <Box component="main" className="bg-white" sx={{
            overflowY: 'auto',
          }}>
            <Outlet />
          </Box>
        </div>
      </div>
    </>
  )
}

const MainLayout = () => {
  return (
    <LayoutContent />
  );
};

export default MainLayout;
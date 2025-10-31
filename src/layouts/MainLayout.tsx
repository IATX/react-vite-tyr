import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

import { useBreadcrumbs } from '../context/BreadcrumbContext';

const LayoutContent = () => {
  const { breadcrumbs, defaultActiveItemId, setDefaultActiveItemId } = useBreadcrumbs();

  // This is the callback function passed to the child component
  const handleSidebarItemClick = (itemId: string) => {
    // The parent component updates its own state
    setDefaultActiveItemId(itemId);
  };

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar activeItemId={defaultActiveItemId}
          onItemClick={handleSidebarItemClick} />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <Header arr={breadcrumbs} />
          <Box component="main" className="flex-1 bg-white" sx={{
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
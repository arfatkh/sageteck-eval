import React, { useState } from 'react';
import { styled } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '../shared/Sidebar';

const LayoutRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  overflow: 'hidden',
  width: '100vw',
  height: '100vh',
  backgroundColor: theme.palette.background.default,
}));

interface MainContentProps {
  sidebarOpen: boolean;
}

const MainContent = styled('main', {
  shouldForwardProp: (prop) => prop !== 'sidebarOpen',
})<MainContentProps>(({ theme, sidebarOpen }) => ({
  flexGrow: 1,
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: sidebarOpen ? theme.spacing(1) : theme.spacing(7),
  width: `calc(100% - ${sidebarOpen ? 240 : theme.spacing(7)}px)`,
  overflow: 'auto',
}));

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <LayoutRoot>
      <Sidebar 
        open={sidebarOpen} 
        onToggle={handleSidebarToggle}
        currentPath={location.pathname}
        onNavigate={handleNavigation}
      />
      <MainContent sidebarOpen={sidebarOpen}>
        <Outlet />
      </MainContent>
    </LayoutRoot>
  );
}; 
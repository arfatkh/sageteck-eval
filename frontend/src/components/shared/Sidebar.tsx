import React from 'react';
import { Box, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, Typography, Divider, alpha } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';

const DRAWER_WIDTH = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics' },
  { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
  { text: 'Customers', icon: <PeopleIcon />, path: '/customers' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

export interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onToggle, currentPath, onNavigate }) => {
  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? DRAWER_WIDTH : 64,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        '& .MuiDrawer-paper': {
          width: open ? DRAWER_WIDTH : 64,
          transition: (theme) =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          overflowX: 'hidden',
          backgroundColor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: open ? 'space-between' : 'center' }}>
        {open && (
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
            TechMart
          </Typography>
        )}
        <IconButton onClick={onToggle}>
          {!open ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>
      <Divider sx={{ borderColor: 'divider' }} />
      <List sx={{ flex: 1, px: open ? 2 : 1 }}>
        {menuItems.map(({ text, icon, path }) => (
          <ListItem
            key={text}
            disablePadding
            sx={{ 
              mb: 1,
              display: 'block',
              borderRadius: 1,
              backgroundColor: currentPath === path ? (theme) => alpha(theme.palette.primary.main, 0.1) : 'transparent',
              '&:hover': {
                backgroundColor: (theme) => currentPath === path 
                  ? alpha(theme.palette.primary.main, 0.15)
                  : alpha(theme.palette.action.hover, 0.04),
              },
            }}
            onClick={() => onNavigate(path)}
          >
            <Box
              sx={{
                minHeight: 48,
                px: open ? 2.5 : 1.5,
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: open ? 'initial' : 'center',
                borderRadius: 1,
                width: '100%',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 'auto',
                  justifyContent: 'center',
                  color: currentPath === path ? 'primary.main' : 'text.secondary',
                }}
              >
                {icon}
              </ListItemIcon>
              <ListItemText
                primary={text}
                sx={{
                  opacity: open ? 1 : 0,
                  '& .MuiListItemText-primary': {
                    fontSize: '0.875rem',
                    fontWeight: currentPath === path ? 600 : 400,
                  },
                }}
              />
            </Box>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}; 
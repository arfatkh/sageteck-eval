import React from 'react';
import { Box, Typography, Grid, Paper, List, ListItem, ListItemText, ListItemIcon, Switch } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import LanguageIcon from '@mui/icons-material/Language';
import DarkModeIcon from '@mui/icons-material/DarkMode';

export const Settings: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Settings
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Preferences
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Notifications" 
                  secondary="Enable push notifications"
                />
                <Switch edge="end" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <DarkModeIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Dark Mode" 
                  secondary="Use dark theme"
                />
                <Switch edge="end" defaultChecked />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              System
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Security" 
                  secondary="Two-factor authentication"
                />
                <Switch edge="end" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LanguageIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Language" 
                  secondary="English (US)"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 
import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../utils/api';
import { formatDistanceToNow } from 'date-fns';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

interface Alert {
  id: number;
  type: string;
  message: string;
  timestamp: string;
  severity: 'error' | 'warning' | 'info';
}

export const AlertsPanel: React.FC = () => {
  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ['systemAlerts'],
    queryFn: async () => {
      const response = await apiClient.get('/alerts');
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'error.main';
      case 'warning':
        return 'warning.main';
      default:
        return 'info.main';
    }
  };

  return (
    <List sx={{ width: '100%', maxHeight: 400, overflow: 'auto' }}>
      {alerts?.map((alert) => (
        <ListItem
          key={alert.id}
          sx={{
            borderRadius: 1,
            mb: 1,
            bgcolor: (theme) => `${getAlertColor(alert.severity)}15`,
            '&:hover': {
              bgcolor: (theme) => `${getAlertColor(alert.severity)}25`,
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            {getAlertIcon(alert.severity)}
          </ListItemIcon>
          <ListItemText
            primary={
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: (theme) => getAlertColor(alert.severity) }}
                >
                  {alert.type}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDistanceToNow(new Date(alert.timestamp), {
                    addSuffix: true,
                  })}
                </Typography>
              </Box>
            }
            secondary={
              <Typography
                variant="body2"
                color="text.primary"
                sx={{ mt: 0.5 }}
              >
                {alert.message}
              </Typography>
            }
          />
        </ListItem>
      ))}
      {(!alerts || alerts.length === 0) && (
        <ListItem>
          <ListItemText
            primary={
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
              >
                No active alerts
              </Typography>
            }
          />
        </ListItem>
      )}
    </List>
  );
}; 
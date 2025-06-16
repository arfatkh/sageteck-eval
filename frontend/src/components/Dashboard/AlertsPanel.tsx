import React from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Typography, 
  Chip,
  CircularProgress,
  useTheme,
  alpha,
  ButtonBase
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../utils/api';
import { 
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Inventory as InventoryIcon,
  AccountBalance as TransactionIcon,
  SystemUpdate as SystemIcon
} from '@mui/icons-material';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { AlertDetailsDialog } from './AlertDetailsDialog';

interface Alert {
  id: number;
  type: 'low_stock' | 'suspicious_transaction' | 'system';
  message: string;
  severity: 'info' | 'warning' | 'error';
  alert_metadata: any;
  created_at: string;
}

interface SystemStatus {
  status: 'healthy' | 'warning' | 'error';
  active_alerts: Alert[];
  last_checked: string;
}

interface DashboardMetrics {
  alerts: {
    low_stock_products: Array<{
      id: number;
      name: string;
      stock_quantity: number;
      category: string;
    }>;
    suspicious_transactions: Array<{
      id: number;
      amount: number;
      timestamp: string;
      customer_id: number;
      status: string;
    }>;
  };
}

const AlertIcon = ({ type, severity }: { type: string; severity: string }) => {
  const theme = useTheme();
  const color = severity === 'error' ? theme.palette.error.main 
    : severity === 'warning' ? theme.palette.warning.main 
    : theme.palette.info.main;

  const getIcon = () => {
    switch (type) {
      case 'low_stock':
        return <InventoryIcon sx={{ color }} />;
      case 'suspicious_transaction':
        return <TransactionIcon sx={{ color }} />;
      case 'system':
        return <SystemIcon sx={{ color }} />;
      default:
        return severity === 'error' ? <ErrorIcon sx={{ color }} />
          : severity === 'warning' ? <WarningIcon sx={{ color }} />
          : <InfoIcon sx={{ color }} />;
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      width: 40,
      height: 40,
      borderRadius: 1,
      bgcolor: alpha(color, 0.1),
    }}>
      {getIcon()}
    </Box>
  );
};

export const AlertsPanel: React.FC = () => {
  const theme = useTheme();
  const [selectedAlert, setSelectedAlert] = React.useState<Alert | null>(null);

  // Fetch alerts from system status
  const { data: systemStatus, isLoading: isLoadingSystem } = useQuery<SystemStatus>({
    queryKey: ['systemStatus'],
    queryFn: async () => {
      const response = await apiClient.get('/alerts/system-status');
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch alerts from overview
  const { data: overviewData, isLoading: isLoadingOverview } = useQuery<DashboardMetrics>({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/overview');
      return response.data;
    },
    refetchInterval: 30000,
  });

  // Combine and process alerts from both sources
  const processedAlerts = React.useMemo(() => {
    const alerts: Alert[] = [...(systemStatus?.active_alerts || [])];
    
    // Add low stock alerts from overview
    if (overviewData?.alerts?.low_stock_products?.length) {
      const lowStockAlert: Alert = {
        id: Date.now(), // Generate unique ID
        type: 'low_stock',
        message: `${overviewData.alerts.low_stock_products.length} products with low stock`,
        severity: 'warning',
        alert_metadata: { products: overviewData.alerts.low_stock_products },
        created_at: new Date().toISOString()
      };
      alerts.push(lowStockAlert);
    }

    // Add suspicious transaction alerts from overview
    if (overviewData?.alerts?.suspicious_transactions?.length) {
      const suspiciousAlert: Alert = {
        id: Date.now() + 1, // Generate unique ID
        type: 'suspicious_transaction',
        message: `${overviewData.alerts.suspicious_transactions.length} suspicious transactions detected`,
        severity: 'error',
        alert_metadata: { transactions: overviewData.alerts.suspicious_transactions },
        created_at: new Date().toISOString()
      };
      alerts.push(suspiciousAlert);
    }

    // Sort alerts by created_at (most recent first)
    return alerts.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [systemStatus, overviewData]);

  const renderAlertDetails = (alert: Alert) => {
    switch (alert.type) {
      case 'low_stock':
        return (
          <Box sx={{ mt: 1 }}>
            {alert.alert_metadata.products.slice(0, 3).map((product: any) => (
              <Chip
                key={product.id}
                label={`${product.name}: ${product.stock_quantity} left`}
                size="small"
                color="warning"
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
            {alert.alert_metadata.products.length > 3 && (
              <Typography variant="caption" color="text.secondary">
                and {alert.alert_metadata.products.length - 3} more...
              </Typography>
            )}
          </Box>
        );
      
      case 'suspicious_transaction':
        return (
          <Box sx={{ mt: 1 }}>
            {alert.alert_metadata.transactions.slice(0, 3).map((transaction: any) => (
              <Chip
                key={transaction.id}
                label={`${formatCurrency(transaction.amount)} at ${formatDate(transaction.timestamp)}`}
                size="small"
                color="error"
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
            {alert.alert_metadata.transactions.length > 3 && (
              <Typography variant="caption" color="text.secondary">
                and {alert.alert_metadata.transactions.length - 3} more...
              </Typography>
            )}
          </Box>
        );
      
      default:
        return null;
    }
  };

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert);
  };

  const handleCloseDialog = () => {
    setSelectedAlert(null);
  };

  if (isLoadingSystem || isLoadingOverview) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100%',
        minHeight: 200
      }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!processedAlerts.length) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100%',
        minHeight: 200,
        color: 'success.main',
        gap: 2
      }}>
        <InfoIcon sx={{ fontSize: 48 }} />
        <Typography>All systems operational</Typography>
      </Box>
    );
  }

  return (
    <>
      <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
        {processedAlerts.map((alert) => (
          <ButtonBase
            key={alert.id}
            onClick={() => handleAlertClick(alert)}
            sx={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              }
            }}
          >
            <ListItem
              alignItems="flex-start"
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                '&:last-child': {
                  borderBottom: 'none'
                },
                py: 2
              }}
            >
              <ListItemIcon sx={{ mt: 0 }}>
                <AlertIcon type={alert.type} severity={alert.severity} />
              </ListItemIcon>
              <ListItemText
                primary={alert.message}
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      {formatDate(alert.created_at)}
                    </Typography>
                    {renderAlertDetails(alert)}
                  </>
                }
              />
            </ListItem>
          </ButtonBase>
        ))}
      </List>
      <AlertDetailsDialog
        alert={selectedAlert}
        open={selectedAlert !== null}
        onClose={handleCloseDialog}
      />
    </>
  );
}; 
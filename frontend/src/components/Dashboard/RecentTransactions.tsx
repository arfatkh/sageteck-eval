import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  Chip,
  Skeleton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ShoppingBag as ShoppingBagIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { formatCurrency } from '../../utils/formatters';

interface Transaction {
  id: number;
  customer_email: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'suspicious';
  timestamp: string;
  items: number;
  payment_method: string;
}

const getStatusIcon = (status: Transaction['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon sx={{ color: 'success.main' }} />;
    case 'pending':
      return <PendingIcon sx={{ color: 'warning.main' }} />;
    case 'failed':
      return <ErrorIcon sx={{ color: 'error.main' }} />;
    case 'suspicious':
      return <WarningIcon sx={{ color: 'warning.main' }} />;
    default:
      return <ShoppingBagIcon />;
  }
};

const getStatusColor = (
  status: Transaction['status']
): 'success' | 'warning' | 'error' | 'primary' => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'error';
    case 'suspicious':
      return 'warning';
    default:
      return 'primary';
  }
};

export const RecentTransactions: React.FC = () => {
  const theme = useTheme();

  const { data: transactions, isLoading, error } = useQuery<Transaction[]>({
    queryKey: ['recentTransactions'],
    queryFn: async () => {
      const response = await fetch('/api/v1/transactions/recent');
      if (!response.ok) {
        throw new Error('Failed to fetch recent transactions');
      }
      const data = await response.json();
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {[1, 2, 3].map((i) => (
          <ListItem
            key={i}
            sx={{
              borderBottom: '1px solid',
              borderColor: 'divider',
              py: 2,
            }}
          >
            <ListItemAvatar>
              <Skeleton variant="circular" width={40} height={40} />
            </ListItemAvatar>
            <ListItemText
              primary={<Skeleton width="60%" />}
              secondary={<Skeleton width="40%" />}
            />
            <Skeleton width={80} />
          </ListItem>
        ))}
      </List>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center" sx={{ p: 2 }}>
        Error loading transactions. Please try again later.
      </Typography>
    );
  }

  return (
    <List
      sx={{
        width: '100%',
        bgcolor: 'background.paper',
        maxHeight: 400,
        overflow: 'auto',
      }}
    >
      {Array.isArray(transactions) && transactions.length > 0 ? (
        transactions.map((transaction) => (
          <ListItem
            key={transaction.id}
            sx={{
              borderBottom: '1px solid',
              borderColor: 'divider',
              py: 2,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemAvatar>
              <Avatar
                sx={{
                  bgcolor: (theme) =>
                    alpha(theme.palette[getStatusColor(transaction.status)].main, 0.1),
                  color: `${getStatusColor(transaction.status)}.main`,
                }}
              >
                {getStatusIcon(transaction.status)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="subtitle2" component="span">
                    {transaction.customer_email}
                  </Typography>
                  <Chip
                    label={transaction.status}
                    size="small"
                    color={getStatusColor(transaction.status)}
                    sx={{ height: 20 }}
                  />
                </Box>
              }
              secondary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrency(transaction.amount)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {transaction.items} items
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    via {transaction.payment_method}
                  </Typography>
                </Box>
              }
            />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
              {formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })}
            </Typography>
          </ListItem>
        ))
      ) : (
        <ListItem>
          <ListItemText
            primary={
              <Typography variant="body2" color="text.secondary" align="center">
                No recent transactions
              </Typography>
            }
          />
        </ListItem>
      )}
    </List>
  );
}; 
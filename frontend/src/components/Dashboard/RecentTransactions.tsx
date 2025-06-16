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
  IconButton,
  Tooltip,
  PaletteColor,
} from '@mui/material';
import {
  ShoppingBag as ShoppingBagIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { formatCurrency } from '../../utils/formatters';
import { TransactionDetailsDialog } from './TransactionDetailsDialog';

type ColorOption = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';

interface Transaction {
  id: number;
  customer_email: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'suspicious' | 'flagged';
  timestamp: string;
  items: number;
  payment_method: string;
  fraud_check_result?: {
    is_suspicious: boolean;
    reasons: string[];
    risk_score: number;
    details: {
      velocity_check: {
        window_minutes: number;
        transaction_count: number;
        threshold: number;
      };
      amount_check: {
        z_score: number;
        customer_mean: number;
        customer_std_dev: number;
        threshold: number;
      };
    };
  };
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
    case 'flagged':
      return <WarningIcon sx={{ color: 'warning.main' }} />;
    default:
      return <ShoppingBagIcon />;
  }
};

const getStatusColor = (
  status: Transaction['status']
): ColorOption => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
    case 'flagged':
      return 'error';
    case 'suspicious':
      return 'warning';
    default:
      return 'primary';
  }
};

export const RecentTransactions: React.FC = () => {
  const theme = useTheme();
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);

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

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleCloseDialog = () => {
    setSelectedTransaction(null);
  };

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
    <>
      <List
        sx={{
          width: '100%',
          bgcolor: 'background.paper',
          maxHeight: 400,
          overflow: 'auto',
        }}
      >
        {Array.isArray(transactions) && transactions.length > 0 ? (
          transactions.map((transaction) => {
            const statusColor = getStatusColor(transaction.status);
            const paletteColor = theme.palette[statusColor] as PaletteColor;
            const riskScore = transaction.fraud_check_result?.risk_score || 0;

            return (
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
                  cursor: 'pointer',
                }}
                onClick={() => handleTransactionClick(transaction)}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: alpha(paletteColor.main, 0.1),
                      color: paletteColor.main,
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
                        color={statusColor}
                        sx={{ height: 20 }}
                      />
                      {transaction.fraud_check_result?.is_suspicious && (
                        <Tooltip title={transaction.fraud_check_result.reasons.join(', ')}>
                          <IconButton size="small" sx={{ p: 0.5, color: 'warning.main' }}>
                            <WarningIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
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
                      {transaction.fraud_check_result && (
                        <Chip
                          label={`Risk: ${(riskScore * 100).toFixed(0)}%`}
                          size="small"
                          color={riskScore >= 0.5 ? 'error' : 'success'}
                          sx={{ height: 20 }}
                        />
                      )}
                    </Box>
                  }
                />
                <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                  {formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })}
                </Typography>
              </ListItem>
            );
          })
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

      {selectedTransaction && (
        <TransactionDetailsDialog
          transaction={selectedTransaction}
          open={true}
          onClose={handleCloseDialog}
        />
      )}
    </>
  );
}; 
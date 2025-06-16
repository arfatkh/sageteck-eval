import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Chip,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  useTheme,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  ShoppingBag as ShoppingBagIcon,
  CalendarToday as CalendarIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { formatDistanceToNow } from 'date-fns';

interface CustomerDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  customerId: number | null;
}

interface CustomerDetails {
  id: number;
  email: string;
  registration_date: string;
  total_spent: number;
  risk_score: number;
  recent_transactions: Array<{
    id: number;
    amount: number;
    timestamp: string;
    status: string;
  }>;
}

const MetricCard = ({ title, value, icon, trend = 'neutral' }: any) => {
  const theme = useTheme();
  
  return (
    <Paper
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 1,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h6" sx={{ mt: 'auto' }}>
        {value}
      </Typography>
    </Paper>
  );
};

export const CustomerDetailsDialog: React.FC<CustomerDetailsDialogProps> = ({
  open,
  onClose,
  customerId,
}) => {
  const theme = useTheme();

  const { data: customer, isLoading, error } = useQuery<CustomerDetails>({
    queryKey: ['customerDetails', customerId],
    queryFn: async () => {
      if (!customerId) throw new Error('No customer ID');
      const response = await fetch(`/api/v1/customers/${customerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer details');
      }
      return response.json();
    },
    enabled: !!customerId && open,
  });

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.default',
          backgroundImage: 'none',
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Customer Details</Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            '&:hover': { color: 'text.primary' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error" gutterBottom>
              Error loading customer details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {error instanceof Error ? error.message : 'Please try again later'}
            </Typography>
          </Box>
        ) : customer ? (
          <Box sx={{ py: 1 }}>
            {/* Customer Header */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <EmailIcon sx={{ color: 'primary.main' }} />
                </Box>
                <Box>
                  <Typography variant="h6">{customer.email}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Joined {formatDistanceToNow(new Date(customer.registration_date), { addSuffix: true })}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Chip
                label={`Risk Score: ${(customer.risk_score * 100).toFixed(0)}%`}
                color={customer.risk_score >= 0.7 ? 'error' : customer.risk_score >= 0.4 ? 'warning' : 'success'}
                icon={customer.risk_score >= 0.7 ? <WarningIcon /> : undefined}
              />
            </Box>

            {/* Metrics */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <MetricCard
                  title="Total Spent"
                  value={formatCurrency(customer.total_spent)}
                  icon={<ShoppingBagIcon />}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <MetricCard
                  title="Average Order"
                  value={formatCurrency(customer.total_spent / (customer.recent_transactions.length || 1))}
                  icon={<TrendingUpIcon />}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <MetricCard
                  title="Purchase Frequency"
                  value={`${(customer.recent_transactions.length / 30).toFixed(1)} / month`}
                  icon={<CalendarIcon />}
                />
              </Grid>
            </Grid>

            {/* Recent Transactions */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShoppingBagIcon sx={{ fontSize: 20 }} />
                Recent Transactions
              </Typography>
              <Paper variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                <List disablePadding>
                  {customer.recent_transactions.map((transaction, index) => (
                    <React.Fragment key={transaction.id}>
                      {index > 0 && <Divider />}
                      <ListItem sx={{ py: 1.5 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Typography variant="subtitle2">
                                {formatCurrency(transaction.amount)}
                              </Typography>
                              <Chip
                                label={transaction.status}
                                size="small"
                                color={
                                  transaction.status === 'completed' ? 'success' :
                                  transaction.status === 'pending' ? 'warning' :
                                  transaction.status === 'failed' ? 'error' : 'default'
                                }
                                sx={{ minWidth: 80 }}
                              />
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })}
                            </Typography>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                  {customer.recent_transactions.length === 0 && (
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
              </Paper>
            </Box>
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}; 
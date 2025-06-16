import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  ShoppingBag as ShoppingBagIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { formatCurrency } from '../../utils/formatters';

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

const MetricCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
}> = ({ title, value, icon }) => (
  <Paper
    sx={{
      p: 2,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      bgcolor: 'background.paper',
    }}
  >
    <Box sx={{ color: 'text.secondary', mb: 1 }}>{icon}</Box>
    <Typography variant="h5" sx={{ mb: 1 }}>
      {value}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {title}
    </Typography>
  </Paper>
);

export const CustomerDetailsDialog: React.FC<CustomerDetailsDialogProps> = ({
  open,
  onClose,
  customerId,
}) => {
  const { data: customer, isLoading } = useQuery<CustomerDetails>({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      if (!customerId) throw new Error('No customer ID provided');
      const response = await fetch(`/api/v1/customers/${customerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer details');
      }
      return response.json();
    },
    enabled: !!customerId && open,
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.default',
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h5">Customer Details</Typography>
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : customer ? (
          <Box>
            {/* Customer Info */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6">{customer.email}</Typography>
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
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                  *Only includes completed transactions
                </Typography>
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
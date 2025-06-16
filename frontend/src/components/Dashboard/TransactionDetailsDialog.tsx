import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Chip,
  Paper,
  Grid,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemText,
  Divider,
  PaletteColor,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  AccountBalance as PaymentIcon,
  Person as CustomerIcon,
  Assessment as RiskIcon,
} from '@mui/icons-material';
import { formatCurrency, formatDate } from '../../utils/formatters';

// Type for valid color options
type ColorOption = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';

interface TransactionDetailsDialogProps {
  transaction: {
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
  };
  open: boolean;
  onClose: () => void;
}

const MetricCard = ({ title, value, icon, color = 'primary' }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: ColorOption;
}) => {
  const theme = useTheme();
  const paletteColor = theme.palette[color] as PaletteColor;
  
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        bgcolor: alpha(paletteColor.main, 0.05),
        borderColor: alpha(paletteColor.main, 0.1),
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(paletteColor.main, 0.1),
          color: paletteColor.main,
          mb: 1,
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" component="div" sx={{ mb: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
    </Paper>
  );
};

export const TransactionDetailsDialog: React.FC<TransactionDetailsDialogProps> = ({
  transaction,
  open,
  onClose,
}) => {
  const theme = useTheme();

  const getStatusColor = (status: string): ColorOption => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon />;
      case 'pending':
        return <PendingIcon />;
      case 'failed':
      case 'flagged':
        return <ErrorIcon />;
      case 'suspicious':
        return <WarningIcon />;
      default:
        return <CheckCircleIcon />;  // Default icon instead of null
    }
  };

  const riskScore = transaction.fraud_check_result?.risk_score || 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Transaction Details #{transaction.id}</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: 'text.secondary' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {/* Transaction Overview */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <MetricCard
              title="Amount"
              value={formatCurrency(transaction.amount)}
              icon={<PaymentIcon />}
              color={getStatusColor(transaction.status)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <MetricCard
              title="Customer"
              value={transaction.customer_email}
              icon={<CustomerIcon />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <MetricCard
              title="Risk Score"
              value={`${(riskScore * 100).toFixed(0)}%`}
              icon={<RiskIcon />}
              color={riskScore >= 0.5 ? 'error' : 'success'}
            />
          </Grid>
        </Grid>

        {/* Status and Timestamp */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={transaction.status.toUpperCase()}
            color={getStatusColor(transaction.status)}
            icon={getStatusIcon(transaction.status)}
          />
          <Typography variant="body2" color="text.secondary">
            {formatDate(transaction.timestamp)}
          </Typography>
        </Box>

        {/* Fraud Detection Results */}
        {transaction.fraud_check_result && (
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Fraud Detection Analysis
            </Typography>
            
            {/* Suspicious Indicators */}
            {transaction.fraud_check_result.is_suspicious && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="error" gutterBottom>
                  Suspicious Activity Detected
                </Typography>
                <List dense disablePadding>
                  {transaction.fraud_check_result.reasons.map((reason, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={
                          <Typography variant="body2" color="error">
                            • {reason}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Detailed Checks */}
            <Grid container spacing={2}>
              {/* Velocity Check */}
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Transaction Velocity
                  </Typography>
                  <List dense disablePadding>
                    <ListItem>
                      <ListItemText
                        primary="Time Window"
                        secondary={`${transaction.fraud_check_result.details.velocity_check.window_minutes} minutes`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Transaction Count"
                        secondary={`${transaction.fraud_check_result.details.velocity_check.transaction_count} / ${transaction.fraud_check_result.details.velocity_check.threshold}`}
                      />
                    </ListItem>
                  </List>
                </Box>
              </Grid>

              {/* Amount Check */}
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Amount Analysis
                  </Typography>
                  <List dense disablePadding>
                    <ListItem>
                      <ListItemText
                        primary="Z-Score"
                        secondary={transaction.fraud_check_result.details.amount_check.z_score.toFixed(2)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Customer Average"
                        secondary={formatCurrency(transaction.fraud_check_result.details.amount_check.customer_mean)}
                      />
                    </ListItem>
                  </List>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Transaction Details */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Additional Details
          </Typography>
          <List dense disablePadding>
            <ListItem>
              <ListItemText
                primary="Payment Method"
                secondary={transaction.payment_method}
              />
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemText
                primary="Items"
                secondary={transaction.items}
              />
            </ListItem>
          </List>
        </Paper>
      </DialogContent>
    </Dialog>
  );
}; 
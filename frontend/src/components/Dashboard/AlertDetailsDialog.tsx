import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { 
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Inventory as InventoryIcon,
  AccountBalance as TransactionIcon,
  SystemUpdate as SystemIcon
} from '@mui/icons-material';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface Alert {
  id: number;
  type: 'low_stock' | 'suspicious_transaction' | 'system';
  message: string;
  severity: 'info' | 'warning' | 'error';
  alert_metadata: any;
  created_at: string;
}

interface AlertDetailsDialogProps {
  alert: Alert | null;
  open: boolean;
  onClose: () => void;
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

export const AlertDetailsDialog: React.FC<AlertDetailsDialogProps> = ({ alert, open, onClose }) => {
  const theme = useTheme();

  if (!alert) return null;

  const renderDetailedContent = () => {
    switch (alert.type) {
      case 'low_stock':
        return (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Stock Quantity</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alert.alert_metadata.products.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell align="right">{product.stock_quantity}</TableCell>
                    <TableCell>
                      <Chip
                        label={product.stock_quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                        color={product.stock_quantity === 0 ? 'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'suspicious_transaction':
        return (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alert.alert_metadata.transactions.map((transaction: any) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.id}</TableCell>
                    <TableCell align="right">{formatCurrency(transaction.amount)}</TableCell>
                    <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status}
                        color="error"
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'system':
        return (
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {alert.alert_metadata.details || alert.message}
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          backgroundImage: 'none'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 2,
        pb: 1
      }}>
        <AlertIcon type={alert.type} severity={alert.severity} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" component="div">
            {alert.message}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDate(alert.created_at)}
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {renderDetailedContent()}
      </DialogContent>
    </Dialog>
  );
}; 
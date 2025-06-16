import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import { 
  DataGrid, 
  GridColDef, 
  GridRenderCellParams,
  GridValueFormatterParams,
  GridRowParams 
} from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { 
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { Widget } from '../components/shared/Widget';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CustomerDetailsDialog } from '../components/Customers/CustomerDetailsDialog';

interface Customer {
  id: number;
  email: string;
  registration_date: string;
  total_spent: number;
  risk_score: number;
}

interface PieChartEntry {
  name: string;
  value: number;
  color: string;
  description: string;
}

interface CustomerResponse {
  items: Customer[];
  total: number;
  page: number;
  pages: number;
  has_more: boolean;
}

interface CustomerBehavior {
  purchase_frequency: {
    average_purchases: number;
    frequency_distribution: {
      single_purchase: number;
      '2-5_purchases': number;
      '6+_purchases': number;
    };
  };
  customer_segments: {
    high_value: number;
    medium_value: number;
    low_value: number;
  };
  retention_metrics: {
    retention_rate: number;
    total_customers: number;
    retained_customers: number;
  };
}

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'email', headerName: 'Email', width: 250, flex: 1 },
  {
    field: 'registration_date',
    headerName: 'Registration Date',
    width: 180,
    valueFormatter: (params: GridValueFormatterParams) => formatDate(params.value as string),
  },
  {
    field: 'total_spent',
    headerName: 'Total Spent',
    width: 150,
    valueFormatter: (params: GridValueFormatterParams) => formatCurrency(params.value as number),
    cellClassName: 'font-tabular-nums',
  },
  {
    field: 'risk_score',
    headerName: 'Risk Score',
    width: 150,
    renderCell: (params: GridRenderCellParams<Customer>) => {
      const score = params.value as number;
      const color = score >= 0.7 ? 'error' : score >= 0.4 ? 'warning' : 'success';
      return (
        <Chip
          label={`${(score * 100).toFixed(0)}%`}
          color={color}
          size="small"
          icon={score >= 0.7 ? <WarningIcon /> : undefined}
          sx={{ minWidth: 80, justifyContent: 'center' }}
        />
      );
    },
  },
];

const StyledMetricPaper = ({ children, ...props }: { children: React.ReactNode; sx?: any }) => (
  <Paper
    {...props}
    sx={{
      p: 3,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: (theme) => theme.shadows[4],
      },
      ...props.sx,
    }}
  >
    {children}
  </Paper>
);

export const Customers: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 50,
    page: 0,
  });
  
  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = React.useDeferredValue(searchTerm);

  const { data: customersData, isLoading: isLoadingCustomers } = useQuery<CustomerResponse>({
    queryKey: ['customers', paginationModel.page, paginationModel.pageSize, debouncedSearchTerm],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        skip: (paginationModel.page * paginationModel.pageSize).toString(),
        limit: paginationModel.pageSize.toString(),
      });
      
      if (debouncedSearchTerm) {
        searchParams.append('search', debouncedSearchTerm);
      }
      
      const response = await fetch(`/api/v1/customers?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      return response.json();
    },
  });

  const { data: behavior, isLoading: isLoadingBehavior } = useQuery<CustomerBehavior>({
    queryKey: ['customerBehavior'],
    queryFn: async () => {
      const response = await fetch('/api/v1/customers/behavior');
      if (!response.ok) {
        throw new Error('Failed to fetch customer behavior');
      }
      return response.json();
    },
  });

  // Calculate metrics
  const retentionRate = behavior?.retention_metrics.retention_rate ?? 0;
  const activeCustomerRate = behavior ? (behavior.retention_metrics.retained_customers / behavior.retention_metrics.total_customers * 100) : 0;
  const avgOrderValue = behavior && behavior.retention_metrics.total_customers > 0 
    ? (behavior.customer_segments.high_value * 1500 + behavior.customer_segments.medium_value * 750 + behavior.customer_segments.low_value * 250) / behavior.retention_metrics.total_customers 
    : 0;

  const segmentData: PieChartEntry[] = behavior ? [
    { 
      name: 'High Value', 
      value: behavior.customer_segments.high_value, 
      color: theme.palette.success.main,
      description: '> $1,000 spent'
    },
    { 
      name: 'Medium Value', 
      value: behavior.customer_segments.medium_value, 
      color: theme.palette.warning.main,
      description: '$500 - $1,000 spent'
    },
    { 
      name: 'Low Value', 
      value: behavior.customer_segments.low_value, 
      color: theme.palette.error.main,
      description: '< $500 spent'
    },
  ] : [];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: theme.shadows[2],
          }}
        >
          <Typography variant="subtitle2" color="text.primary">
            {data.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data.description}
          </Typography>
          <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
            {data.value} customers
          </Typography>
        </Box>
      );
    }
    return null;
  };

  const handleRowClick = (params: GridRowParams<Customer>) => {
    setSelectedCustomerId(params.row.id);
    setIsDetailsDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Customer Management</Typography>
        <TextField
          size="small"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ 
            width: 300,
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.paper',
            }
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Customer Overview Metrics */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <StyledMetricPaper>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Customers
                </Typography>
                <Typography variant="h4">
                  {isLoadingBehavior ? (
                    <CircularProgress size={20} />
                  ) : (
                    behavior?.retention_metrics.total_customers.toLocaleString()
                  )}
                </Typography>
              </StyledMetricPaper>
            </Grid>
            <Grid item xs={12} md={4}>
              <StyledMetricPaper>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Retention Rate
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h4">
                    {isLoadingBehavior ? (
                      <CircularProgress size={20} />
                    ) : (
                      `${retentionRate.toFixed(1)}%`
                    )}
                  </Typography>
                  {retentionRate >= 70 ? (
                    <TrendingUpIcon color="success" sx={{ ml: 1 }} />
                  ) : (
                    <TrendingDownIcon color="error" sx={{ ml: 1 }} />
                  )}
                </Box>
              </StyledMetricPaper>
            </Grid>
            <Grid item xs={12} md={4}>
              <StyledMetricPaper>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Avg. Purchases
                </Typography>
                <Typography variant="h4">
                  {isLoadingBehavior ? (
                    <CircularProgress size={20} />
                  ) : (
                    behavior?.purchase_frequency.average_purchases.toFixed(1)
                  )}
                </Typography>
              </StyledMetricPaper>
            </Grid>
          </Grid>
        </Grid>

        {/* Customer List */}
        <Grid item xs={12} md={8}>
          <Widget title="Customer List">
            <Box sx={{ height: 600, width: '100%' }}>
              {isLoadingCustomers ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              ) : (
                <DataGrid
                  rows={customersData?.items ?? []}
                  columns={columns}
                  rowCount={customersData?.total ?? 0}
                  pageSizeOptions={[25, 50, 100]}
                  paginationModel={paginationModel}
                  paginationMode="server"
                  onPaginationModelChange={setPaginationModel}
                  disableRowSelectionOnClick
                  onRowClick={handleRowClick}
                  filterMode="server"
                  loading={isLoadingCustomers}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 50,
                      },
                    },
                  }}
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-cell': {
                      borderColor: 'divider',
                      cursor: 'pointer',
                    },
                    '& .MuiDataGrid-row:hover': {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                    },
                    '& .MuiDataGrid-columnHeaders': {
                      bgcolor: 'background.paper',
                      borderColor: 'divider',
                    },
                    '& .font-tabular-nums': {
                      fontFeatureSettings: '"tnum"',
                      fontVariantNumeric: 'tabular-nums',
                    },
                  }}
                />
              )}
            </Box>
          </Widget>
        </Grid>

        {/* Customer Segments */}
        <Grid item xs={12} md={4}>
          <Widget title="Customer Segments">
            {isLoadingBehavior ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ height: 400, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={segmentData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      innerRadius={60}
                      paddingAngle={2}
                    >
                      {segmentData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke={theme.palette.background.paper}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value: string, entry: any) => (
                        <span style={{ color: theme.palette.text.primary }}>
                          {value}: {entry.payload.value} customers
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Widget>
        </Grid>

        {/* Purchase Frequency Distribution */}
        <Grid item xs={12}>
          <Widget title="Purchase Frequency Distribution">
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <StyledMetricPaper sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Single Purchase
                  </Typography>
                  <Typography variant="h4">
                    {isLoadingBehavior ? (
                      <CircularProgress size={20} />
                    ) : (
                      behavior?.purchase_frequency.frequency_distribution.single_purchase
                    )}
                  </Typography>
                </StyledMetricPaper>
              </Grid>
              <Grid item xs={12} md={4}>
                <StyledMetricPaper sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    2-5 Purchases
                  </Typography>
                  <Typography variant="h4">
                    {isLoadingBehavior ? (
                      <CircularProgress size={20} />
                    ) : (
                      behavior?.purchase_frequency.frequency_distribution['2-5_purchases']
                    )}
                  </Typography>
                </StyledMetricPaper>
              </Grid>
              <Grid item xs={12} md={4}>
                <StyledMetricPaper sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    6+ Purchases
                  </Typography>
                  <Typography variant="h4">
                    {isLoadingBehavior ? (
                      <CircularProgress size={20} />
                    ) : (
                      behavior?.purchase_frequency.frequency_distribution['6+_purchases']
                    )}
                  </Typography>
                </StyledMetricPaper>
              </Grid>
            </Grid>
          </Widget>
        </Grid>
      </Grid>

      <CustomerDetailsDialog
        open={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        customerId={selectedCustomerId}
      />
    </Box>
  );
}; 
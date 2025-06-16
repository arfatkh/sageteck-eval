import React, { useState } from 'react';
import { 
  Box, 
  useTheme, 
  FormControl, 
  Select, 
  MenuItem, 
  Typography,
  Stack,
  SelectChangeEvent,
  NoSsr 
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../utils/api';
import { formatCurrency } from '../../utils/formatters';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { format, parseISO } from 'date-fns';
import { alpha } from '@mui/material/styles';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardMetrics {
  sales: {
    total: number;
    total_lifetime: number;
    hourly_breakdown: Array<{
      hour: string;
      total_sales: number;
      num_transactions: number;
    }>;
  };
  customers: {
    total_customers: number;
    average_spent: number;
    high_risk_customers: number;
  };
  transactions: {
    transaction_count: number;
    total_amount: number;
    total_sales: number;
    average_amount: number;
  };
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

type TimeRange = '24h' | '7d' | '30d' | '90d';

const timeRangeOptions = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
];

export const SalesChart: React.FC = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');

  const { data: metrics, isLoading, error } = useQuery<DashboardMetrics>({
    queryKey: ['dashboardMetrics', timeRange],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/overview', {
        params: { time_range: timeRange }
      });
      return response.data;
    },
    refetchInterval: 30000,
  });

  const handleTimeRangeChange = (event: SelectChangeEvent<TimeRange>) => {
    setTimeRange(event.target.value as TimeRange);
  };

  const formatLabel = (timestamp: string) => {
    const date = parseISO(timestamp);
    if (timeRange === '24h') {
      return format(date, 'HH:mm');
    } else if (timeRange === '7d') {
      return format(date, 'EEE HH:mm');
    } else {
      return format(date, 'MMM d');
    }
  };

  // Calculate moving averages for smoother lines
  const calculateMovingAverage = (data: number[], windowSize: number) => {
    return data.map((_, index) => {
      const start = Math.max(0, index - windowSize + 1);
      const window = data.slice(start, index + 1);
      return window.reduce((sum, val) => sum + val, 0) / window.length;
    });
  };

  const hourlyData = metrics?.sales?.hourly_breakdown || [];
  const rawSales = hourlyData.map(item => item.total_sales);
  const rawTransactions = hourlyData.map(item => item.num_transactions);
  
  // Use moving average for smoother lines, adjust window size based on time range
  const movingAverageWindow = timeRange === '24h' ? 3 : timeRange === '7d' ? 6 : 12;
  const smoothedSales = calculateMovingAverage(rawSales, movingAverageWindow);
  const smoothedTransactions = calculateMovingAverage(rawTransactions, movingAverageWindow);

  const chartData: ChartData<'line'> = {
    labels: hourlyData.map(item => formatLabel(item.hour)),
    datasets: [
      {
        label: 'Sales ($)',
        data: smoothedSales,
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
        pointRadius: timeRange === '24h' ? 2 : 1,
        borderWidth: 2,
      },
      {
        label: 'Transactions',
        data: smoothedTransactions,
        borderColor: theme.palette.secondary.main,
        backgroundColor: alpha(theme.palette.secondary.main, 0.1),
        fill: true,
        tension: 0.4,
        yAxisID: 'transactions',
        pointRadius: timeRange === '24h' ? 2 : 1,
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          color: theme.palette.text.primary,
        },
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const value = context.raw as number;
            if (context.dataset.yAxisID === 'y') {
              return `Sales: ${formatCurrency(value)}`;
            }
            return `Transactions: ${value.toFixed(0)}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'category',
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          color: theme.palette.text.secondary,
          autoSkip: true,
          maxTicksLimit: timeRange === '24h' ? 12 : timeRange === '7d' ? 14 : 10,
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        grid: {
          color: alpha(theme.palette.divider, 0.1),
        },
        ticks: {
          callback: (value) => formatCurrency(value as number),
          maxTicksLimit: 8,
          color: theme.palette.text.secondary,
        },
      },
      transactions: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 8,
          color: theme.palette.text.secondary,
        },
      },
    },
  };

  return (
    <Box sx={{ height: 400, position: 'relative' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={timeRange}
            onChange={handleTimeRangeChange}
            variant="outlined"
            sx={{
              '& .MuiSelect-select': {
                py: 1,
              },
            }}
          >
            {timeRangeOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {metrics?.sales?.total !== undefined && metrics.sales.total > 0 && (
          <Typography variant="body2" color="text.secondary">
            Total Sales: {formatCurrency(metrics.sales.total)}
          </Typography>
        )}
      </Stack>
      
      <NoSsr>
        {isLoading ? (
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Typography color="text.secondary">Loading sales data...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Typography color="error">Error loading sales data</Typography>
          </Box>
        ) : hourlyData.length === 0 ? (
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Typography color="text.secondary">
              No sales data available for the selected time range
            </Typography>
          </Box>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </NoSsr>
    </Box>
  );
}; 
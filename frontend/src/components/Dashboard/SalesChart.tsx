import React from 'react';
import { Box, useTheme } from '@mui/material';
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
    total_24h: number;
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

export const SalesChart: React.FC = () => {
  const theme = useTheme();

  const { data: metrics } = useQuery<DashboardMetrics>({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/overview');
      return response.data;
    },
    refetchInterval: 30000,
  });

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
  
  // Use 3-hour moving average for smoother lines
  const smoothedSales = calculateMovingAverage(rawSales, 3);
  const smoothedTransactions = calculateMovingAverage(rawTransactions, 3);

  const chartData: ChartData<'line'> = {
    labels: hourlyData.map(item => format(parseISO(item.hour), 'HH:mm')),
    datasets: [
      {
        label: 'Sales ($)',
        data: smoothedSales,
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
        pointRadius: 2,
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
        pointRadius: 2,
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
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
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
        },
      },
    },
  };

  return (
    <Box sx={{ height: 400, position: 'relative' }}>
      <Line data={chartData} options={options} />
    </Box>
  );
}; 
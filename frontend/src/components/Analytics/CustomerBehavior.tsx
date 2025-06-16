import React from 'react';
import { Box, Grid, Paper, Typography, useTheme, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../utils/api';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { alpha } from '@mui/material/styles';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CustomerBehaviorData {
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

interface CustomersResponse {
  total: number;
  items: any[];
  page: number;
  pages: number;
}

const MetricCard = ({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) => (
  <Paper
    sx={{
      p: 2,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
    }}
  >
    <Typography variant="h6" color="text.secondary" gutterBottom>
      {title}
    </Typography>
    <Typography variant="h4" sx={{ mb: 1 }}>
      {value}
    </Typography>
    {subtitle && (
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    )}
  </Paper>
);

export const CustomerBehavior: React.FC = () => {
  const theme = useTheme();

  const { data: behaviorData, isLoading: isLoadingBehavior } = useQuery<CustomerBehaviorData>({
    queryKey: ['customerBehavior'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/customer/behavior');
      return response.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: customersData, isLoading: isLoadingCustomers } = useQuery<CustomersResponse>({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await apiClient.get('/customers');
      return response.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const segmentChartData = {
    labels: ['High Value', 'Medium Value', 'Low Value'],
    datasets: [
      {
        data: behaviorData ? [
          behaviorData.customer_segments.high_value,
          behaviorData.customer_segments.medium_value,
          behaviorData.customer_segments.low_value,
        ] : [],
        backgroundColor: [
          theme.palette.success.main,
          theme.palette.primary.main,
          theme.palette.warning.main,
        ],
        borderColor: theme.palette.background.paper,
        borderWidth: 2,
      },
    ],
  };

  const frequencyChartData = {
    labels: ['Single Purchase', '2-5 Purchases', '6+ Purchases'],
    datasets: [
      {
        label: 'Number of Customers',
        data: behaviorData ? [
          behaviorData.purchase_frequency.frequency_distribution.single_purchase,
          behaviorData.purchase_frequency.frequency_distribution['2-5_purchases'],
          behaviorData.purchase_frequency.frequency_distribution['6+_purchases'],
        ] : [],
        backgroundColor: [
          alpha(theme.palette.primary.main, 0.6),
          alpha(theme.palette.primary.main, 0.8),
          alpha(theme.palette.primary.main, 1),
        ],
        borderColor: 'transparent',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: theme.palette.text.primary,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
      },
    },
  };

  if (isLoadingBehavior || isLoadingCustomers) {
    return (
      <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">Loading customer behavior data...</Typography>
      </Box>
    );
  }

  const totalCustomers = customersData?.total || 0;
  const activeCustomers = behaviorData?.retention_metrics.retained_customers || 0;
  const retentionRate = ((activeCustomers / totalCustomers) * 100).toFixed(1);

  return (
    <Grid container spacing={3}>
      {/* Metrics Cards */}
      <Grid item xs={12} md={4}>
        <MetricCard
          title="Total Registered Customers"
          value={totalCustomers.toLocaleString()}
          subtitle="All customers who have registered"
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <MetricCard
          title="Active Customers (30d)"
          value={activeCustomers.toLocaleString()}
          subtitle="Customers with purchases in last 30 days"
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <MetricCard
          title="Retention Rate"
          value={`${retentionRate}%`}
          subtitle="Active vs Total Customers"
        />
      </Grid>

      {/* Charts */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Customer Segments
          </Typography>
          <Box sx={{ height: 320 }}>
            <Doughnut data={segmentChartData} options={chartOptions} />
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Purchase Frequency Distribution
          </Typography>
          <Box sx={{ height: 320 }}>
            <Bar
              data={frequencyChartData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: theme.palette.divider,
                    },
                    ticks: {
                      color: theme.palette.text.secondary,
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                    ticks: {
                      color: theme.palette.text.secondary,
                    },
                  },
                },
              }}
            />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}; 
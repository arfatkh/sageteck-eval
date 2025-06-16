import React from 'react';
import { Box, Grid, Paper, Typography, useTheme } from '@mui/material';
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

  const { data, isLoading } = useQuery<CustomerBehaviorData>({
    queryKey: ['customerBehavior'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/customer/behavior');
      return response.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const segmentChartData = {
    labels: ['High Value', 'Medium Value', 'Low Value'],
    datasets: [
      {
        data: data ? [
          data.customer_segments.high_value,
          data.customer_segments.medium_value,
          data.customer_segments.low_value,
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
        data: data ? [
          data.purchase_frequency.frequency_distribution.single_purchase,
          data.purchase_frequency.frequency_distribution['2-5_purchases'],
          data.purchase_frequency.frequency_distribution['6+_purchases'],
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

  if (isLoading) {
    return (
      <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">Loading customer behavior data...</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Metrics Cards */}
      <Grid item xs={12} md={4}>
        <MetricCard
          title="Total Customers"
          value={data?.retention_metrics.total_customers.toLocaleString() || '0'}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <MetricCard
          title="Retention Rate"
          value={`${data?.retention_metrics.retention_rate.toFixed(1)}%`}
          subtitle={`${data?.retention_metrics.retained_customers.toLocaleString()} retained customers`}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <MetricCard
          title="Average Purchases"
          value={data?.purchase_frequency.average_purchases.toFixed(1) || '0'}
          subtitle="purchases per customer"
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
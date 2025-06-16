import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../utils/api';
import { useTheme } from '@mui/material/styles';
import { formatCurrency } from '../../utils/formatters';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ProductPerformance {
  top_products: Array<{
    id: number;
    name: string;
    category: string;
    units_sold: number;
    revenue: number;
    stock_quantity: number;
  }>;
  category_performance: {
    [category: string]: {
      total_revenue: number;
      units_sold: number;
      avg_turnover: number;
    };
  };
}

const MetricCard = ({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) => (
  <Box sx={{ textAlign: 'center', p: 1 }}>
    <Typography variant="body2" color="text.secondary" gutterBottom>
      {title}
    </Typography>
    <Typography variant="h6" sx={{ mb: 0.5 }}>
      {value}
    </Typography>
    {subtitle && (
      <Typography variant="caption" color="text.secondary">
        {subtitle}
      </Typography>
    )}
  </Box>
);

export const SalesByCategory: React.FC = () => {
  const theme = useTheme();

  const { data, isLoading } = useQuery<ProductPerformance>({
    queryKey: ['productPerformance'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/product/performance');
      return response.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const chartData: ChartData<'doughnut'> = {
    labels: data ? Object.keys(data.category_performance) : [],
    datasets: [
      {
        data: data ? Object.values(data.category_performance).map(cat => cat.total_revenue) : [],
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.success.main,
          theme.palette.warning.main,
          theme.palette.error.main,
          theme.palette.info.main,
        ],
        borderColor: theme.palette.background.paper,
        borderWidth: 2,
      },
    ],
  };

  const options = {
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
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, index: number) => {
                const value = data.datasets[0].data[index];
                const total = data.datasets[0].data.reduce((acc: number, val: number) => acc + val, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[index],
                  strokeStyle: data.datasets[0].borderColor,
                  lineWidth: data.datasets[0].borderWidth,
                  hidden: false,
                  index,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const total = context.dataset.data.reduce((acc: number, val: number) => acc + val, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  if (isLoading) {
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">Loading category data...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Category Revenue Distribution Chart */}
      <Box sx={{ height: 300, position: 'relative' }}>
        <Doughnut data={chartData} options={options} />
      </Box>

      {/* Category Performance Metrics */}
      {data && (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {Object.entries(data.category_performance).map(([category, metrics]) => (
            <Grid item xs={12} key={category}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {category}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <MetricCard
                      title="Revenue"
                      value={formatCurrency(metrics.total_revenue)}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <MetricCard
                      title="Units Sold"
                      value={metrics.units_sold.toLocaleString()}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <MetricCard
                      title="Avg Turnover"
                      value={metrics.avg_turnover.toFixed(1)}
                      subtitle="units per product"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}; 
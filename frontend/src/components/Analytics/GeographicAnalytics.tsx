import React from 'react';
import { Box, Grid, Paper, Typography, useTheme } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../utils/api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { alpha } from '@mui/material/styles';
import { formatCurrency } from '../../utils/formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RegionalSales {
  region: string;
  total_sales: number;
  num_customers: number;
  num_products: number;
}

interface RegionalPreference {
  product_name: string;
  category: string;
  units_sold: number;
}

interface GeographicData {
  regional_sales: RegionalSales[];
  regional_preferences: {
    [region: string]: RegionalPreference[];
  };
}

const RegionCard = ({ region, data }: { region: string; data: RegionalPreference[] }) => (
  <Paper sx={{ p: 2, height: '100%' }}>
    <Typography variant="h6" gutterBottom>
      {region}
    </Typography>
    <Box component="ul" sx={{ pl: 2, mt: 1 }}>
      {data.map((item, index) => (
        <Box component="li" key={index} sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.primary">
            {item.product_name}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {item.category}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.units_sold.toLocaleString()} units
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  </Paper>
);

export const GeographicAnalytics: React.FC = () => {
  const theme = useTheme();

  const { data, isLoading } = useQuery<GeographicData>({
    queryKey: ['geographicAnalytics'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/geographic');
      return response.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const salesChartData = {
    labels: data?.regional_sales.map(item => item.region) || [],
    datasets: [
      {
        label: 'Total Sales',
        data: data?.regional_sales.map(item => item.total_sales) || [],
        backgroundColor: alpha(theme.palette.primary.main, 0.8),
        borderColor: 'transparent',
      },
      {
        label: 'Number of Customers',
        data: data?.regional_sales.map(item => item.num_customers) || [],
        backgroundColor: alpha(theme.palette.secondary.main, 0.8),
        borderColor: 'transparent',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: theme.palette.text.primary,
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
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label;
            const value = context.raw;
            return label === 'Total Sales'
              ? `${label}: ${formatCurrency(value)}`
              : `${label}: ${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
        },
      },
      y: {
        grid: {
          color: theme.palette.divider,
        },
        ticks: {
          color: theme.palette.text.secondary,
        },
      },
    },
  };

  if (isLoading) {
    return (
      <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">Loading geographic data...</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Regional Sales Chart */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Regional Sales Distribution
          </Typography>
          <Box sx={{ height: 320 }}>
            <Bar data={salesChartData} options={chartOptions} />
          </Box>
        </Paper>
      </Grid>

      {/* Top Products by Region */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ px: 1 }}>
          Top Products by Region
        </Typography>
        <Grid container spacing={2}>
          {data && Object.entries(data.regional_preferences).map(([region, preferences]) => (
            <Grid item xs={12} sm={6} md={4} key={region}>
              <RegionCard region={region} data={preferences} />
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
}; 
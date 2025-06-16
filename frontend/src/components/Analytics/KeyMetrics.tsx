import React from 'react';
import { Box, Grid, Typography, Skeleton } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../utils/api';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface Metric {
  label: string;
  value: number;
  change: number;
  format: 'currency' | 'number' | 'percent';
}

interface MetricCardProps {
  metric: Metric;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const formatValue = (value: number, format: Metric['format']) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      case 'percent':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
      }}
    >
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {metric.label}
      </Typography>
      <Typography variant="h4" component="div" sx={{ mb: 1 }}>
        {formatValue(metric.value, metric.format)}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {metric.change > 0 ? (
          <TrendingUpIcon
            sx={{ color: 'success.main', fontSize: 20, mr: 0.5 }}
          />
        ) : (
          <TrendingDownIcon
            sx={{ color: 'error.main', fontSize: 20, mr: 0.5 }}
          />
        )}
        <Typography
          variant="body2"
          color={metric.change > 0 ? 'success.main' : 'error.main'}
        >
          {metric.change > 0 ? '+' : ''}
          {metric.change}%
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
          vs last period
        </Typography>
      </Box>
    </Box>
  );
};

export const KeyMetrics: React.FC = () => {
  const { data: metrics, isLoading } = useQuery<Metric[]>({
    queryKey: ['keyMetrics'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/key-metrics');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3, 4].map((key) => (
          <Grid item xs={12} sm={6} key={key}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Skeleton variant="text" width="40%" height={24} />
              <Skeleton variant="text" width="60%" height={40} sx={{ my: 1 }} />
              <Skeleton variant="text" width="80%" height={24} />
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      {metrics?.map((metric, index) => (
        <Grid item xs={12} sm={6} key={index}>
          <MetricCard metric={metric} />
        </Grid>
      ))}
    </Grid>
  );
}; 
import React from 'react';
import { Box } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../utils/api';
import { alpha, useTheme } from '@mui/material/styles';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RevenueData {
  date: string;
  revenue: number;
}

export const RevenueTrends: React.FC = () => {
  const theme = useTheme();

  const { data: revenueData, isLoading } = useQuery<RevenueData[]>({
    queryKey: ['revenueTrends'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/revenue-trends');
      return response.data;
    },
  });

  const chartData = {
    labels: revenueData?.map(item => item.date) || [],
    datasets: [
      {
        label: 'Revenue',
        data: revenueData?.map(item => item.revenue) || [],
        fill: true,
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        borderColor: theme.palette.primary.main,
        tension: 0.4,
        pointRadius: 2,
        pointBackgroundColor: theme.palette.primary.main,
        pointBorderColor: theme.palette.background.paper,
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        type: 'category' as const,
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
        },
      },
      y: {
        type: 'linear' as const,
        beginAtZero: true,
        grid: {
          color: theme.palette.divider,
          drawBorder: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
          callback: function(this: any, value: number | string) {
            if (typeof value === 'number') {
              return `$${value.toLocaleString()}`;
            }
            return value;
          },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  } as const;

  return (
    <Box sx={{ width: '100%', height: '100%', minHeight: 400 }}>
      {!isLoading && <Line data={chartData} options={options} />}
    </Box>
  );
}; 
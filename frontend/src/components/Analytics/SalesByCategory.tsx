import React from 'react';
import { Box, Typography } from '@mui/material';
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

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryData {
  category: string;
  sales: number;
}

export const SalesByCategory: React.FC = () => {
  const theme = useTheme();

  const { data: categoryData, isLoading } = useQuery<CategoryData[]>({
    queryKey: ['salesByCategory'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/sales-by-category');
      return response.data;
    },
  });

  const chartData: ChartData<'doughnut'> = {
    labels: categoryData?.map(item => item.category) || [],
    datasets: [
      {
        data: categoryData?.map(item => item.sales) || [],
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
            return `${context.label}: $${value.toLocaleString()} (${percentage}%)`;
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
    <Box sx={{ height: 300, position: 'relative' }}>
      <Doughnut data={chartData} options={options} />
    </Box>
  );
}; 
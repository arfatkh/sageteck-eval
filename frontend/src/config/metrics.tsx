import React from 'react';
import { TrendingUp } from '@mui/icons-material';
import { MetricCardProps } from '../components/shared/MetricCard';

export const metrics: MetricCardProps[] = [
  {
    title: 'Total Sales',
    value: '$12,345',
    trend: 12.5,
    trendLabel: 'vs last month',
    icon: <TrendingUp />,
    color: '#2196f3'
  },
  // ... other metrics
]; 
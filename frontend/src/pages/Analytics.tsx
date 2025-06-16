import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { Widget } from '../components/shared/Widget';
import { RevenueTrends } from '../components/Analytics/RevenueTrends';
import { KeyMetrics } from '../components/Analytics/KeyMetrics';
import { SalesByCategory } from '../components/Analytics/SalesByCategory';

export const Analytics: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Analytics
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <KeyMetrics />
        </Grid>
        <Grid item xs={12} md={8}>
          <Widget title="Revenue Trends">
            <RevenueTrends />
          </Widget>
        </Grid>
        <Grid item xs={12} md={4}>
          <Widget title="Sales by Category">
            <SalesByCategory />
          </Widget>
        </Grid>
      </Grid>
    </Box>
  );
}; 
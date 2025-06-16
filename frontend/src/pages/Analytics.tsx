import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { Widget } from '../components/shared/Widget';
import { KeyMetrics } from '../components/Analytics/KeyMetrics';
import { SalesByCategory } from '../components/Analytics/SalesByCategory';
import { CustomerBehavior } from '../components/Analytics/CustomerBehavior';
import { GeographicAnalytics } from '../components/Analytics/GeographicAnalytics';

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
        <Grid item xs={12}>
          <Widget title="Sales by Category">
            <SalesByCategory />
          </Widget>
        </Grid>
        <Grid item xs={12}>
          <Widget title="Customer Behavior Analysis">
            <CustomerBehavior />
          </Widget>
        </Grid>
        <Grid item xs={12}>
          <Widget title="Geographic Distribution">
            <GeographicAnalytics />
          </Widget>
        </Grid>
      </Grid>
    </Box>
  );
}; 
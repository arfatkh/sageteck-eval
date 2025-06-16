import React from 'react';
import { Grid, Paper, Typography, Box, Skeleton, Tooltip } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../utils/api';
import { formatCurrency } from '../../utils/formatters';
import { alpha } from '@mui/material/styles';

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
`;

const MetricCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  display: 'flex',
  alignItems: 'center',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  border: '1px solid',
  borderColor: alpha(theme.palette.common.white, 0.1),
  height: '100%',
  minHeight: '100px',
  position: 'relative',
  transition: 'all 0.2s ease-in-out',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[3],
    borderColor: alpha(theme.palette.primary.main, 0.2),
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 'inherit',
    background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
    pointerEvents: 'none',
    opacity: 0.5,
  }
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 48,
  height: 48,
  borderRadius: '12px',
  marginRight: theme.spacing(2.5),
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 'inherit',
    border: '1px solid',
    borderColor: 'currentColor',
    opacity: 0.2,
  },
  '& svg': {
    fontSize: 24,
  }
}));

const ValueChange = styled(Typography)<{ trend: 'up' | 'down' | 'neutral' }>(({ theme, trend }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: trend === 'up' ? theme.palette.success.main 
    : trend === 'down' ? theme.palette.error.main 
    : theme.palette.text.secondary,
  animation: `${pulseAnimation} 2s infinite`,
  '& svg': {
    fontSize: '1rem',
    marginRight: theme.spacing(0.5),
  }
}));

interface DashboardMetrics {
  sales: {
    total: number;
    total_lifetime: number;
    hourly_breakdown: Array<{
      hour: string;
      total_sales: number;
      num_transactions: number;
    }>;
  };
  customers: {
    total_customers: number;
    average_spent: number;
    high_risk_customers: number;
  };
  transactions: {
    transaction_count: number;
    total_amount: number;
    total_sales: number;
    average_amount: number;
  };
  alerts: {
    low_stock_products: Array<{
      id: number;
      name: string;
      stock_quantity: number;
      category: string;
    }>;
    suspicious_transactions: Array<{
      id: number;
      amount: number;
      timestamp: string;
      customer_id: number;
      status: string;
    }>;
  };
}

export const MetricsHeader: React.FC = () => {
  const { data: metrics, isLoading, isError } = useQuery<DashboardMetrics>({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/overview', {
        params: { time_range: '24h' }  // Always fetch 24h data for header metrics
      });
      return response.data;
    },
    refetchInterval: 30000,
  });

  // Calculate 24h change by comparing with previous day's average
  const calculate24hChange = (metrics: DashboardMetrics | undefined) => {
    if (!metrics?.sales?.hourly_breakdown) return { value: 0, trend: 'neutral' as const };
    
    const last24Hours = metrics.sales.hourly_breakdown;
    const totalSales = metrics.sales.total;
    const avgHourlySales = totalSales / 24;
    
    // Compare with the average
    const change = ((avgHourlySales - (totalSales / 24)) / (totalSales / 24)) * 100;
    return {
      value: Math.abs(change),
      trend: change > 0 ? 'up' as const : change < 0 ? 'down' as const : 'neutral' as const
    };
  };

  const metricCards = [
    {
      title: '24h Sales',
      value: formatCurrency(metrics?.sales?.total || 0),
      change: calculate24hChange(metrics),
      icon: <TrendingUpIcon />,
      color: '#4CAF50',
      tooltip: 'Total sales in the last 24 hours',
    },
    {
      title: 'Lifetime Sales',
      value: formatCurrency(metrics?.sales?.total_lifetime || 0),
      secondaryMetric: `Avg. ${formatCurrency(metrics?.customers?.average_spent || 0)} per customer`,
      icon: <ShowChartIcon />,
      color: '#9C27B0',
      tooltip: 'Total sales since the beginning',
    },
    {
      title: 'Active Customers',
      value: metrics?.customers?.total_customers || 0,
      secondaryMetric: `${metrics?.customers?.high_risk_customers || 0} high risk`,
      icon: <PeopleIcon />,
      color: '#2196F3',
      tooltip: 'Total number of customers and high risk count',
    },
    {
      title: 'Low Stock Items',
      value: metrics?.alerts?.low_stock_products?.length || 0,
      secondaryMetric: `${metrics?.alerts?.low_stock_products?.filter(p => p.stock_quantity === 0).length || 0} out of stock`,
      icon: <InventoryIcon />,
      color: '#FF9800',
      tooltip: 'Products with low stock levels',
    },
    {
      title: 'Suspicious Transactions',
      value: metrics?.alerts?.suspicious_transactions?.length || 0,
      secondaryMetric: metrics?.alerts?.suspicious_transactions?.length 
        ? formatCurrency(metrics.alerts.suspicious_transactions.reduce((sum, t) => sum + t.amount, 0))
        : '$0',
      icon: <WarningIcon />,
      color: '#F44336',
      tooltip: 'Number and total amount of suspicious transactions detected',
    },
  ];

  if (isError) {
    return (
      <Typography color="error" align="center">
        Error loading metrics. Please try again later.
      </Typography>
    );
  }

  return (
    <Box sx={{ height: '240px' }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* Left Column */}
        <Grid item xs={12} md={3} sx={{ height: '100%' }}>
          <Grid container spacing={2} sx={{ height: '100%' }}>
            <Grid item xs={12} sx={{ height: '50%' }}>
              <Tooltip title={metricCards[0].tooltip} arrow>
                <MetricCard>
                  <IconWrapper sx={{ bgcolor: `${metricCards[0].color}15` }}>
                    <Box sx={{ color: metricCards[0].color }}>{metricCards[0].icon}</Box>
                  </IconWrapper>
                  <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {metricCards[0].title}
                    </Typography>
                    {isLoading ? (
                      <Skeleton variant="text" width="80%" height={24} />
                    ) : (
                      <>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                          {metricCards[0].value}
                        </Typography>
                        {metricCards[0].change && (
                          <ValueChange trend={metricCards[0].change.trend} variant="caption">
                            {metricCards[0].change.trend === 'up' ? '↑' : metricCards[0].change.trend === 'down' ? '↓' : '•'}
                            {' '}
                            {metricCards[0].change.value.toFixed(1)}%
                          </ValueChange>
                        )}
                      </>
                    )}
                  </Box>
                </MetricCard>
              </Tooltip>
            </Grid>
            <Grid item xs={12} sx={{ height: '50%' }}>
              <MetricCard sx={{
                background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.info.dark, 0.15)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`
              }}>
                <IconWrapper sx={{ bgcolor: (theme) => alpha(theme.palette.info.main, 0.15) }}>
                  <Box sx={{ color: 'info.main' }}>
                    <ShowChartIcon />
                  </Box>
                </IconWrapper>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Avg Order
                  </Typography>
                  {isLoading ? (
                    <Skeleton variant="text" width="80%" height={24} />
                  ) : (
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {formatCurrency((metrics?.sales?.total || 0) / (metrics?.transactions?.transaction_count || 1))}
                    </Typography>
                  )}
                </Box>
              </MetricCard>
            </Grid>
          </Grid>
        </Grid>

        {/* Center Column - Lifetime Sales */}
        <Grid item xs={12} md={6} sx={{ height: '100%' }}>
          <Tooltip title={metricCards[1].tooltip} arrow>
            <MetricCard sx={{
              height: '100%',
              background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.15)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <IconWrapper sx={{ 
                width: 64,
                height: 64,
                marginRight: 0,
                marginBottom: 2,
                bgcolor: `${metricCards[1].color}15`,
                '& svg': { fontSize: 32 }
              }}>
                <Box sx={{ color: metricCards[1].color }}>{metricCards[1].icon}</Box>
              </IconWrapper>
              <Box>
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  {metricCards[1].title}
                </Typography>
                {isLoading ? (
                  <Skeleton variant="text" width="160px" height={48} />
                ) : (
                  <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
                    {metricCards[1].value}
                  </Typography>
                )}
              </Box>
            </MetricCard>
          </Tooltip>
        </Grid>

        {/* Right Column - Active Customers */}
        <Grid item xs={12} md={3} sx={{ height: '100%' }}>
          <Tooltip title={metricCards[2].tooltip} arrow>
            <MetricCard sx={{
              height: '100%',
              background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.info.dark, 0.15)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <IconWrapper sx={{ 
                width: 64,
                height: 64,
                marginRight: 0,
                marginBottom: 2,
                bgcolor: `${metricCards[2].color}15`,
                '& svg': { fontSize: 32 }
              }}>
                <Box sx={{ color: metricCards[2].color }}>{metricCards[2].icon}</Box>
              </IconWrapper>
              <Box>
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  {metricCards[2].title}
                </Typography>
                {isLoading ? (
                  <Skeleton variant="text" width="160px" height={48} />
                ) : (
                  <>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
                      {metricCards[2].value}
                    </Typography>
                    {metricCards[2].secondaryMetric && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {metricCards[2].secondaryMetric}
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            </MetricCard>
          </Tooltip>
        </Grid>
      </Grid>
    </Box>
  );
}; 
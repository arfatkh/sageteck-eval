import React from 'react';
import { Card, CardContent, Typography, Box, styled } from '@mui/material';
import { alpha, Theme } from '@mui/material/styles';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

export interface MetricCardProps {
  title: string;
  value: string | number;
  trend: number;
  trendLabel: string;
  icon?: React.ReactNode;
  color?: string;
}

interface IconWrapperProps {
  color?: string;
  theme?: Theme;
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const IconWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'color',
})<IconWrapperProps>(({ theme, color }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 48,
  height: 48,
  borderRadius: '50%',
  backgroundColor: alpha(color || theme.palette.primary.main, 0.1),
  color: color || theme.palette.primary.main,
  marginBottom: theme.spacing(2),
}));

interface TrendIndicatorProps {
  trend: number;
}

const TrendIndicator = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'trend',
})<TrendIndicatorProps>(({ theme, trend }) => ({
  display: 'flex',
  alignItems: 'center',
  color: trend >= 0 ? theme.palette.success.main : theme.palette.error.main,
  '& svg': {
    marginRight: theme.spacing(0.5),
  },
}));

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend,
  trendLabel,
  icon,
  color,
}) => {
  return (
    <StyledCard>
      <CardContent>
        {icon && <IconWrapper color={color}>{icon}</IconWrapper>}
        <Typography variant="h6" color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
          <TrendIndicator trend={trend}>
            {trend >= 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
            <Typography variant="body2" component="span">
              {Math.abs(trend)}%
            </Typography>
          </TrendIndicator>
          <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
            {trendLabel}
          </Typography>
        </Box>
      </CardContent>
    </StyledCard>
  );
}; 
import React from 'react';
import { Box, styled } from '@mui/material';
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { SalesChart } from './SalesChart';
import { MetricsHeader } from './MetricsHeader';
import { TopProductsTable } from './TopProductsTable';
import { RecentTransactions } from './RecentTransactions';
import { AlertsPanel } from './AlertsPanel';
import { Widget } from '../shared/Widget';

const ResponsiveGridLayout = WidthProvider(Responsive);

const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  minHeight: '100%',
  boxSizing: 'border-box',
  '& .layout': {
    margin: 0,
  }
}));

export const Dashboard: React.FC = () => {
  // Load saved layout from localStorage or use default
  const [layouts, setLayouts] = React.useState(() => {
    const savedLayouts = localStorage.getItem('dashboard-layouts');
    return savedLayouts ? JSON.parse(savedLayouts) : {
      lg: [
        { i: 'metrics', x: 0, y: 0, w: 12, h: 1, static: true },
        { i: 'sales', x: 0, y: 1, w: 8, h: 2 },
        { i: 'alerts', x: 8, y: 1, w: 4, h: 2 },
        { i: 'products', x: 0, y: 3, w: 8, h: 2 },
        { i: 'transactions', x: 8, y: 3, w: 4, h: 2 },
      ],
      md: [
        { i: 'metrics', x: 0, y: 0, w: 12, h: 1, static: true },
        { i: 'sales', x: 0, y: 1, w: 8, h: 2 },
        { i: 'alerts', x: 8, y: 1, w: 4, h: 2 },
        { i: 'products', x: 0, y: 3, w: 8, h: 2 },
        { i: 'transactions', x: 8, y: 3, w: 4, h: 2 },
      ],
      sm: [
        { i: 'metrics', x: 0, y: 0, w: 12, h: 1, static: true },
        { i: 'sales', x: 0, y: 1, w: 12, h: 2 },
        { i: 'alerts', x: 0, y: 3, w: 12, h: 2 },
        { i: 'products', x: 0, y: 5, w: 12, h: 2 },
        { i: 'transactions', x: 0, y: 7, w: 12, h: 2 },
      ],
    };
  });

  // Save layout changes to localStorage
  const onLayoutChange = (_: Layout[], allLayouts: Layouts) => {
    setLayouts(allLayouts);
    localStorage.setItem('dashboard-layouts', JSON.stringify(allLayouts));
  };

  return (
    <DashboardContainer>
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        rowHeight={250}
        margin={[16, 16]}
        isDraggable
        isResizable
        draggableHandle=".drag-handle"
        onLayoutChange={onLayoutChange}
      >
        <div key="metrics">
          <MetricsHeader />
        </div>
        <div key="sales">
          <Widget 
            title="Sales Performance" 
            actionText="View Details"
            onAction={() => {/* Handle navigation */}}
          >
            <SalesChart />
          </Widget>
        </div>
        <div key="alerts">
          <Widget 
            title="Active Alerts" 
            actionText="View All"
            onAction={() => {/* Handle navigation */}}
          >
            <AlertsPanel />
          </Widget>
        </div>
        <div key="products">
          <Widget 
            title="Top Products" 
            actionText="View All Products"
            onAction={() => {/* Handle navigation */}}
          >
            <TopProductsTable />
          </Widget>
        </div>
        <div key="transactions">
          <Widget 
            title="Recent Transactions" 
            actionText="View All"
            onAction={() => {/* Handle navigation */}}
          >
            <RecentTransactions />
          </Widget>
        </div>
      </ResponsiveGridLayout>
    </DashboardContainer>
  );
}; 
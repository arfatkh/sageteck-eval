# TechMart Analytics Frontend

React-based frontend application for the TechMart Analytics Dashboard.

## Technical Stack

- **Framework**: React
- **UI Library**: Material-UI (MUI)
- **State Management**: React Query
- **Charts**: Recharts
- **Type Checking**: TypeScript
- **Build Tool**: Vite

## Development Setup

### Prerequisites

- Node.js 16+
- npm or yarn
- Backend API running (see backend README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable components
│   │   ├── Dashboard/  # Dashboard components
│   │   ├── Customers/ # Customer management
│   │   └── Common/    # Shared components
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── hooks/         # Custom hooks
│   ├── utils/         # Utility functions
│   ├── types/         # TypeScript types
│   └── theme/         # MUI theme customization
├── public/           # Static assets
├── vite.config.ts    # Vite configuration
└── package.json     
```

## Key Features

### Dashboard Components

1. **MetricsHeader**
   - Real-time metrics display
   - Sales tracking
   - Customer statistics
   - Alert counters

2. **TransactionList**
   - Recent transactions
   - Fraud detection indicators
   - Transaction details dialog
   - Status tracking

3. **AlertsPanel**
   - System alerts display
   - Low stock warnings
   - Suspicious transaction alerts
   - Real-time updates

### Customer Management

1. **CustomerList**
   - Paginated customer view
   - Search functionality
   - Risk score display
   - Sorting capabilities

2. **CustomerDetails**
   - Customer metrics
   - Transaction history
   - Risk assessment
   - Behavior analysis

### Fraud Detection UI

1. **Transaction Monitoring**
   - Risk score display
   - Suspicious activity markers
   - Detailed fraud analysis
   - Alert generation

2. **Risk Visualization**
   - Risk score chips
   - Color-coded indicators
   - Trend analysis
   - Alert history

## State Management

The application uses React Query for:
- API data fetching
- Cache management
- Real-time updates
- Error handling

Example usage:
```typescript
const { data, isLoading } = useQuery('dashboard-metrics', fetchMetrics);
```

## Theme Customization

The application uses a custom Material-UI theme:

```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196F3',
    },
    secondary: {
      main: '#FF4081',
    },
  },
});
```

## Development Guidelines

### Component Structure

```typescript
interface ComponentProps {
  // Props definition
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Component logic
  return (
    // JSX
  );
};
```

### API Integration

Services are organized by domain:
```typescript
// services/transactionService.ts
export const getTransactions = async () => {
  const response = await api.get('/api/v1/transactions');
  return response.data;
};
```

## Building for Production

1. Build the application:
```bash
npm run build
```

2. Preview the build:
```bash
npm run preview
```

## Testing

Run the test suite:
```bash
npm test
```

Run with coverage:
```bash
npm run test:coverage
```

## Performance Optimization

The application implements several optimization techniques:

1. **Code Splitting**
   - Route-based splitting
   - Component lazy loading
   - Dynamic imports

2. **Caching**
   - React Query caching
   - API response caching
   - Static asset caching

3. **Bundle Optimization**
   - Tree shaking
   - Chunk splitting
   - Asset optimization

## Deployment

### Production Build

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Environment Variables

Required environment variables:
```
VITE_API_URL=http://localhost:8000
VITE_APP_ENV=production
```

## Troubleshooting

Common issues and solutions:

1. **API Connection Issues**
   - Check API URL in .env
   - Verify CORS settings
   - Check network connectivity

2. **Build Problems**
   - Clear node_modules and reinstall
   - Check for TypeScript errors
   - Verify dependency versions 

# Fraud Detection System - Technical Discussion

## Implementation Approach
Our fraud detection system implements a multi-layered approach using statistical analysis and real-time monitoring:

1. **Transaction Velocity Analysis**
   - Monitors transaction frequency within configurable time windows (currently 60 minutes)
   - Uses Redis for high-performance transaction counting
   - Threshold: 5 transactions per hour per customer

2. **Amount Anomaly Detection**
   - Implements z-score analysis on transaction amounts (threshold: 2.0 standard deviations)
   - Maintains running statistics of customer spending patterns
   - Requires minimum 3 transactions for baseline establishment

3. **Risk Scoring System**
   - Cumulative scoring: 0.5 points per detection trigger
   - Real-time score updates with transaction processing
   - Risk levels: Low (0-0.3), Medium (0.4-0.6), High (0.7+)

## Current Limitations
1. **Statistical Reliability**
   - Requires sufficient transaction history for accurate anomaly detection
   - New customers have limited baseline data
   - False positives possible during initial period

2. **Processing Delay**
   - Current synchronous processing can impact transaction speed
   - Database queries for historical data add latency
   - Redis caching helps but doesn't eliminate all delays

3. **Fixed Thresholds**
   - One-size-fits-all thresholds may not suit all customer types
   - Time windows are fixed rather than adaptive
   - Limited consideration of seasonal patterns

## Scalability Considerations
1. **Current Performance**
   - Handles ~1000 transactions per minute
   - Average processing time: 100ms per transaction
   - Redis caching reduces database load

2. **Bottlenecks**
   - Statistical calculations on large history sets
   - Database queries for customer history
   - Real-time alert generation

3. **Improvement Opportunities**
   - Implement async processing for non-critical checks
   - Add machine learning for adaptive thresholds
   - Introduce customer segmentation for varied rules
   - Implement batch processing for historical analysis
   - Add distributed processing for better scalability

## Future Enhancements
1. **Advanced Detection**
   - Machine learning models for pattern recognition
   - Network analysis for related fraud detection
   - Behavioral biometrics integration

2. **Performance Optimization**
   - Implement event streaming with Kafka
   - Add distributed processing with Celery
   - Optimize database queries with materialized views

3. **Enhanced Analytics**
   - Real-time fraud pattern visualization
   - Predictive risk modeling
   - Customer segment-specific rules 
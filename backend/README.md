# TechMart Analytics Backend

FastAPI-based backend service for the TechMart Analytics Dashboard.

## Technical Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT
- **Caching**: Redis
- **Container**: Docker

## Development Setup

### Local Development

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run development server:
```bash
uvicorn app.main:app --reload
```

### Docker Development

1. Build and start services:
```bash
docker-compose up -d --build
```

2. View logs:
```bash
docker-compose logs -f backend
```

## Project Structure

```
backend/
├── app/
│   ├── api/              # API endpoints
│   │   └── v1/          # API version 1
│   ├── core/            # Core configurations
│   ├── db/              # Database configurations
│   ├── models/          # SQLAlchemy models
│   ├── schemas/         # Pydantic schemas
│   ├── services/        # Business logic
│   └── utils/           # Utility functions
├── scripts/             # Management scripts
├── tests/               # Test suite
├── Dockerfile          
├── requirements.txt    
└── README.md          
```

## API Documentation

### Core Endpoints

#### Dashboard Overview
- `GET /api/v1/dashboard/overview`
  - Returns system-wide metrics
  - Includes sales, customer stats, alerts

#### Transactions
- `POST /api/v1/transactions/`
  - Create new transaction
  - Includes fraud detection
- `GET /api/v1/transactions/suspicious`
  - List suspicious transactions
- `GET /api/v1/transactions/recent`
  - List recent transactions

#### Customers
- `GET /api/v1/customers/`
  - List customers with pagination
- `GET /api/v1/customers/{customer_id}`
  - Get customer details
- `GET /api/v1/customers/behavior`
  - Get customer behavior analytics

#### Alerts
- `GET /api/v1/alerts/`
  - Get system alerts
- `GET /api/v1/alerts/status`
  - Get system status

## Database Schema

### Core Tables

#### Transaction
```sql
CREATE TABLE transaction (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customer(id),
    product_id INTEGER REFERENCES product(id),
    quantity INTEGER,
    price FLOAT,
    status VARCHAR,
    payment_method VARCHAR,
    timestamp TIMESTAMP
);
```

#### Customer
```sql
CREATE TABLE customer (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE,
    total_spent FLOAT,
    risk_score FLOAT,
    registration_date TIMESTAMP
);
```

#### Alert
```sql
CREATE TABLE alert (
    id SERIAL PRIMARY KEY,
    type VARCHAR,
    message TEXT,
    severity VARCHAR,
    alert_metadata JSONB,
    created_at TIMESTAMP,
    resolved_at TIMESTAMP
);
```

## Fraud Detection System

The system uses multiple criteria to detect suspicious transactions:

1. **Transaction Velocity**
   - Monitors frequency of transactions
   - Configurable time window
   - Threshold-based alerting

2. **Amount Anomaly**
   - Statistical analysis of transaction amounts
   - Z-score calculation
   - Customer-specific thresholds

3. **Risk Scoring**
   - Cumulative risk assessment
   - Multiple factor consideration
   - Real-time score updates

## Testing

Run the test suite:
```bash
pytest
```

Run with coverage:
```bash
pytest --cov=app tests/
```

## Maintenance

### Database Management

Recalculate customer totals:
```bash
python scripts/recalculate_totals.py
```

### Monitoring

The application exposes metrics at:
- Health check: `/health`
- Metrics: `/metrics`

## Deployment

### Production Considerations

1. Set appropriate environment variables
2. Configure proper database indexes
3. Set up monitoring and logging
4. Configure proper security measures
5. Set up backup procedures

### Environment Variables

Required environment variables:
```
DATABASE_URL=postgresql://user:password@localhost/dbname
REDIS_URL=redis://localhost
SECRET_KEY=your-secret-key
ENVIRONMENT=production
``` 
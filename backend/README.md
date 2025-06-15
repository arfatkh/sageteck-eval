# TechMart Analytics Dashboard

Real-time analytics dashboard for TechMart e-commerce platform with transaction processing, anomaly detection, and business insights.

## Quick Start with Docker

```bash
# Clone and start services
git clone <repository-url>
cd techmart-analytics
docker-compose up
```

The API will be available at `http://localhost:8000`

## Hot Reload Development

**Docker automatically enables hot reload - your code changes are instantly reflected!**

```yaml
# Already configured in docker-compose.yml:
volumes:
  - ./backend:/app  # Maps local code to container
command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Just make changes to your code and save - the server will automatically reload.

## API Endpoints

- **Dashboard**
  - `GET /api/dashboard/overview` - System overview with real-time metrics
  
- **Transactions**
  - `POST /api/transactions` - Create transaction
  - `GET /api/transactions/suspicious` - Get suspicious transactions
  
- **Inventory**
  - `GET /api/inventory/low-stock` - Get low stock alerts
  - `GET /api/inventory/products` - List products
  
- **Analytics**
  - `GET /api/analytics/hourly-sales` - Get hourly sales data
  - `GET /api/analytics/customer-insights` - Get customer metrics
  
- **Alerts**
  - `POST /api/alerts` - Create system alert
  - `GET /api/alerts/system-status` - Get system status

Full API documentation: 
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Data Import

Sample data files (in `data/` directory):
- `products.csv` (500 products)
- `customers.csv` (1000 customers)
- `transactions.csv` (5000 transactions)
- `suppliers.csv` (50 suppliers)

Data is automatically imported on container startup.

## Features

- Real-time analytics dashboard
- Fraud detection system
- Low stock monitoring
- Customer insights
- Transaction processing
- Automated alerts

## Tech Stack

- Backend: FastAPI + PostgreSQL
- Infrastructure: Docker + Docker Compose
- Database ORM: SQLAlchemy
- Development: Hot Reload enabled

## Development Notes

- API automatically handles data validation
- Real-time fraud detection is active
- Comprehensive error handling implemented
- Database migrations handled automatically
- API documentation auto-generated

## Monitoring

Access metrics and health checks:
- Health: `http://localhost:8000/health`
- Metrics: `http://localhost:8000/metrics` 
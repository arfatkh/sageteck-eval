# TechMart Analytics Dashboard

A comprehensive analytics and monitoring system for TechMart's e-commerce operations. The system provides real-time insights into sales, inventory, customer behavior, and fraud detection.

## System Overview

### Key Features

- **Real-time Analytics Dashboard**
  - 24-hour sales tracking
  - Lifetime sales metrics
  - Customer activity monitoring
  - Inventory status
  - Suspicious transaction detection

- **Advanced Fraud Detection**
  - Transaction velocity monitoring
  - Amount anomaly detection
  - Customer risk scoring
  - Real-time alerts for suspicious activities

- **Inventory Management**
  - Low stock alerts
  - Product filtering
  - Category management
  - Stock level monitoring

- **Customer Analytics**
  - Customer behavior tracking
  - Risk assessment
  - Purchase patterns analysis
  - Customer lifetime value metrics

- **Alert System**
  - System status monitoring
  - Real-time notifications
  - Low stock alerts
  - Suspicious transaction warnings

## System Architecture

The system is built using a modern tech stack:

- **Backend**: FastAPI with PostgreSQL
- **Frontend**: React with Material-UI
- **Infrastructure**: Docker containerization
- **Caching**: Redis (for optimization)

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js (for local frontend development)
- Python 3.11+ (for local backend development)

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd techmart-analytics
```

2. Start the backend services:
```bash
cd backend
docker-compose up -d
```

3. Start the frontend development server:
```bash
cd frontend
npm install
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Project Structure

```
techmart-analytics/
├── backend/           # FastAPI backend service
├── frontend/         # React frontend application
├── docker-compose.yml # Docker composition file
└── README.md         # This file
```

For detailed setup and development instructions, see:
- [Backend Documentation](backend/README.md)
- [Frontend Documentation](frontend/README.md)

## Development

### Backend Development
See [Backend README](backend/README.md) for:
- Detailed API documentation
- Database schema
- Development setup
- Testing instructions

### Frontend Development
See [Frontend README](frontend/README.md) for:
- Component documentation
- State management
- UI/UX guidelines
- Build instructions

## License

[License Type] - see LICENSE file for details 
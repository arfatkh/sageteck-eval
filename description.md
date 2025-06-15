# TechMart Analytics Dashboard

## Project Overview
Real-time analytics dashboard for TechMart e-commerce platform with transaction processing, anomaly detection, and business insights.

## Core Requirements

### 1. Backend API (1.5 hours)
- [x] Database Schema Setup
  - [x] Products (id, name, category, price, stock_quantity, supplier_id)
  - [x] Customers (id, email, registration_date, total_spent, risk_score)
  - [x] Transactions (id, customer_id, product_id, quantity, price, timestamp, status, payment_method)
  - [x] Suppliers (id, name, reliability_score, country)

- [ ] REST API Endpoints
  - [ ] GET /api/dashboard/overview
  - [ ] POST /api/transactions
  - [ ] GET /api/transactions/suspicious
  - [ ] GET /api/inventory/low-stock
  - [ ] GET /api/analytics/hourly-sales
  - [ ] POST /api/alerts

### 2. Frontend Dashboard (1.5 hours)
- [ ] Main Dashboard Layout
  - [ ] Real-time metrics header
  - [ ] Grid layout with widgets
  - [ ] Sales performance chart
  - [ ] Top products table
  - [ ] Recent transactions feed

- [ ] Interactive Features
  - [ ] Real-time updates
  - [ ] Filtering capabilities
  - [ ] Sortable tables
  - [ ] Transaction details modal
  - [ ] Export functionality
  - [ ] Responsive design

### 3. Selected Challenge: Real-Time Fraud Detection
- [ ] Fraud Detection System
  - [ ] Transaction velocity monitoring
  - [ ] Amount anomaly detection
  - [ ] Geographic inconsistency checks
  - [ ] Time pattern analysis
  - [ ] Real-time alerts
  - [ ] Geographic visualization

## Tech Stack
- Backend: Python/FastAPI, PostgreSQL, SQLAlchemy
- Frontend: React (planned)
- Infrastructure: Docker, Docker Compose

## Data Files
- products.csv (500 products)
- customers.csv (1000 customers)
- transactions.csv (5000 transactions)
- suppliers.csv (50 suppliers)

## Required Features
- [ ] RESTful API with proper status codes
- [x] Database migrations setup
- [x] Data seeding capability
- [ ] Input validation
- [ ] Error handling
- [ ] Unit tests
- [ ] API documentation (Swagger/OpenAPI)
- [x] Docker setup 
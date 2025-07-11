from datetime import datetime, timedelta, UTC
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import Dict, List

from app.models.transaction import Transaction
from app.models.product import Product
from app.models.customer import Customer

def get_total_sales(db: Session, time_window: timedelta = None) -> float:
    """Get total sales amount within the specified time window."""
    query = db.query(func.sum(Transaction.price * Transaction.quantity))
    if time_window:
        # Get latest transaction timestamp
        latest_transaction = db.query(func.max(Transaction.timestamp)).scalar()
        if latest_transaction:
            cutoff = latest_transaction - time_window
            query = query.filter(Transaction.timestamp >= cutoff)
    return float(query.scalar() or 0.0)

def get_sales_by_hour(db: Session, hours: int = 24) -> List[Dict]:
    """Get hourly sales data for the last n hours."""
    # First get the latest transaction timestamp
    latest_transaction = db.query(func.max(Transaction.timestamp)).scalar()
    if not latest_transaction:
        return []
    
    # Use the latest transaction as reference point
    end = latest_transaction.replace(minute=0, second=0, microsecond=0)
    cutoff = end - timedelta(hours=hours)
    
    # Generate all hours in the range
    all_hours = []
    current = cutoff
    
    while current <= end:
        all_hours.append(current)
        current += timedelta(hours=1)
    
    # Get actual sales data
    hourly_sales = (
        db.query(
            func.date_trunc('hour', Transaction.timestamp).label('hour'),
            func.sum(Transaction.price * Transaction.quantity).label('total_sales'),
            func.count().label('num_transactions')
        )
        .filter(Transaction.timestamp >= cutoff)
        .group_by(func.date_trunc('hour', Transaction.timestamp))
        .order_by(func.date_trunc('hour', Transaction.timestamp))
        .all()
    )
    
    # Convert to dictionary for easy lookup
    sales_dict = {
        hour: {'total_sales': float(total_sales or 0), 'num_transactions': num_transactions}
        for hour, total_sales, num_transactions in hourly_sales
    }
    
    # For longer time ranges, aggregate data to reduce points
    if hours > 24 * 7:  # For ranges longer than a week
        # Aggregate by day instead of hour
        aggregated_hours = []
        daily_data = {}
        
        for hour in all_hours:
            day = hour.replace(hour=0)
            if day not in daily_data:
                daily_data[day] = {
                    'total_sales': 0.0,
                    'num_transactions': 0
                }
            
            if hour in sales_dict:
                daily_data[day]['total_sales'] += sales_dict[hour]['total_sales']
                daily_data[day]['num_transactions'] += sales_dict[hour]['num_transactions']
        
        # Convert daily data to list
        return [
            {
                'hour': day.isoformat(),
                'total_sales': data['total_sales'],
                'num_transactions': data['num_transactions']
            }
            for day, data in sorted(daily_data.items())
        ]
    
    # For shorter ranges, return hourly data
    return [
        {
            'hour': hour.isoformat(),
            'total_sales': sales_dict.get(hour, {'total_sales': 0.0})['total_sales'],
            'num_transactions': sales_dict.get(hour, {'num_transactions': 0})['num_transactions']
        }
        for hour in all_hours
    ]

def get_low_stock_products(db: Session, threshold: int = 10) -> List[Dict]:
    """Get products with stock quantity below threshold."""
    products = (
        db.query(Product)
        .filter(Product.stock_quantity <= threshold)
        .all()
    )
    return [
        {
            'id': p.id,
            'name': p.name,
            'stock_quantity': p.stock_quantity,
            'category': p.category
        }
        for p in products
    ]

def detect_suspicious_transactions(db: Session, time_window: timedelta = timedelta(hours=24)) -> List[Dict]:
    """Detect suspicious transactions based on various criteria."""
    # Get latest transaction timestamp
    latest_transaction = db.query(func.max(Transaction.timestamp)).scalar()
    if not latest_transaction:
        return []
    
    cutoff = latest_transaction - time_window
    
    # Get average transaction amount
    avg_amount = db.query(func.avg(Transaction.price * Transaction.quantity)).scalar() or 0
    
    suspicious = (
        db.query(Transaction)
        .filter(
            and_(
                Transaction.timestamp >= cutoff,
                Transaction.price * Transaction.quantity >= (avg_amount * 3)  # Transactions 3x above average
            )
        )
        .all()
    )
    
    return [
        {
            'id': t.id,
            'amount': float(t.price * t.quantity),
            'timestamp': t.timestamp.isoformat(),
            'customer_id': t.customer_id,
            'status': t.status
        }
        for t in suspicious
    ]

def get_customer_metrics(db: Session) -> Dict:
    """Get various customer-related metrics."""
    total_customers = db.query(func.count(Customer.id)).scalar()
    avg_spent = db.query(func.avg(Customer.total_spent)).scalar() or 0
    high_risk = db.query(func.count(Customer.id)).filter(Customer.risk_score >= 0.7).scalar()
    
    return {
        'total_customers': total_customers,
        'average_spent': float(avg_spent),
        'high_risk_customers': high_risk
    }

def get_transaction_metrics(db: Session, time_window: timedelta = timedelta(hours=24)) -> Dict:
    """Get various transaction-related metrics."""
    # Get latest transaction timestamp
    latest_transaction = db.query(func.max(Transaction.timestamp)).scalar()
    if not latest_transaction:
        return {
            'transaction_count': 0,
            'total_amount': 0.0,
            'total_sales': 0.0,
            'average_amount': 0.0
        }
    
    cutoff = latest_transaction - time_window
    
    metrics = (
        db.query(
            func.count().label('total_count'),
            func.sum(Transaction.price * Transaction.quantity).label('total_amount'),
            func.avg(Transaction.price * Transaction.quantity).label('avg_amount')
        )
        .filter(Transaction.timestamp >= cutoff)
        .first()
    )
    
    return {
        'transaction_count': metrics.total_count,
        'total_amount': float(metrics.total_amount or 0),
        'total_sales': float(metrics.total_amount or 0),  # Adding total_sales field for compatibility
        'average_amount': float(metrics.avg_amount or 0)
    } 
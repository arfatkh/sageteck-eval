from datetime import datetime, timedelta
from typing import List, Optional, Dict
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, distinct
from pydantic import BaseModel, Field
import logging

from app.db.session import get_db
from app.models.transaction import Transaction
from app.models.product import Product
from app.models.customer import Customer
from app.utils.analytics import (
    get_sales_by_hour,
    get_customer_metrics,
    get_transaction_metrics
)
from app.core.exceptions import ValidationError, BusinessLogicError

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/")
async def get_analytics():
    """
    Get analytics data
    """
    return {"message": "Analytics endpoint"}

@router.get("/sales/trends")
async def get_sales_trends(
    days: int = Query(30, gt=0, le=365),
    db: Session = Depends(get_db)
):
    """
    Get sales trends over time including:
    - Daily sales totals
    - Weekly growth rates
    - Top selling days
    - Average transaction value trends
    """
    try:
        cutoff = datetime.utcnow() - timedelta(days=days)
        
        # Get daily sales
        daily_sales = (
            db.query(
                func.date_trunc('day', Transaction.timestamp).label('day'),
                func.sum(Transaction.price * Transaction.quantity).label('total_sales'),
                func.count().label('num_transactions')
            )
            .filter(Transaction.timestamp >= cutoff)
            .group_by(func.date_trunc('day', Transaction.timestamp))
            .order_by(func.date_trunc('day', Transaction.timestamp))
            .all()
        )
        
        if not daily_sales:
            logger.info(f"No sales data found for the last {days} days")
            return {
                'daily_sales': [],
                'weekly_growth': [],
                'top_selling_days': []
            }
        
        # Calculate weekly growth rates
        weekly_sales = []
        prev_week_sales = 0
        
        for i in range(0, len(daily_sales), 7):
            week_sales = sum(day.total_sales for day in daily_sales[i:i+7])
            growth_rate = ((week_sales - prev_week_sales) / prev_week_sales * 100) if prev_week_sales > 0 else 0
            weekly_sales.append({
                'week_start': daily_sales[i].day.isoformat(),
                'total_sales': week_sales,
                'growth_rate': growth_rate
            })
            prev_week_sales = week_sales
        
        # Get top selling days
        top_days = (
            db.query(
                func.date_trunc('day', Transaction.timestamp).label('day'),
                func.sum(Transaction.price * Transaction.quantity).label('total_sales')
            )
            .filter(Transaction.timestamp >= cutoff)
            .group_by(func.date_trunc('day', Transaction.timestamp))
            .order_by(desc('total_sales'))
            .limit(5)
            .all()
        )
        
        result = {
            'daily_sales': [
                {
                    'date': day.day.isoformat(),
                    'total_sales': float(day.total_sales),
                    'num_transactions': day.num_transactions
                }
                for day in daily_sales
            ],
            'weekly_growth': weekly_sales,
            'top_selling_days': [
                {
                    'date': day.day.isoformat(),
                    'total_sales': float(day.total_sales)
                }
                for day in top_days
            ]
        }
        
        total_sales = sum(day.total_sales for day in daily_sales)
        total_transactions = sum(day.num_transactions for day in daily_sales)
        logger.info(
            f"Retrieved sales trends: days={days}, "
            f"total_sales=${total_sales:.2f}, "
            f"total_transactions={total_transactions}"
        )
        
        return result
    
    except Exception as e:
        logger.error(f"Error retrieving sales trends: {str(e)}")
        raise

@router.get("/customer/behavior")
async def get_customer_behavior(
    days: int = Query(30, gt=0, le=365),
    db: Session = Depends(get_db)
):
    """
    Analyze customer behavior including:
    - Purchase frequency
    - Average basket size
    - Customer segments
    - Retention metrics
    """
    try:
        cutoff = datetime.utcnow() - timedelta(days=days)
        
        # Get purchase frequency distribution
        purchase_freq = (
            db.query(
                Transaction.customer_id,
                func.count().label('num_purchases'),
                func.avg(Transaction.price * Transaction.quantity).label('avg_purchase_value')
            )
            .filter(Transaction.timestamp >= cutoff)
            .group_by(Transaction.customer_id)
            .all()
        )
        
        if not purchase_freq:
            logger.info(f"No customer behavior data found for the last {days} days")
            return {
                'purchase_frequency': {
                    'average_purchases': 0,
                    'frequency_distribution': {
                        'single_purchase': 0,
                        '2-5_purchases': 0,
                        '6+_purchases': 0
                    }
                },
                'customer_segments': {
                    'high_value': 0,
                    'medium_value': 0,
                    'low_value': 0
                },
                'retention_metrics': {
                    'retention_rate': 0,
                    'total_customers': 0,
                    'retained_customers': 0
                }
            }
        
        # Calculate customer segments based on purchase value
        segments = {
            'high_value': len([p for p in purchase_freq if p.avg_purchase_value > 1000]),
            'medium_value': len([p for p in purchase_freq if 500 <= p.avg_purchase_value <= 1000]),
            'low_value': len([p for p in purchase_freq if p.avg_purchase_value < 500])
        }
        
        # Calculate retention
        retained = len([p for p in purchase_freq if p.num_purchases > 1])
        total_customers = len(purchase_freq)
        
        result = {
            'purchase_frequency': {
                'average_purchases': sum(p.num_purchases for p in purchase_freq) / total_customers if total_customers > 0 else 0,
                'frequency_distribution': {
                    'single_purchase': len([p for p in purchase_freq if p.num_purchases == 1]),
                    '2-5_purchases': len([p for p in purchase_freq if 2 <= p.num_purchases <= 5]),
                    '6+_purchases': len([p for p in purchase_freq if p.num_purchases > 5])
                }
            },
            'customer_segments': segments,
            'retention_metrics': {
                'retention_rate': (retained / total_customers * 100) if total_customers > 0 else 0,
                'total_customers': total_customers,
                'retained_customers': retained
            }
        }
        
        logger.info(
            f"Retrieved customer behavior: days={days}, "
            f"total_customers={total_customers}, "
            f"retention_rate={result['retention_metrics']['retention_rate']:.1f}%"
        )
        
        return result
    
    except Exception as e:
        logger.error(f"Error analyzing customer behavior: {str(e)}")
        raise

@router.get("/product/performance")
async def get_product_performance(
    days: int = Query(30, gt=0, le=365),
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Analyze product performance including:
    - Top selling products
    - Category performance
    - Stock turnover
    - Revenue contribution
    """
    try:
        cutoff = datetime.utcnow() - timedelta(days=days)
        
        # Base query for product performance
        query = (
            db.query(
                Product.id,
                Product.name,
                Product.category,
                func.sum(Transaction.quantity).label('units_sold'),
                func.sum(Transaction.price * Transaction.quantity).label('revenue'),
                Product.stock_quantity
            )
            .join(Transaction, Product.id == Transaction.product_id)
            .filter(Transaction.timestamp >= cutoff)
            .group_by(Product.id, Product.name, Product.category, Product.stock_quantity)
        )
        
        if category:
            # Validate category exists
            if not db.query(Product.category).filter(Product.category == category).first():
                raise ValidationError(f"Invalid category: {category}")
            query = query.filter(Product.category == category)
        
        products = query.all()
        
        if not products:
            logger.info(
                f"No product performance data found for the last {days} days"
                + (f" in category '{category}'" if category else "")
            )
            return {
                'top_products': [],
                'category_performance': {}
            }
        
        # Calculate category performance
        category_performance = {}
        for product in products:
            if product.category not in category_performance:
                category_performance[product.category] = {
                    'total_revenue': 0,
                    'units_sold': 0,
                    'num_products': 0
                }
            cat = category_performance[product.category]
            cat['total_revenue'] += product.revenue
            cat['units_sold'] += product.units_sold
            cat['num_products'] += 1
        
        # Calculate stock turnover
        for cat in category_performance.values():
            cat['avg_turnover'] = cat['units_sold'] / cat['num_products'] if cat['num_products'] > 0 else 0
        
        result = {
            'top_products': [
                {
                    'id': p.id,
                    'name': p.name,
                    'category': p.category,
                    'units_sold': p.units_sold,
                    'revenue': float(p.revenue),
                    'stock_quantity': p.stock_quantity
                }
                for p in sorted(products, key=lambda x: x.revenue, reverse=True)[:10]
            ],
            'category_performance': {
                cat: {
                    'total_revenue': float(metrics['total_revenue']),
                    'units_sold': metrics['units_sold'],
                    'avg_turnover': float(metrics['avg_turnover'])
                }
                for cat, metrics in category_performance.items()
            }
        }
        
        total_revenue = sum(p.revenue for p in products)
        total_units = sum(p.units_sold for p in products)
        logger.info(
            f"Retrieved product performance: days={days}, "
            f"total_revenue=${total_revenue:.2f}, "
            f"total_units={total_units}"
            + (f", category={category}" if category else "")
        )
        
        return result
    
    except Exception as e:
        logger.error(f"Error analyzing product performance: {str(e)}")
        raise

@router.get("/geographic")
async def get_geographic_analytics(
    days: int = Query(30, gt=0, le=365),
    db: Session = Depends(get_db)
):
    """
    Get geographic distribution of sales:
    - Sales by region
    - Regional customer concentration
    - Regional product preferences
    """
    cutoff = datetime.utcnow() - timedelta(days=days)
    
    # Get sales by region
    regional_sales = (
        db.query(
            Customer.region,
            func.sum(Transaction.price * Transaction.quantity).label('total_sales'),
            func.count(distinct(Transaction.customer_id)).label('num_customers'),
            func.count(distinct(Transaction.product_id)).label('num_products')
        )
        .join(Transaction, Customer.id == Transaction.customer_id)
        .filter(Transaction.timestamp >= cutoff)
        .group_by(Customer.region)
        .all()
    )
    
    # Get top products by region
    regional_preferences = {}
    for region in [r.region for r in regional_sales]:
        top_products = (
            db.query(
                Product.name,
                Product.category,
                func.sum(Transaction.quantity).label('units_sold')
            )
            .join(Transaction, Product.id == Transaction.product_id)
            .join(Customer, Transaction.customer_id == Customer.id)
            .filter(
                Customer.region == region,
                Transaction.timestamp >= cutoff
            )
            .group_by(Product.name, Product.category)
            .order_by(desc('units_sold'))
            .limit(5)
            .all()
        )
        
        regional_preferences[region] = [
            {
                'product_name': p.name,
                'category': p.category,
                'units_sold': p.units_sold
            }
            for p in top_products
        ]
    
    return {
        'regional_sales': [
            {
                'region': r.region,
                'total_sales': float(r.total_sales),
                'num_customers': r.num_customers,
                'num_products': r.num_products
            }
            for r in regional_sales
        ],
        'regional_preferences': regional_preferences
    }

@router.get("/hourly-sales")
async def get_hourly_sales(
    hours: int = Query(24, gt=0, le=168),  # Default 24 hours, max 1 week
    db: Session = Depends(get_db)
) -> List[Dict]:
    """
    Get hourly sales data for the specified time period.
    Returns hourly breakdown of sales with:
    - Hour timestamp
    - Total sales amount
    - Number of transactions
    """
    try:
        sales_data = get_sales_by_hour(db, hours)
        
        if sales_data:
            total_sales = sum(hour['total_sales'] for hour in sales_data)
            total_transactions = sum(hour['num_transactions'] for hour in sales_data)
            logger.info(
                f"Retrieved hourly sales: hours={hours}, "
                f"total_sales=${total_sales:.2f}, "
                f"total_transactions={total_transactions}"
            )
        else:
            logger.info(f"No sales data found for the last {hours} hours")
        
        return sales_data
    
    except Exception as e:
        logger.error(f"Error retrieving hourly sales: {str(e)}")
        raise 
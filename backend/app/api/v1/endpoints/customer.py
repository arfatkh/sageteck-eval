from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
import logging

from app.db.session import get_db
from app.models.customer import Customer
from app.models.transaction import Transaction
from app.core.exceptions import ResourceNotFound

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=Dict[str, Any])
async def get_customers(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, gt=0, le=100),
    search: Optional[str] = Query(None, min_length=1),
    db: Session = Depends(get_db)
):
    """Get paginated list of customers with optional search."""
    try:
        # Base query
        query = db.query(Customer)
        
        # Apply search filter if provided
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Customer.email.ilike(search_term),
                    # Add more search fields if needed
                )
            )
        
        # Get total count for pagination
        total_count = query.count()
        
        # Apply pagination and sorting
        customers = query.order_by(Customer.id.asc()).offset(skip).limit(limit).all()
        
        result = {
            "items": [
                {
                    "id": customer.id,
                    "email": customer.email,
                    "registration_date": customer.registration_date.isoformat(),
                    "total_spent": float(customer.total_spent),
                    "risk_score": float(customer.risk_score)
                }
                for customer in customers
            ],
            "total": total_count,
            "page": skip // limit + 1,
            "pages": (total_count + limit - 1) // limit,
            "has_more": (skip + limit) < total_count
        }
        
        logger.info(f"Retrieved {len(customers)} customers, total: {total_count}, search: {search}")
        return result
    except Exception as e:
        logger.error(f"Error retrieving customers: {str(e)}")
        raise

@router.get("/behavior")
async def get_customer_behavior(db: Session = Depends(get_db)):
    """Get customer behavior analytics including segments and purchase patterns."""
    try:
        # Get total customers
        total_customers = db.query(func.count(Customer.id)).scalar() or 0
        
        # Calculate purchase frequency distribution
        customer_purchases = (
            db.query(
                Customer.id,
                func.count(Transaction.id).label('purchase_count')
            )
            .outerjoin(Transaction)
            .group_by(Customer.id)
            .all()
        )
        
        # Purchase frequency distribution
        single_purchase = sum(1 for c in customer_purchases if c.purchase_count == 1)
        two_to_five = sum(1 for c in customer_purchases if 2 <= c.purchase_count <= 5)
        six_plus = sum(1 for c in customer_purchases if c.purchase_count >= 6)
        
        # Calculate average purchases
        total_purchases = sum(c.purchase_count for c in customer_purchases)
        avg_purchases = round(total_purchases / total_customers if total_customers > 0 else 0, 2)
        
        # Calculate customer segments
        customers = db.query(Customer).all()
        high_value = sum(1 for c in customers if c.total_spent > 1000)
        medium_value = sum(1 for c in customers if 500 <= c.total_spent <= 1000)
        low_value = sum(1 for c in customers if c.total_spent < 500)
        
        # Calculate retention metrics
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        active_customers = (
            db.query(func.count(Customer.id))
            .join(Transaction)
            .filter(Transaction.timestamp >= thirty_days_ago)
            .group_by(Customer.id)
            .count()
        )
        retention_rate = round((active_customers / total_customers * 100) if total_customers > 0 else 0, 1)
        
        result = {
            "purchase_frequency": {
                "average_purchases": avg_purchases,
                "frequency_distribution": {
                    "single_purchase": single_purchase,
                    "2-5_purchases": two_to_five,
                    "6+_purchases": six_plus
                }
            },
            "customer_segments": {
                "high_value": high_value,
                "medium_value": medium_value,
                "low_value": low_value
            },
            "retention_metrics": {
                "retention_rate": retention_rate,
                "total_customers": total_customers,
                "retained_customers": active_customers
            }
        }
        
        logger.info("Retrieved customer behavior analytics")
        return result
    except Exception as e:
        logger.error(f"Error retrieving customer behavior: {str(e)}")
        raise

@router.get("/{customer_id}")
async def get_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific customer."""
    try:
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            raise ResourceNotFound("Customer", customer_id)
            
        # Get customer's recent transactions
        recent_transactions = (
            db.query(Transaction)
            .filter(Transaction.customer_id == customer_id)
            .order_by(Transaction.timestamp.desc())
            .limit(5)
            .all()
        )
        
        result = {
            "id": customer.id,
            "email": customer.email,
            "registration_date": customer.registration_date.isoformat(),
            "total_spent": float(customer.total_spent),
            "risk_score": float(customer.risk_score),
            "recent_transactions": [
                {
                    "id": t.id,
                    "amount": float(t.total_amount),
                    "timestamp": t.timestamp.isoformat(),
                    "status": t.status,
                }
                for t in recent_transactions
            ]
        }
        
        logger.info(f"Retrieved customer details for ID: {customer_id}")
        return result
    except ResourceNotFound:
        raise
    except Exception as e:
        logger.error(f"Error retrieving customer {customer_id}: {str(e)}")
        raise 
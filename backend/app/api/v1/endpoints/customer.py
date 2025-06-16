from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, distinct
import logging

from app.db.session import get_db
from app.models.customer import Customer
from app.models.transaction import Transaction, TransactionStatus
from app.core.exceptions import ResourceNotFound

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=Dict[str, Any])
async def get_customers(
    search: Optional[str] = Query(None, min_length=1),
    page: int = Query(1, gt=0),
    page_size: int = Query(50, gt=0, le=100),
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
        
        # Get total count first
        total_count = query.count()
        
        # Calculate pagination
        total_pages = (total_count + page_size - 1) // page_size
        offset = (page - 1) * page_size
        
        # Get paginated customers
        customers = query.order_by(Customer.id.asc()).offset(offset).limit(page_size).all()
        
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
            "page": page,
            "pages": total_pages,
            "has_more": page < total_pages
        }
        
        logger.info(f"Retrieved {len(customers)} customers, page {page}/{total_pages}, search: {search}")
        return result
    except Exception as e:
        logger.error(f"Error retrieving customers: {str(e)}")
        raise

@router.get("/behavior")
async def get_customer_behavior(db: Session = Depends(get_db)):
    """Get customer behavior analytics including segments and purchase patterns."""
    try:
        # Get total customers using the same method as customer list
        total_customers = db.query(Customer).count()
        
        # Get customers with completed transactions for other metrics
        customers_with_transactions = (
            db.query(Customer.id, func.sum(Transaction.price * Transaction.quantity).label('total_spent'))
            .join(Transaction)
            .filter(Transaction.status == TransactionStatus.COMPLETED)
            .group_by(Customer.id)
            .all()
        )
        
        # Purchase frequency distribution (only completed transactions)
        customer_purchases = (
            db.query(
                Customer.id,
                func.count(Transaction.id).label('purchase_count')
            )
            .join(Transaction)
            .filter(Transaction.status == TransactionStatus.COMPLETED)
            .group_by(Customer.id)
            .all()
        )
        
        # Purchase frequency distribution
        single_purchase = sum(1 for c in customer_purchases if c.purchase_count == 1)
        two_to_five = sum(1 for c in customer_purchases if 2 <= c.purchase_count <= 5)
        six_plus = sum(1 for c in customer_purchases if c.purchase_count >= 6)
        
        # Calculate average purchases (based on customers with transactions)
        total_purchases = sum(c.purchase_count for c in customer_purchases)
        customers_with_purchases = len(customer_purchases)
        avg_purchases = round(total_purchases / customers_with_purchases if customers_with_purchases > 0 else 0, 2)
        
        # Calculate customer segments based on total_spent
        high_value = sum(1 for c in customers_with_transactions if c.total_spent > 1000)
        medium_value = sum(1 for c in customers_with_transactions if 500 <= c.total_spent <= 1000)
        low_value = sum(1 for c in customers_with_transactions if c.total_spent < 500)
        
        # Calculate retention metrics (only completed transactions)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        active_customers = (
            db.query(func.count(distinct(Customer.id)))
            .join(Transaction)
            .filter(
                Transaction.status == TransactionStatus.COMPLETED,
                Transaction.timestamp >= thirty_days_ago
            )
            .scalar() or 0
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
        
        logger.info(
            f"Retrieved customer behavior: "
            f"total_customers={total_customers}, "
            f"active_customers={active_customers}, "
            f"retention_rate={retention_rate}%"
        )
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
            
        # Get customer's recent completed transactions
        recent_transactions = (
            db.query(Transaction)
            .filter(
                Transaction.customer_id == customer_id,
                Transaction.status == TransactionStatus.COMPLETED
            )
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
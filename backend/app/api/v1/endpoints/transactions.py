from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, validator
import logging

from app.db.session import get_db
from app.models.transaction import Transaction, PaymentMethod, TransactionStatus
from app.models.product import Product
from app.models.customer import Customer
from app.utils.analytics import detect_suspicious_transactions
from app.core.exceptions import ResourceNotFound, ValidationError, BusinessLogicError

router = APIRouter()
logger = logging.getLogger(__name__)

class TransactionCreate(BaseModel):
    customer_id: int
    product_id: int
    quantity: int = Field(gt=0)
    price: float = Field(gt=0)
    payment_method: PaymentMethod

    @validator('quantity')
    def validate_quantity(cls, v):
        if v > 1000:
            raise ValidationError("Quantity cannot exceed 1000 units per transaction")
        return v

    @validator('price')
    def validate_price(cls, v):
        if v > 1000000:
            raise ValidationError("Price cannot exceed 1,000,000 per transaction")
        return v

class TransactionResponse(BaseModel):
    id: int
    customer_id: int
    product_id: int
    quantity: int
    price: float
    payment_method: PaymentMethod
    status: TransactionStatus
    timestamp: datetime
    total_amount: float
    
    class Config:
        from_attributes = True

@router.post("/", response_model=TransactionResponse)
async def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db)
):
    """Create a new transaction."""
    # Validate customer exists
    customer = db.query(Customer).filter(Customer.id == transaction.customer_id).first()
    if not customer:
        raise ResourceNotFound("Customer", transaction.customer_id)

    # Validate product exists and has sufficient stock
    product = db.query(Product).filter(Product.id == transaction.product_id).first()
    if not product:
        raise ResourceNotFound("Product", transaction.product_id)
    
    if product.stock_quantity < transaction.quantity:
        raise BusinessLogicError(
            f"Insufficient stock. Available: {product.stock_quantity}, Requested: {transaction.quantity}"
        )

    try:
        # Create transaction
        db_transaction = Transaction(
            customer_id=transaction.customer_id,
            product_id=transaction.product_id,
            quantity=transaction.quantity,
            price=transaction.price,
            payment_method=transaction.payment_method,
            status=TransactionStatus.PENDING,
            timestamp=datetime.utcnow()
        )
        
        # Update product stock
        product.stock_quantity -= transaction.quantity
        
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        
        logger.info(
            f"Transaction created: ID={db_transaction.id}, "
            f"Amount=${db_transaction.total_amount:.2f}, "
            f"Customer={customer.id}"
        )
        
        return db_transaction
    
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create transaction: {str(e)}")
        raise

@router.get("/suspicious", response_model=List[dict])
async def get_suspicious_transactions(
    hours: int = Query(24, gt=0, le=168),  # Max 1 week lookback
    db: Session = Depends(get_db)
):
    """Get suspicious transactions from the last n hours."""
    try:
        suspicious = detect_suspicious_transactions(db, timedelta(hours=hours))
        if suspicious:
            logger.warning(f"Found {len(suspicious)} suspicious transactions in the last {hours} hours")
        return suspicious
    except Exception as e:
        logger.error(f"Error detecting suspicious transactions: {str(e)}")
        raise

@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific transaction by ID."""
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise ResourceNotFound("Transaction", transaction_id)
    return transaction 
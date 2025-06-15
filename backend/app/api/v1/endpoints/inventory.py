from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, validator
import logging

from app.db.session import get_db
from app.models.product import Product
from app.utils.analytics import get_low_stock_products
from app.core.exceptions import ValidationError, BusinessLogicError, ResourceNotFound

router = APIRouter()
logger = logging.getLogger(__name__)

class ProductResponse(BaseModel):
    id: int
    name: str
    category: str
    price: float = Field(gt=0)
    stock_quantity: int = Field(ge=0)
    supplier_id: int
    
    class Config:
        from_attributes = True

@router.get("/low-stock", response_model=List[dict])
async def get_low_stock_alerts(
    threshold: int = Query(10, gt=0),
    db: Session = Depends(get_db)
):
    """Get products with stock quantity below threshold."""
    try:
        products = get_low_stock_products(db, threshold)
        
        if products:
            logger.warning(
                f"Found {len(products)} products below stock threshold ({threshold})"
            )
        else:
            logger.info(f"No products below stock threshold ({threshold})")
        
        return products
    
    except Exception as e:
        logger.error(f"Error checking low stock products: {str(e)}")
        raise

@router.get("/products", response_model=List[ProductResponse])
async def get_products(
    category: Optional[str] = None,
    supplier_id: Optional[int] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, gt=0, le=1000),
    db: Session = Depends(get_db)
):
    """
    Get products with optional filtering by category and supplier.
    Includes pagination support.
    """
    try:
        query = db.query(Product)
        
        if category:
            # Validate category exists
            if not db.query(Product.category).filter(Product.category == category).first():
                raise ResourceNotFound("Category", category)
            query = query.filter(Product.category == category)
        
        if supplier_id:
            # Check if supplier exists in products
            if not db.query(Product.supplier_id).filter(Product.supplier_id == supplier_id).first():
                raise ResourceNotFound("Supplier", supplier_id)
            query = query.filter(Product.supplier_id == supplier_id)
        
        total_count = query.count()
        products = query.offset(skip).limit(limit).all()
        
        logger.info(
            f"Retrieved products: count={len(products)}, total={total_count}, "
            f"category={category}, supplier_id={supplier_id}"
        )
        
        return products
    
    except Exception as e:
        logger.error(f"Error retrieving products: {str(e)}")
        raise

@router.get("/categories")
async def get_categories(db: Session = Depends(get_db)):
    """Get list of unique product categories."""
    try:
        categories = db.query(Product.category).distinct().all()
        categories = [cat[0] for cat in categories]
        
        logger.info(f"Retrieved {len(categories)} unique product categories")
        return categories
    
    except Exception as e:
        logger.error(f"Error retrieving product categories: {str(e)}")
        raise 
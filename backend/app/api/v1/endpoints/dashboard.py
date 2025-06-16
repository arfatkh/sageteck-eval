from datetime import timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
import logging

from app.db.session import get_db
from app.utils.analytics import (
    get_total_sales,
    get_sales_by_hour,
    get_low_stock_products,
    detect_suspicious_transactions,
    get_customer_metrics,
    get_transaction_metrics
)
from app.core.exceptions import BusinessLogicError

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/overview")
async def get_dashboard_overview(
    time_range: str = Query('24h', regex='^(24h|7d|30d|90d)$'),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive dashboard overview including:
    - Sales metrics for the specified time range
    - Customer metrics
    - Transaction metrics
    - Low stock alerts
    - Suspicious transactions
    """
    try:
        # Convert time range to timedelta
        time_windows = {
            '24h': timedelta(days=1),
            '7d': timedelta(days=7),
            '30d': timedelta(days=30),
            '90d': timedelta(days=90)
        }
        time_window = time_windows[time_range]
        
        # Gather all metrics
        total_sales = get_total_sales(db, time_window)
        total_sales_lifetime = get_total_sales(db)  # No time window for lifetime
        
        # Get hourly or daily breakdown based on time range
        hours = 24 if time_range == '24h' else time_window.days * 24
        sales_breakdown = get_sales_by_hour(db, hours)
        
        customer_metrics = get_customer_metrics(db)
        transaction_metrics = get_transaction_metrics(db, time_window)
        low_stock = get_low_stock_products(db, threshold=10)
        suspicious = detect_suspicious_transactions(db, time_window)
        
        overview = {
            "sales": {
                "total": total_sales,
                "total_lifetime": total_sales_lifetime,
                "hourly_breakdown": sales_breakdown
            },
            "customers": customer_metrics,
            "transactions": transaction_metrics,
            "alerts": {
                "low_stock_products": low_stock,
                "suspicious_transactions": suspicious
            }
        }
        
        # Log important metrics
        logger.info(
            f"Dashboard overview: time_range={time_range}, "
            f"total_sales=${total_sales:.2f}, "
            f"total_sales_lifetime=${total_sales_lifetime:.2f}, "
            f"low_stock_count={len(low_stock)}, "
            f"suspicious_transactions={len(suspicious)}"
        )
        
        # Log warnings if necessary
        if low_stock:
            logger.warning(f"Low stock alert: {len(low_stock)} products below threshold")
        if suspicious:
            logger.warning(f"Suspicious transactions detected: {len(suspicious)} in {time_range}")
        
        return overview
    
    except Exception as e:
        logger.error(f"Error generating dashboard overview: {str(e)}")
        raise BusinessLogicError("Failed to generate dashboard overview") 
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel, Field, validator
import logging

from app.db.session import get_db
from app.models.alert import Alert
from app.utils.analytics import (
    get_low_stock_products,
    detect_suspicious_transactions
)
from app.core.exceptions import ValidationError, BusinessLogicError

router = APIRouter()
logger = logging.getLogger(__name__)

class AlertType:
    LOW_STOCK = "low_stock"
    SUSPICIOUS_TRANSACTION = "suspicious_transaction"
    SYSTEM = "system"

class AlertCreate(BaseModel):
    type: str = Field(..., description="Type of alert")
    message: str = Field(..., description="Alert message")
    severity: str = Field("info", description="Alert severity (info, warning, error)")
    alert_metadata: Optional[dict] = Field(default_factory=dict, description="Additional alert data")

    @validator('type')
    def validate_type(cls, v):
        valid_types = [AlertType.LOW_STOCK, AlertType.SUSPICIOUS_TRANSACTION, AlertType.SYSTEM]
        if v not in valid_types:
            raise ValidationError(f"Invalid alert type. Must be one of: {', '.join(valid_types)}")
        return v

    @validator('severity')
    def validate_severity(cls, v):
        valid_severities = ["info", "warning", "error"]
        if v not in valid_severities:
            raise ValidationError(f"Invalid severity. Must be one of: {', '.join(valid_severities)}")
        return v

class AlertResponse(BaseModel):
    id: int
    type: str
    message: str
    severity: str
    alert_metadata: dict
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[AlertResponse])
async def get_alerts(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, gt=0, le=100),
    alert_type: Optional[str] = None,
    severity: Optional[str] = None,
    hours: Optional[int] = Query(None, ge=1, le=168),
    db: Session = Depends(get_db)
):
    """
    Get alerts with filtering and pagination.
    """
    try:
        query = db.query(Alert).order_by(desc(Alert.created_at))
        
        if alert_type:
            if alert_type not in [AlertType.LOW_STOCK, AlertType.SUSPICIOUS_TRANSACTION, AlertType.SYSTEM]:
                raise ValidationError(f"Invalid alert_type: {alert_type}")
            query = query.filter(Alert.type == alert_type)
        
        if severity:
            if severity not in ["info", "warning", "error"]:
                raise ValidationError(f"Invalid severity: {severity}")
            query = query.filter(Alert.severity == severity)
        
        if hours:
            cutoff = datetime.utcnow() - timedelta(hours=hours)
            query = query.filter(Alert.created_at >= cutoff)
        
        total_count = query.count()
        alerts = query.offset(skip).limit(limit).all()
        
        logger.info(
            f"Retrieved alerts: count={len(alerts)}, total={total_count}, "
            f"type={alert_type}, severity={severity}, hours={hours}"
        )
        
        return alerts
    
    except Exception as e:
        logger.error(f"Error retrieving alerts: {str(e)}")
        raise

@router.post("/", response_model=AlertResponse)
async def create_alert(
    alert: AlertCreate,
    db: Session = Depends(get_db)
):
    """Create a new system alert."""
    try:
        db_alert = Alert(
            type=alert.type,
            message=alert.message,
            severity=alert.severity,
            alert_metadata=alert.alert_metadata
        )
        
        db.add(db_alert)
        db.commit()
        db.refresh(db_alert)
        
        logger.info(
            f"Alert created: ID={db_alert.id}, Type={alert.type}, "
            f"Severity={alert.severity}"
        )
        
        return db_alert
    
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create alert: {str(e)}")
        raise

@router.get("/system-status")
async def get_system_status(db: Session = Depends(get_db)):
    """Get current system status and active alerts."""
    try:
        # Get low stock alerts
        low_stock = get_low_stock_products(db, threshold=10)
        
        # Get suspicious transactions
        suspicious = detect_suspicious_transactions(db, timedelta(hours=24))
        
        alerts = []
        
        # Add low stock alerts
        if low_stock:
            alert = Alert(
                type=AlertType.LOW_STOCK,
                message=f"{len(low_stock)} products are running low on stock",
                severity="warning",
                alert_metadata={"products": low_stock}
            )
            db.add(alert)
            alerts.append(alert)
            logger.warning(f"Low stock alert: {len(low_stock)} products below threshold")
        
        # Add suspicious transaction alerts
        if suspicious:
            alert = Alert(
                type=AlertType.SUSPICIOUS_TRANSACTION,
                message=f"{len(suspicious)} suspicious transactions detected in the last 24h",
                severity="warning",
                alert_metadata={"transactions": suspicious}
            )
            db.add(alert)
            alerts.append(alert)
            logger.warning(f"Suspicious transactions alert: {len(suspicious)} transactions detected")
        
        if alerts:
            db.commit()
            for alert in alerts:
                db.refresh(alert)
        
        status = "healthy" if not alerts else "warning"
        logger.info(f"System status check completed: status={status}, alerts={len(alerts)}")
        
        return {
            "status": status,
            "active_alerts": alerts,
            "last_checked": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        db.rollback()
        logger.error(f"Error checking system status: {str(e)}")
        raise 
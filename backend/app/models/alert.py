from sqlalchemy import Column, Integer, String, DateTime, JSON
from datetime import datetime
import enum
from app.db.base import Base


class AlertType(str, enum.Enum):
    LOW_STOCK = "low_stock"
    SUSPICIOUS_TRANSACTION = "suspicious_transaction"
    SYSTEM = "system"


class Alert(Base):
    __tablename__ = "alert"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)  # Will store AlertType values as strings
    message = Column(String)
    severity = Column(String)  # 'info', 'warning', 'error'
    alert_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<Alert {self.id}: {self.type} - {self.severity}>" 
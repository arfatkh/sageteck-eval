from sqlalchemy import Column, Integer, String, DateTime, JSON
from datetime import datetime
from app.db.base import Base

class Alert(Base):
    __tablename__ = "alert"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, index=True)  # low_stock, suspicious_transaction, system
    message = Column(String)
    severity = Column(String)  # info, warning, error
    alert_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<Alert {self.id} - {self.type} - {self.severity}>" 
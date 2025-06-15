from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Customer(Base):
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    registration_date = Column(DateTime, default=datetime.utcnow)
    total_spent = Column(Float, default=0.0)
    risk_score = Column(Float, default=0.0)
    
    # Relationships
    transactions = relationship("Transaction", back_populates="customer")
    
    def __repr__(self):
        return f"<Customer {self.email}>" 
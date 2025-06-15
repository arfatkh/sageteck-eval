from sqlalchemy import Column, Integer, Float, DateTime, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.base import Base


class TransactionStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    SUSPICIOUS = "suspicious"


class PaymentMethod(str, enum.Enum):
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    PAYPAL = "paypal"
    BANK_TRANSFER = "bank_transfer"


class Transaction(Base):
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customer.id"))
    product_id = Column(Integer, ForeignKey("product.id"))
    quantity = Column(Integer)
    price = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(TransactionStatus), default=TransactionStatus.PENDING)
    payment_method = Column(Enum(PaymentMethod))
    
    # Relationships
    customer = relationship("Customer", back_populates="transactions")
    product = relationship("Product", back_populates="transactions")
    
    def __repr__(self):
        return f"<Transaction {self.id} - {self.status}>" 
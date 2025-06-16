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
    FLAGGED = "flagged"
    REFUNDED = "refunded"


class PaymentMethod(str, enum.Enum):
    CREDIT_CARD = "credit_card"
    APPLE_PAY = "apple_pay"
    GOOGLE_PAY = "google_pay"
    PAYPAL = "paypal"
    BANK_TRANSFER = "bank_transfer"


class Transaction(Base):
    __tablename__ = "transaction"

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
    
    # In-memory storage for fraud check result
    _fraud_check_result = None
    
    @property
    def fraud_check_result(self):
        """Get fraud check result."""
        return self._fraud_check_result
    
    @fraud_check_result.setter
    def fraud_check_result(self, value):
        """Set fraud check result."""
        self._fraud_check_result = value
    
    @property
    def total_amount(self) -> float:
        """Calculate total amount."""
        return float(self.price * self.quantity)
    
    def __repr__(self):
        return f"<Transaction {self.id} - {self.status}>" 
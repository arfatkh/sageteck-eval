from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class Product(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String, index=True)
    price = Column(Float)
    stock_quantity = Column(Integer)
    supplier_id = Column(Integer, ForeignKey("supplier.id"))
    
    # Relationships
    supplier = relationship("Supplier", back_populates="products")
    transactions = relationship("Transaction", back_populates="product")
    
    def __repr__(self):
        return f"<Product {self.name}>" 
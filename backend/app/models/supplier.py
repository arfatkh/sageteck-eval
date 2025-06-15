from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from app.db.base import Base


class Supplier(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    reliability_score = Column(Float, default=0.0)
    country = Column(String)
    
    # Relationships
    products = relationship("Product", back_populates="supplier")
    
    def __repr__(self):
        return f"<Supplier {self.name}>" 
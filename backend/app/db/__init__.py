"""
Database configuration and session management
"""

from .base import Base
from .session import SessionLocal, engine

# Import all models to ensure they are registered with SQLAlchemy
from app.models.product import Product
from app.models.customer import Customer
from app.models.transaction import Transaction
from app.models.supplier import Supplier

__all__ = ["Base", "SessionLocal", "engine", "Product", "Customer", "Transaction", "Supplier"] 
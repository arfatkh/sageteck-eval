from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.session import engine
from app.core.config import settings

# Import all SQLAlchemy models here
from app.models.product import Product
from app.models.customer import Customer
from app.models.transaction import Transaction
from app.models.supplier import Supplier


def init_db() -> None:
    """Initialize the database, creating all tables."""
    Base.metadata.create_all(bind=engine)


def seed_db(db: Session) -> None:
    """Seed the database with initial data."""
    # TODO: Add seeding logic here when needed
    pass


if __name__ == "__main__":
    init_db()
    # with Session(engine) as db:
    #     seed_db(db) 
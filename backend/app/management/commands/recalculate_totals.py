"""
Command to recalculate customer total spent amounts.
"""
from app.db.session import SessionLocal
from app.models.events import recalculate_all_customer_totals

def run():
    """Recalculate total spent for all customers."""
    print("Recalculating customer total spent amounts...")
    with SessionLocal() as db:
        recalculate_all_customer_totals(db)
    print("Done!") 
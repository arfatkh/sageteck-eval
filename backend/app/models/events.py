from sqlalchemy import event
from sqlalchemy.orm import Session
from sqlalchemy import func

from .transaction import Transaction, TransactionStatus
from .customer import Customer

def update_customer_total_spent(customer_id: int, session: Session) -> None:
    """Update customer's total_spent based on completed transactions."""
    total = (
        session.query(func.sum(Transaction.price * Transaction.quantity))
        .filter(
            Transaction.customer_id == customer_id,
            Transaction.status == TransactionStatus.COMPLETED
        )
        .scalar() or 0.0
    )
    
    customer = session.query(Customer).filter(Customer.id == customer_id).first()
    if customer:
        customer.total_spent = float(total)

@event.listens_for(Transaction, 'after_insert')
def after_transaction_insert(mapper, connection, target):
    """Update customer total_spent after transaction insert."""
    if target.status == TransactionStatus.COMPLETED:
        session = Session(bind=connection)
        update_customer_total_spent(target.customer_id, session)
        session.commit()
        session.close()

@event.listens_for(Transaction, 'after_update')
def after_transaction_update(mapper, connection, target):
    """Update customer total_spent after transaction status update."""
    session = Session(bind=connection)
    update_customer_total_spent(target.customer_id, session)
    session.commit()
    session.close()

def recalculate_all_customer_totals(session: Session) -> None:
    """Recalculate total_spent for all customers."""
    customers = session.query(Customer).all()
    for customer in customers:
        update_customer_total_spent(customer.id, session)
    session.commit() 
from sqlalchemy.orm import Session
from app import models

def get_customer_balance(db: Session, customer_id: int):
    """Calculate total balance for a customer"""
    unpaid_invoices = db.query(models.Invoice).filter(
        models.Invoice.customer_id == customer_id,
        models.Invoice.status.in_([models.InvoiceStatus.SENT, models.InvoiceStatus.PARTIAL, models.InvoiceStatus.OVERDUE])
    ).all()
    
    total_owed = 0
    for inv in unpaid_invoices:
        paid_amount = sum(p.amount for p in inv.payments)
        total_owed += (inv.total - paid_amount)
    
    return total_owed
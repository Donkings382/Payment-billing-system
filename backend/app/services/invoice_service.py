from sqlalchemy.orm import Session
from app import models
from datetime import datetime

def calculate_invoice_totals(db: Session, invoice_id: int):
    """Recalculate subtotal, total, and status"""
    invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if not invoice:
        return None
    
    # Recalculate subtotal from items
    subtotal = sum(item.total for item in invoice.items)
    invoice.subtotal = subtotal
    
    # Apply tax and discount
    total = subtotal + (subtotal * invoice.tax / 100) - invoice.discount
    invoice.total = max(0, total)
    
    # Calculate paid amount
    paid_amount = sum(payment.amount for payment in invoice.payments)
    
    # Determine status
    if paid_amount >= invoice.total:
        invoice.status = models.InvoiceStatus.PAID
    elif paid_amount > 0:
        invoice.status = models.InvoiceStatus.PARTIAL
    elif invoice.due_date < datetime.utcnow():
        invoice.status = models.InvoiceStatus.OVERDUE
    else:
        invoice.status = models.InvoiceStatus.SENT
    
    db.commit()
    db.refresh(invoice)
    return invoice
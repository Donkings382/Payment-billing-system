from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app import models, schemas, auth
from app.services.invoice_service import calculate_invoice_totals

router = APIRouter()

def generate_invoice_number(db: Session, user_id: int):
    """Generate unique invoice number (INV-YYYYMMDD-XXXX)"""
    count = db.query(models.Invoice).filter(
        models.Invoice.owner_id == user_id
    ).count()
    date_str = datetime.utcnow().strftime("%Y%m%d")
    return f"INV-{date_str}-{count + 1:04d}"

@router.post("/", response_model=schemas.InvoiceResponse)
def create_invoice(
    invoice: schemas.InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Verify customer belongs to this user
    customer = db.query(models.Customer).filter(
        models.Customer.id == invoice.customer_id,
        models.Customer.owner_id == current_user.id
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Calculate subtotal from items
    subtotal = sum(item.quantity * item.unit_price for item in invoice.items)
    
    # Create invoice
    db_invoice = models.Invoice(
        invoice_number=generate_invoice_number(db, current_user.id),
        customer_id=invoice.customer_id,
        owner_id=current_user.id,
        due_date=invoice.due_date,
        tax=invoice.tax,
        discount=invoice.discount,
        subtotal=subtotal,
        notes=invoice.notes,
        status=models.InvoiceStatus.SENT  # Set to SENT when created
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    
    # Add items
    for item in invoice.items:
        db_item = models.InvoiceItem(
            description=item.description,
            quantity=item.quantity,
            unit_price=item.unit_price,
            total=item.quantity * item.unit_price,
            invoice_id=db_invoice.id
        )
        db.add(db_item)
    
    db.commit()
    
    # Recalculate totals and status
    calculate_invoice_totals(db, db_invoice.id)
    db.refresh(db_invoice)
    
    return db_invoice

@router.get("/", response_model=List[schemas.InvoiceResponse])
def list_invoices(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    invoices = db.query(models.Invoice).filter(
        models.Invoice.owner_id == current_user.id
    ).offset(skip).limit(limit).all()
    return invoices

@router.get("/{invoice_id}", response_model=schemas.InvoiceResponse)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    invoice = db.query(models.Invoice).filter(
        models.Invoice.id == invoice_id,
        models.Invoice.owner_id == current_user.id
    ).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice
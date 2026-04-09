from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas, auth
from app.services.invoice_service import calculate_invoice_totals

router = APIRouter()

@router.post("/", response_model=schemas.PaymentResponse)
def record_payment(
    payment: schemas.PaymentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Verify invoice belongs to this user
    invoice = db.query(models.Invoice).filter(
        models.Invoice.id == payment.invoice_id,
        models.Invoice.owner_id == current_user.id
    ).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Check if payment amount is valid
    paid_so_far = sum(p.amount for p in invoice.payments)
    remaining = invoice.total - paid_so_far
    
    if payment.amount > remaining:
        raise HTTPException(status_code=400, detail=f"Payment exceeds remaining balance. Remaining: {remaining}")
    
    # Create payment record
    db_payment = models.Payment(
        amount=payment.amount,
        note=payment.note,
        invoice_id=payment.invoice_id
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    
    # Recalculate invoice totals and status
    calculate_invoice_totals(db, invoice.id)
    
    return db_payment

@router.get("/invoice/{invoice_id}", response_model=List[schemas.PaymentResponse])
def get_invoice_payments(
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
    
    return invoice.payments
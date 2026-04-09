from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from app.database import get_db
from app import models, schemas, auth

router = APIRouter()

@router.get("/late-payers", response_model=List[schemas.LatePayerResponse])
def get_late_payers(
    days_overdue: int = 7,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Find customers with invoices overdue by more than X days"""
    cutoff_date = datetime.utcnow() - timedelta(days=days_overdue)
    
    # Find overdue invoices
    overdue_invoices = db.query(models.Invoice).filter(
        models.Invoice.owner_id == current_user.id,
        models.Invoice.due_date < cutoff_date,
        models.Invoice.status == models.InvoiceStatus.OVERDUE
    ).all()
    
    # Group by customer
    customer_data = {}
    for inv in overdue_invoices:
        paid_amount = sum(p.amount for p in inv.payments)
        overdue_amount = inv.total - paid_amount
        days = (datetime.utcnow() - inv.due_date).days
        
        if inv.customer_id not in customer_data:
            customer_data[inv.customer_id] = {
                "customer_name": inv.customer.name,
                "total_overdue": 0,
                "max_days": 0
            }
        
        customer_data[inv.customer_id]["total_overdue"] += overdue_amount
        customer_data[inv.customer_id]["max_days"] = max(customer_data[inv.customer_id]["max_days"], days)
    
    return [
        schemas.LatePayerResponse(
            customer_id=cid,
            customer_name=data["customer_name"],
            overdue_amount=data["total_overdue"],
            days_overdue=data["max_days"]
        )
        for cid, data in customer_data.items()
    ]

@router.get("/high-debt", response_model=List[schemas.HighDebtCustomerResponse])
def get_high_debt_customers(
    threshold: float = 5000,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Find customers with total unpaid balance above threshold"""
    customers = db.query(models.Customer).filter(
        models.Customer.owner_id == current_user.id
    ).all()
    
    high_debt = []
    for customer in customers:
        # Calculate total balance
        unpaid_invoices = db.query(models.Invoice).filter(
            models.Invoice.customer_id == customer.id,
            models.Invoice.status.in_([models.InvoiceStatus.SENT, models.InvoiceStatus.PARTIAL, models.InvoiceStatus.OVERDUE])
        ).all()
        
        total_balance = 0
        for inv in unpaid_invoices:
            paid = sum(p.amount for p in inv.payments)
            total_balance += (inv.total - paid)
        
        if total_balance > threshold:
            high_debt.append(
                schemas.HighDebtCustomerResponse(
                    customer_id=customer.id,
                    customer_name=customer.name,
                    total_balance=total_balance,
                    unpaid_invoices_count=len(unpaid_invoices)
                )
            )
    
    # Sort by highest debt
    high_debt.sort(key=lambda x: x.total_balance, reverse=True)
    return high_debt

@router.get("/frequent-customers")
def get_frequent_customers(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Find top 5 customers by invoice count"""
    customers = db.query(models.Customer).filter(
        models.Customer.owner_id == current_user.id
    ).all()
    
    customer_stats = []
    for customer in customers:
        invoice_count = db.query(models.Invoice).filter(
            models.Invoice.customer_id == customer.id
        ).count()
        
        total_invoiced = db.query(models.Invoice).filter(
            models.Invoice.customer_id == customer.id
        ).with_entities(models.Invoice.total).all()
        
        total_amount = sum(inv[0] for inv in total_invoiced)
        
        customer_stats.append({
            "customer_id": customer.id,
            "customer_name": customer.name,
            "invoice_count": invoice_count,
            "total_amount": total_amount
        })
    
    # Sort by invoice count
    customer_stats.sort(key=lambda x: x["invoice_count"], reverse=True)
    return customer_stats[:5]

@router.get("/payment-trends")
def get_payment_trends(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Simple rule-based payment trends"""
    # Get last 30 days of payments
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    recent_payments = db.query(models.Payment).join(
        models.Invoice
    ).filter(
        models.Invoice.owner_id == current_user.id,
        models.Payment.payment_date >= thirty_days_ago
    ).all()
    
    total_received = sum(p.amount for p in recent_payments)
    payment_count = len(recent_payments)
    
    # Calculate average payment time (simple)
    paid_invoices = db.query(models.Invoice).filter(
        models.Invoice.owner_id == current_user.id,
        models.Invoice.status == models.InvoiceStatus.PAID
    ).all()
    
    avg_days = 0
    if paid_invoices:
        total_days = 0
        for inv in paid_invoices:
            last_payment = max(inv.payments, key=lambda p: p.payment_date) if inv.payments else None
            if last_payment:
                days = (last_payment.payment_date - inv.issue_date).days
                total_days += days
        avg_days = total_days / len(paid_invoices)
    
    return {
        "last_30_days_received": total_received,
        "last_30_days_transactions": payment_count,
        "average_payment_days": round(avg_days, 1),
        "insight": "Good payment rate" if avg_days < 15 else "Slow payments - consider reminders"
    }
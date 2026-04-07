from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List

from app.database import engine, get_db, Base
from app import models, schemas, auth
from app.routers import customers, invoices, payments, insights

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Payment & Billing System", version="1.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(customers.router, prefix="/api/customers", tags=["customers"])
app.include_router(invoices.router, prefix="/api/invoices", tags=["invoices"])
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])
app.include_router(insights.router, prefix="/api/insights", tags=["insights"])

# Auth endpoints
@app.post("/api/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        organization=user.organization
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    authenticated_user = auth.authenticate_user(db, user.email, user.password)
    if not authenticated_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": str(authenticated_user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/dashboard", response_model=schemas.DashboardResponse)
def get_dashboard(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Get all unpaid invoices for this user
    from datetime import datetime
    unpaid_invoices = db.query(models.Invoice).filter(
        models.Invoice.owner_id == current_user.id,
        models.Invoice.status.in_([models.InvoiceStatus.SENT, models.InvoiceStatus.PARTIAL, models.InvoiceStatus.OVERDUE])
    ).all()
    
    # Calculate total owed
    total_owed = 0
    for inv in unpaid_invoices:
        paid_amount = sum(p.amount for p in inv.payments)
        total_owed += (inv.total - paid_amount)
    
    # Get recent invoices (last 5)
    recent_invoices = db.query(models.Invoice).filter(
        models.Invoice.owner_id == current_user.id
    ).order_by(models.Invoice.created_at.desc()).limit(5).all()
    
    return schemas.DashboardResponse(
        total_owed=total_owed,
        unpaid_invoices_count=len(unpaid_invoices),
        recent_invoices=recent_invoices
    )

@app.get("/")
def root():
    return {"message": "Payment & Billing System API", "docs": "/docs"}
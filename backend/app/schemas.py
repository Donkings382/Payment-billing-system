from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional
from enum import Enum

# User schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    organization: Optional[str] = "My Business"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    organization: str
    
    class Config:
        from_attributes = True

# Customer schemas
class CustomerBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime
    owner_id: int
    
    class Config:
        from_attributes = True

# Invoice Item schemas
class InvoiceItemBase(BaseModel):
    description: str
    quantity: float
    unit_price: float

class InvoiceItemCreate(InvoiceItemBase):
    pass

class InvoiceItemResponse(InvoiceItemBase):
    id: int
    total: float
    
    class Config:
        from_attributes = True

# Invoice schemas
class InvoiceStatusEnum(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    PARTIAL = "partial"
    PAID = "paid"
    OVERDUE = "overdue"

class InvoiceBase(BaseModel):
    customer_id: int
    due_date: datetime
    tax: float = 0.0
    discount: float = 0.0
    notes: Optional[str] = None

class InvoiceCreate(InvoiceBase):
    items: List[InvoiceItemCreate]

class InvoiceResponse(InvoiceBase):
    id: int
    invoice_number: str
    issue_date: datetime
    subtotal: float
    total: float
    status: InvoiceStatusEnum
    created_at: datetime
    items: List[InvoiceItemResponse]
    
    class Config:
        from_attributes = True

# Payment schemas
class PaymentBase(BaseModel):
    invoice_id: int
    amount: float
    note: Optional[str] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentResponse(PaymentBase):
    id: int
    payment_date: datetime
    
    class Config:
        from_attributes = True

# Dashboard & Insights schemas
class DashboardResponse(BaseModel):
    total_owed: float
    unpaid_invoices_count: int
    recent_invoices: List[InvoiceResponse]

class LatePayerResponse(BaseModel):
    customer_id: int
    customer_name: str
    overdue_amount: float
    days_overdue: int

class HighDebtCustomerResponse(BaseModel):
    customer_id: int
    customer_name: str
    total_balance: float
    unpaid_invoices_count: int
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title=os.getenv("APP_NAME", "Payment Billing System"),
    description="A comprehensive payment and billing system API",
    version="1.0.0"
)

# CORS Configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Payment Billing System API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include routers here
# app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
# app.include_router(payment_router, prefix="/api/v1/payments", tags=["Payments"])
# app.include_router(subscription_router, prefix="/api/v1/subscriptions", tags=["Subscriptions"])
# app.include_router(invoice_router, prefix="/api/v1/invoices", tags=["Invoices"])
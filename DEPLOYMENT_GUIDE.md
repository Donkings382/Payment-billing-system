# Full-Stack Deployment Guide: Netlify + Backend

This guide will help you deploy your Payment and Billing System using **Netlify** for the frontend and a cloud platform for your FastAPI backend. The frontend will be deployed on Netlify, while the backend will be deployed on a platform like Render, Railway, or similar.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment (Netlify)](#frontend-deployment-netlify)
5. [Environment Configuration](#environment-configuration)
6. [Post-Deployment Steps](#post-deployment-steps)
7. [Troubleshooting](#troubleshooting)

---

## 🛠️ Prerequisites

- Git repository (your code is already in Git)
- Node.js 18+ and npm installed locally
- Python 3.9+ installed locally
- Supabase account (free tier available)
- Netlify account (free tier available)
- A deployment platform for the backend (Railway, Render, or AWS)

---

## 🗄️ Supabase Setup

### 1. Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Project name**: `payment-billing-system`
   - **Database password**: (save this securely!)
   - **Region**: Choose closest to your users
4. Click "Create new project"

### 2. Set Up Database Schema

Your current app uses SQLite, but we'll migrate to PostgreSQL (Supabase uses PostgreSQL).

#### Option A: Use Supabase Migration (Recommended)

1. In your Supabase dashboard, go to **SQL Editor**
2. Run this migration script:

```sql
-- Create users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table
CREATE TABLE customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    organization_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    owner_id UUID REFERENCES users(id),
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_customers_organization ON customers(organization_id);
CREATE INDEX idx_invoices_owner ON invoices(owner_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
```

#### Option B: Use Supabase Auth (Alternative)

Instead of building your own auth system, you can use Supabase Auth:

1. Go to **Authentication** → **Providers** in Supabase
2. Enable **Email/Password** provider
3. Configure email templates if needed

---

## 🚀 Backend Deployment Options

Since you're using Supabase for the database, you have several options for deploying your FastAPI backend:

### Option 1: Railway.app (Easiest)

1. **Prepare your backend for Railway:**
   - Create a `Procfile` in the backend root:
     ```
     web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - Update `requirements.txt` to include `gunicorn`

2. **Deploy to Railway:**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Set root directory to `backend`
   - Add environment variables (see below)
   - Deploy!

### Option 2: Render.com

1. **Create a new Web Service on Render:**
   - Connect your GitHub repository
   - Set root directory to `backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Option 3: AWS (More Complex but Scalable)

Use AWS Elastic Beanstalk or ECS with Fargate.

---

## 🌐 Frontend Deployment (Netlify)

### Important: Netlify Only Handles Frontend

**Netlify is designed specifically for frontend/static websites.** It cannot run your FastAPI backend. You will need to deploy:

1. **Frontend** on Netlify (React application)
2. **Backend** on a separate platform (Railway, Render, AWS, etc.)

### Step 1: Netlify Configuration

The project is already configured for Netlify deployment with these files:

- **`netlify.toml`** - Build configuration and redirects
- **`frontend/public/_redirects`** - SPA routing configuration

### Step 2: Environment Variables

1. **Create a `.env.production` file** in the frontend directory:

   ```
   REACT_APP_API_URL=https://your-backend-url.com/api
   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key
   ```

2. **Update your build process:**
   - Your `package.json` already has the build script
   - Netlify will automatically run `npm run build`

### Step 3: Deploy to Netlify

#### Method A: Git Integration (Recommended)

1. **Push your code to GitHub** (if not already done)

2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Select "GitHub"
   - Authorize Netlify to access your repositories
   - Select your repository

3. **Configure build settings:**
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`

4. **Set environment variables** in Netlify:
   - Go to **Site settings** → **Build & deploy** → **Environment**
   - Add:
     ```
     REACT_APP_API_URL = https://your-backend-url.com/api
     REACT_APP_SUPABASE_URL = https://your-project.supabase.co
     REACT_APP_SUPABASE_ANON_KEY = your-anon-key
     ```

5. **Deploy!**
   - Click "Deploy site"
   - Netlify will build and deploy your site automatically

#### Method B: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Navigate to frontend directory
cd frontend

# Build the project
npm run build

# Deploy
netlify deploy --prod --dir=build
```

### **Answering Your Question:**

**No, you do NOT need to run `cd frontend && npm start`.**

- `npm start` is for local development only
- Netlify automatically runs `npm run build` (not `npm start`) when it deploys
- You **cannot** upload the entire folder containing frontend and backend to Netlify - it will only deploy the frontend
- You **must** deploy the backend separately on a platform that supports Python/FastAPI

### Step 4: Configuration Details

The `netlify.toml` file includes:

- **Build settings**: Automatically builds the React frontend
- **Redirects**: Ensures SPA routing works correctly
- **Security headers**: Adds protection headers
- **Caching**: Optimizes static asset delivery

---

## ⚙️ Environment Configuration

### Backend Environment Variables

Your backend needs these environment variables (set in Railway/Render/AWS):

```env
# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[YOUR_DB_PASSWORD]@db.your-project.supabase.co:5432/postgres

# JWT Secret (generate a strong random string)
SECRET_KEY=your-super-secret-jwt-key-here

# CORS (update with your Netlify URL)
CORS_ORIGINS=https://your-site.netlify.app,https://your-custom-domain.com

# Supabase (if using Supabase Auth)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Payment Gateways (add your actual keys)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@yourcompany.com
```

### Frontend Environment Variables

Set these in Netlify:

```env
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
```

---

## 🔄 Update Your Code for Production

### 1. Update Backend CORS

In `backend/app/main.py`, update the CORS configuration:

```python
# Get CORS origins from environment variable
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,  # Dynamic based on environment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. Update Database Configuration

In `backend/app/database.py`, make sure it uses PostgreSQL in production:

```python
import os
from dotenv import load_dotenv

load_dotenv()

# Use PostgreSQL in production, SQLite for local development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./billing.db")

# For PostgreSQL, remove the SQLite-specific check_same_thread
connect_args = {}
if "sqlite" in DATABASE_URL:
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args
)
```

### 3. Update Frontend API Configuration

Your `frontend/src/services/api.ts` is already configured correctly to use environment variables.

---

## 📊 Post-Deployment Steps

### 1. Database Migrations

If you need to run migrations on Supabase:

```bash
# Connect to your Supabase database
psql postgresql://postgres:[YOUR_DB_PASSWORD]@db.your-project.supabase.co:5432/postgres

# Or use a migration tool like Alembic
alembic upgrade head
```

### 2. Set Up Payment Webhooks

1. **Stripe Webhooks:**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-backend-url.com/api/payments/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, etc.
   - Copy the signing secret and add to your backend environment

2. **PayPal Webhooks:**
   - Similar process in PayPal Developer Dashboard

### 3. Test Your Deployment

1. **Test frontend deployment:**
   - Visit your Netlify URL
   - Try logging in/registering
   - Test creating invoices and payments

2. **Test backend API:**
   - Visit `https://your-backend-url.com/docs` for Swagger UI
   - Test endpoints manually

3. **Test database connection:**
   - Check Supabase dashboard for data
   - Verify tables are created correctly

### 4. Set Up Custom Domain (Optional)

#### For Netlify:

1. Go to **Domain settings** in Netlify
2. Click "Add custom domain"
3. Follow the instructions to configure DNS

#### For Backend (Railway/Render):

1. Go to your project settings
2. Add custom domain
3. Update DNS records as instructed

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. CORS Errors

**Problem:** Frontend can't connect to backend

**Solution:**

- Ensure `CORS_ORIGINS` in backend includes your Netlify URL
- Check that your backend is running and accessible

#### 2. Database Connection Issues

**Problem:** Backend can't connect to Supabase

**Solution:**

- Verify `DATABASE_URL` is correct
- Check that your database password is properly escaped
- Ensure your IP is allowed in Supabase (or use connection pooling)

#### 3. Build Failures on Netlify

**Problem:** Netlify build fails

**Solution:**

- Check the build logs in Netlify
- Ensure all dependencies are in `package.json`
- Verify Node version is compatible (set `NODE_VERSION` in Netlify env vars if needed)

#### 4. Environment Variables Not Working

**Problem:** App doesn't use environment variables

**Solution:**

- For React: Variables must start with `REACT_APP_`
- Redeploy after adding environment variables
- Check that variables are set in the correct place (Netlify vs local)

#### 5. Payment Webhooks Not Working

**Problem:** Stripe/PayPal webhooks fail

**Solution:**

- Ensure your webhook endpoint is publicly accessible
- Verify webhook secret is correct
- Check backend logs for errors

---

## 📈 Monitoring and Maintenance

### 1. Set Up Monitoring

- **Backend**: Use Railway/Render built-in monitoring or add Sentry
- **Frontend**: Use Netlify Analytics or Google Analytics
- **Database**: Monitor Supabase dashboard for performance

### 2. Backup Strategy

- **Database**: Supabase provides automatic backups (daily on free tier)
- **Code**: Regular Git commits and pushes
- **Environment Variables**: Store securely in a password manager

### 3. Security Considerations

- Use HTTPS everywhere (Netlify and Railway/Render provide this)
- Keep dependencies updated
- Use strong, unique secrets for JWT and database passwords
- Enable two-factor authentication on all accounts
- Regularly review and rotate API keys

---

## 🎯 Next Steps

1. **Set up CI/CD**: Automate deployments with GitHub Actions
2. **Add monitoring**: Implement error tracking with Sentry
3. **Optimize performance**: Add caching, CDN, database indexing
4. **Scale**: Consider load balancing and database read replicas as you grow

---

## 📞 Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [React Documentation](https://react.dev)

---

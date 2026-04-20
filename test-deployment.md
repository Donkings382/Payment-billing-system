# Deployment Test Checklist

Use this checklist to verify your deployment is working correctly.

## Frontend (Netlify) Testing

### 1. Build Test
```bash
# Navigate to frontend directory
cd frontend

# Test build process
npm run build

# Check if build was successful
ls build/
# Should contain: index.html, static/, etc.
```

### 2. Environment Variables
- [ ] `REACT_APP_API_URL` is set correctly
- [ ] `REACT_APP_SUPABASE_URL` is set correctly  
- [ ] `REACT_APP_SUPABASE_ANON_KEY` is set correctly

### 3. Netlify Configuration
- [ ] `netlify.toml` exists and is properly configured
- [ ] `frontend/public/_redirects` exists for SPA routing
- [ ] Build settings point to correct directories

## Backend Testing

### 1. Local Testing
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Test database connection
python -c "from app.database import engine; print('Database connected successfully')"

# Test API startup
uvicorn app.main:app --host 0.0.0.0 --port 8000
# Visit http://localhost:8000/docs to verify API
```

### 2. Environment Variables
- [ ] `DATABASE_URL` points to your Supabase database
- [ ] `SECRET_KEY` is set with a strong random string
- [ ] `CORS_ORIGINS` includes your Netlify URL

### 3. Procfile Configuration
- [ ] `Procfile` exists with correct command
- [ ] `runtime.txt` specifies Python version

## Database (Supabase) Testing

### 1. Connection Test
```bash
# Test database connection
psql postgresql://postgres:[YOUR_DB_PASSWORD]@db.your-project.supabase.co:5432/postgres

# Verify tables exist
\dt
```

### 2. Schema Verification
- [ ] `users` table exists
- [ ] `customers` table exists
- [ ] `invoices` table exists
- [ ] `payments` table exists

## Integration Testing

### 1. Frontend + Backend
- [ ] Frontend can register new users
- [ ] Frontend can login existing users
- [ ] Frontend can create customers
- [ ] Frontend can create invoices
- [ ] Frontend can process payments

### 2. API Endpoints
- [ ] `GET /api/dashboard` returns user data
- [ ] `GET /api/me` returns current user
- [ ] `POST /api/register` creates new user
- [ ] `POST /api/login` authenticates user

## Common Issues Checklist

- [ ] CORS errors resolved
- [ ] Database connection working
- [ ] Environment variables properly set
- [ ] Build process successful
- [ ] SPA routing working correctly
- [ ] API endpoints accessible from frontend

## Deployment Commands

### Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy frontend
cd frontend
npm run build
netlify deploy --prod --dir=build
```

### Railway Deploy
```bash
# Railway CLI
railway login
railway init
railway deploy
```

### Render Deploy
- Connect GitHub repository
- Set build command: `pip install -r requirements.txt`
- Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
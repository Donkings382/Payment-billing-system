# Payment and Billing System

A comprehensive payment and billing system with a React frontend and FastAPI backend, designed to handle secure transactions, subscription management, invoicing, and payment processing.

## 🚀 Features

- **Secure Payment Processing** - Multiple payment gateway integrations (Stripe, PayPal, etc.)
- **Subscription Management** - Recurring billing and subscription plans
- **Invoice Generation** - Automated invoice creation and delivery
- **Payment Methods** - Support for credit cards, bank transfers, and digital wallets
- **Reporting & Analytics** - Detailed transaction reports and financial analytics
- **Multi-currency Support** - Handle transactions in multiple currencies
- **Webhook Integration** - Real-time payment status updates
- **PCI Compliance** - Security-first approach to payment data handling
- **Responsive UI** - Modern React frontend with Material-UI components

## 📁 Project Structure

```
Payment and billing system/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/        # API route definitions
│   │   ├── core/              # Core configuration and security
│   │   ├── models/            # Database models
│   │   ├── schemas/           # Pydantic schemas for validation
│   │   ├── services/          # Business logic and external services
│   │   ├── utils/             # Helper functions
│   │   └── main.py            # FastAPI application entry point
│   ├── tests/                 # Backend tests
│   ├── scripts/               # Database migrations and utilities
│   ├── requirements.txt        # Python dependencies
│   └── .env                   # Backend environment variables
│
├── frontend/                   # React Frontend
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service calls
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Utility functions
│   │   ├── context/           # React context for state management
│   │   ├── assets/            # Images, fonts, etc.
│   │   └── App.js             # Main React component
│   ├── package.json           # Frontend dependencies
│   └── .env                   # Frontend environment variables
│
├── docs/                       # Documentation
├── .gitignore                  # Git ignore rules
├── .env.example               # Environment variables template
└── README.md                   # This file
```

## 🛠️ Tech Stack

### Backend
- **Framework:** FastAPI
- **Language:** Python 3.9+
- **Database:** PostgreSQL / MongoDB
- **ORM:** SQLAlchemy / Beanie
- **Authentication:** JWT (Python-JOSE)
- **Payment Gateways:** Stripe, PayPal SDKs
- **Validation:** Pydantic
- **Testing:** Pytest, HTTPX

### Frontend
- **Framework:** React 18+
- **Language:** JavaScript (ES6+)
- **Styling:** Material-UI (MUI) / Tailwind CSS
- **State Management:** React Context API / Redux Toolkit
- **HTTP Client:** Axios
- **Routing:** React Router v6
- **Forms:** React Hook Form
- **Testing:** Jest, React Testing Library

## 📋 Prerequisites

### Backend
- Python 3.9 or higher
- pip or poetry
- PostgreSQL or MongoDB

### Frontend
- Node.js 18+ 
- npm or yarn

## ⚙️ Installation

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run database migrations**
   ```bash
   alembic upgrade head
   ```

6. **Start the backend server**
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Backend Environment Variables (.env)

```env
# Server
APP_NAME=Payment Billing System
DEBUG=True
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/payment_billing
# or for MongoDB
MONGODB_URI=mongodb://localhost:27017/payment_billing

# Payment Gateways
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@yourcompany.com

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Frontend Environment Variables (.env)

```env
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
REACT_APP_PAYPAL_CLIENT_ID=your_paypal_client_id
```

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Key API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh access token

#### Payments
- `POST /api/v1/payments/create` - Create payment intent
- `POST /api/v1/payments/webhook` - Payment webhooks
- `GET /api/v1/payments/history` - Payment history

#### Subscriptions
- `POST /api/v1/subscriptions/create` - Create subscription
- `GET /api/v1/subscriptions/:id` - Get subscription details
- `PUT /api/v1/subscriptions/:id` - Update subscription
- `DELETE /api/v1/subscriptions/:id` - Cancel subscription

#### Invoices
- `GET /api/v1/invoices` - List invoices
- `GET /api/v1/invoices/:id` - Get invoice details
- `POST /api/v1/invoices/:id/send` - Resend invoice

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
pytest tests/ --cov=app --cov-report=html
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
```

## 🚀 Deployment

### Backend (using Gunicorn)
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend (Production Build)
```bash
cd frontend
npm run build
# Serve the build folder with a static file server
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, email support@yourcompany.com or open an issue in the repository.

## 🗺️ Roadmap

- [ ] Add cryptocurrency payment support
- [ ] Implement advanced fraud detection
- [ ] Add multi-tenant support
- [ ] Create admin dashboard
- [ ] Implement automated tax calculation
- [ ] Add mobile app support

---

**Built with ❤️ using React and FastAPI**
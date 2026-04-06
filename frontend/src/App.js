import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';

// Import pages (create these files as you build the app)
// import HomePage from './pages/HomePage';
// import DashboardPage from './pages/DashboardPage';
// import PaymentPage from './pages/PaymentPage';
// import SubscriptionPage from './pages/SubscriptionPage';
// import InvoicePage from './pages/InvoicePage';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-right" />
      <Router>
        <div className="App">
          <Routes>
            {/* Define your routes here */}
            <Route path="/" element={<div>Welcome to Payment Billing System</div>} />
            {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
            {/* <Route path="/payments" element={<PaymentPage />} /> */}
            {/* <Route path="/subscriptions" element={<SubscriptionPage />} /> */}
            {/* <Route path="/invoices" element={<InvoicePage />} /> */}
            {/* <Route path="/login" element={<LoginPage />} /> */}
            {/* <Route path="/register" element={<RegisterPage />} /> */}
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
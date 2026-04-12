import api from "./api";

export interface DashboardData {
  total_owed: number;
  unpaid_invoices_count: number;
  recent_invoices: any[];
}

export async function getDashboard() {
  const { data } = await api.get<DashboardData>("/dashboard");
  return data;
}

export interface LatePayer {
  customer_id: number;
  customer_name: string;
  overdue_amount: number;
  days_overdue: number;
}

export interface HighDebtCustomer {
  customer_id: number;
  customer_name: string;
  total_balance: number;
  unpaid_invoices_count: number;
}

export async function getLatePayers(days_overdue: number = 7) {
  const { data } = await api.get<LatePayer[]>("/insights/late-payers", {
    params: { days_overdue },
  });
  return data;
}

export async function getHighDebtCustomers(threshold: number = 5000) {
  const { data } = await api.get<HighDebtCustomer[]>("/insights/high-debt", {
    params: { threshold },
  });
  return data;
}

export async function getFrequentCustomers() {
  const { data } = await api.get<any[]>("/insights/frequent-customers");
  return data;
}

export async function getPaymentTrends() {
  const { data } = await api.get<any>("/insights/payment-trends");
  return data;
}

export interface PaymentRiskFactor {
  name: string;
  impact: number;
  value: string;
}

export interface InvoiceRisk {
  invoice_id: number;
  invoice_number: string;
  customer_id: number;
  customer_name: string;
  due_date: string;
  amount_due: number;
  outstanding_balance: number;
  risk_score: number;
  risk_level: "low" | "medium" | "high";
  recommendation: string;
  factors: PaymentRiskFactor[];
}

export interface CustomerRisk {
  customer_id: number;
  customer_name: string;
  unpaid_invoices_count: number;
  total_outstanding_balance: number;
  average_risk_score: number;
  highest_risk_score: number;
  risk_level: "low" | "medium" | "high";
}

export interface PaymentRiskReport {
  generated_at: string;
  invoice_risks: InvoiceRisk[];
  customer_risks: CustomerRisk[];
}

export async function getPaymentRisk() {
  const { data } = await api.get<PaymentRiskReport>("/insights/payment-risk");
  return data;
}

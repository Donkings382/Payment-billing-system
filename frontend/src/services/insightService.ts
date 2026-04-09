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

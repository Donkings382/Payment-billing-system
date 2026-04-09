import api from "./api";

export interface Payment {
  id: number;
  invoice_id: number;
  amount: number;
  note?: string;
  payment_date: string;
}

export interface PaymentCreate {
  invoice_id: number;
  amount: number;
  note?: string;
}

export async function listPaymentsByInvoice(invoiceId: number) {
  const { data } = await api.get<Payment[]>(`/payments/invoice/${invoiceId}`);
  return data;
}

export async function createPayment(payment: PaymentCreate) {
  const { data } = await api.post<Payment>("/payments", payment);
  return data;
}

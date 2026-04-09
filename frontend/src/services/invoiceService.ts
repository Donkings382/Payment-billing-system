import api from "./api";

export interface Invoice {
  id: number;
  invoice_number: string;
  customer_id: number;
  due_date: string;
  tax: number;
  discount: number;
  notes?: string;
  subtotal: number;
  total: number;
  status: string;
  created_at: string;
  items: any[];
}

export interface InvoiceCreate {
  customer_id: number;
  due_date: string;
  tax?: number;
  discount?: number;
  notes?: string;
  items: any[];
}

export async function listInvoices(skip: number = 0, limit: number = 100) {
  const { data } = await api.get<Invoice[]>("/invoices", {
    params: { skip, limit },
  });
  return data;
}

export async function getInvoice(invoiceId: number) {
  const { data } = await api.get<Invoice>(`/invoices/${invoiceId}`);
  return data;
}

export async function createInvoice(invoice: InvoiceCreate) {
  const { data } = await api.post<Invoice>("/invoices", invoice);
  return data;
}

import { useEffect, useState } from "react";
import {
  listPaymentsByInvoice,
  createPayment,
  Payment,
} from "../services/paymentService";
import { listInvoices, Invoice } from "../services/invoiceService";
import { listCustomers, Customer } from "../services/customerService";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState({ invoice_id: "", amount: "", note: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [inv, cust] = await Promise.all([
          listInvoices(),
          listCustomers(),
        ]);
        setInvoices(inv);
        setCustomers(cust);
        // Optionally, fetch payments for the first invoice
        if (inv.length > 0) {
          const pays = await listPaymentsByInvoice(inv[0].id);
          setPayments(pays);
        }
      } catch (e) {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleInvoiceChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const invoiceId = e.target.value;
    setForm((prev) => ({ ...prev, invoice_id: invoiceId }));
    if (invoiceId) {
      setLoading(true);
      try {
        const pays = await listPaymentsByInvoice(Number(invoiceId));
        setPayments(pays);
      } catch (e) {
        setPayments([]);
      } finally {
        setLoading(false);
      }
    } else {
      setPayments([]);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.invoice_id || !form.amount) return;
    setLoading(true);
    try {
      const payment = await createPayment({
        invoice_id: Number(form.invoice_id),
        amount: Number(form.amount),
        note: form.note,
      });
      setPayments((prev) => [payment, ...prev]);
      setForm({ invoice_id: form.invoice_id, amount: "", note: "" });
    } catch (e) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Record Payment
        </h2>
        <form
          onSubmit={handleRecordPayment}
          className="grid grid-cols-1 md:grid-cols-4 gap-3"
        >
          <select
            value={form.invoice_id}
            onChange={handleInvoiceChange}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="">Select Invoice</option>
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.invoice_number} -{" "}
                {customers.find((c) => c.id === inv.customer_id)?.name ||
                  inv.customer_id}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={form.amount}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, amount: e.target.value }))
            }
            placeholder="Amount"
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
          <input
            value={form.note}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, note: e.target.value }))
            }
            placeholder="Note (optional)"
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Saving..." : "Save Payment"}
          </button>
        </form>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Payments</h2>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-5 py-3 text-xs uppercase text-slate-500">
                Payment ID
              </th>
              <th className="text-left px-5 py-3 text-xs uppercase text-slate-500">
                Invoice
              </th>
              <th className="text-left px-5 py-3 text-xs uppercase text-slate-500">
                Customer
              </th>
              <th className="text-left px-5 py-3 text-xs uppercase text-slate-500">
                Date
              </th>
              <th className="text-right px-5 py-3 text-xs uppercase text-slate-500">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => {
              const invoice = invoices.find(
                (inv) => inv.id === payment.invoice_id,
              );
              const customer = customers.find(
                (c) => c.id === invoice?.customer_id,
              );
              return (
                <tr key={payment.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 text-sm text-slate-700">
                    {payment.id}
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-700">
                    {invoice?.invoice_number || payment.invoice_id}
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-700">
                    {customer?.name || invoice?.customer_id}
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-700">
                    {payment.payment_date
                      ? payment.payment_date.split("T")[0]
                      : ""}
                  </td>
                  <td className="px-5 py-3 text-sm font-semibold text-slate-800 text-right">
                    ${payment.amount.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

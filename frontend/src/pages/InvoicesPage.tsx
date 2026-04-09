import { useEffect, useMemo, useState } from "react";
import {
  listInvoices,
  createInvoice,
  Invoice,
} from "../services/invoiceService";
import { listCustomers, Customer } from "../services/customerService";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [form, setForm] = useState({
    customer_id: "",
    amount: "",
    due_date: "",
    tax: "",
    discount: "",
    notes: "",
  });
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
      } catch (e) {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const total = useMemo(
    () => invoices.reduce((sum, item) => sum + (item.total || 0), 0),
    [invoices],
  );

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_id || !form.amount || !form.due_date) return;
    setLoading(true);
    try {
      const invoice = await createInvoice({
        customer_id: Number(form.customer_id),
        due_date: form.due_date,
        tax: form.tax ? Number(form.tax) : 0,
        discount: form.discount ? Number(form.discount) : 0,
        notes: form.notes,
        items: [
          {
            description: "Invoice Item",
            quantity: 1,
            unit_price: Number(form.amount),
          },
        ],
      });
      setInvoices((prev) => [invoice, ...prev]);
      setForm({
        customer_id: "",
        amount: "",
        due_date: "",
        tax: "",
        discount: "",
        notes: "",
      });
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
          Create Invoice
        </h2>
        <form
          onSubmit={handleCreateInvoice}
          className="grid grid-cols-1 md:grid-cols-5 gap-3"
        >
          <select
            value={form.customer_id}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, customer_id: e.target.value }))
            }
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="">Select customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            value={form.amount}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, amount: e.target.value }))
            }
            type="number"
            placeholder="Amount"
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
          <input
            value={form.due_date}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, due_date: e.target.value }))
            }
            type="date"
            placeholder="Due date"
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
          <input
            value={form.tax}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, tax: e.target.value }))
            }
            type="number"
            placeholder="Tax"
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            value={form.discount}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, discount: e.target.value }))
            }
            type="number"
            placeholder="Discount"
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            value={form.notes}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, notes: e.target.value }))
            }
            placeholder="Notes"
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 col-span-2"
          />
          <button
            type="submit"
            className="btn-primary w-fit"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            Invoices List
          </h2>
          <p className="text-sm text-slate-500">
            Total: ${total.toLocaleString()}
          </p>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-5 py-3 text-xs uppercase text-slate-500">
                Invoice #
              </th>
              <th className="text-left px-5 py-3 text-xs uppercase text-slate-500">
                Customer
              </th>
              <th className="text-left px-5 py-3 text-xs uppercase text-slate-500">
                Amount
              </th>
              <th className="text-left px-5 py-3 text-xs uppercase text-slate-500">
                Status
              </th>
              <th className="text-right px-5 py-3 text-xs uppercase text-slate-500">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-t border-slate-100">
                <td className="px-5 py-3 text-sm text-slate-700">
                  {invoice.invoice_number}
                </td>
                <td className="px-5 py-3 text-sm text-slate-700">
                  {customers.find((c) => c.id === invoice.customer_id)?.name ||
                    invoice.customer_id}
                </td>
                <td className="px-5 py-3 text-sm font-medium text-slate-800">
                  ${invoice.total?.toLocaleString()}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      invoice.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : invoice.status === "overdue"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => setSelected(invoice)}
                    className="text-sm text-primary-600 font-medium"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {selected && (
        <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-md font-semibold text-slate-800 mb-2">
            Invoice Details
          </h3>
          <p className="text-sm text-slate-600">
            Invoice #: {selected.invoice_number}
          </p>
          <p className="text-sm text-slate-600">
            Customer:{" "}
            {customers.find((c) => c.id === selected.customer_id)?.name ||
              selected.customer_id}
          </p>
          <p className="text-sm text-slate-600">
            Amount: ${selected.total?.toLocaleString()}
          </p>
          <p className="text-sm text-slate-600">Status: {selected.status}</p>
        </section>
      )}
    </div>
  );
}

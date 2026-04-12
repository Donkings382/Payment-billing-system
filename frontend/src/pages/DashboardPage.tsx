import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getDashboard, getPaymentRisk, PaymentRiskReport, InvoiceRisk } from "../services/insightService";

const summaryLinks = [
  {
    label: "Customers",
    description: "Create, update, and review customer records.",
    to: "/customers",
  },
  {
    label: "Invoices",
    description: "Create invoices and view invoice details.",
    to: "/invoices",
  },
  {
    label: "Payments",
    description: "Record payments and track invoice payment history.",
    to: "/payments",
  },
  {
    label: "Insights",
    description: "Review overdue invoices, top customers, and trends.",
    to: "/insights",
  },
];

const riskBadge: Record<InvoiceRisk["risk_level"], string> = {
  high: "bg-red-100 text-red-700 border border-red-200",
  medium: "bg-amber-100 text-amber-700 border border-amber-200",
  low: "bg-emerald-100 text-emerald-700 border border-emerald-200",
};

const riskLabel: Record<InvoiceRisk["risk_level"], string> = {
  high: "High Risk",
  medium: "Medium Risk",
  low: "Low Risk",
};

function RiskScoreBar({ score }: { score: number }) {
  const percent = Math.round(score * 100);
  const colour =
    score >= 0.7
      ? "bg-red-500"
      : score >= 0.4
        ? "bg-amber-400"
        : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${colour}`} style={{ width: `${percent}%` }} />
      </div>
      <span className="text-xs tabular-nums text-slate-600">{score.toFixed(2)}</span>
    </div>
  );
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [riskReport, setRiskReport] = useState<PaymentRiskReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [remindedIds, setRemindedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [dash, risk] = await Promise.all([getDashboard(), getPaymentRisk()]);
        setDashboard(dash);
        setRiskReport(risk);
      } catch (e) {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  function handleReminder(invoice: InvoiceRisk) {
    setRemindedIds((prev) => new Set(prev).add(invoice.invoice_id));
    toast.success(
      `Reminder sent to ${invoice.customer_name} for invoice ${invoice.invoice_number}`
    );
    setTimeout(() => {
      setRemindedIds((prev) => {
        const next = new Set(prev);
        next.delete(invoice.invoice_id);
        return next;
      });
    }, 2000);
  }

  const invoiceRisks = riskReport?.invoice_risks ?? [];

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Dashboard summary</h2>
          <p className="mt-2 text-sm text-slate-500">
            A simplified overview of the core workflow pages available in the billing system.
          </p>
        </div>

        <section className="mt-6 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-medium text-slate-500">Total Owed</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {dashboard ? `$${dashboard.total_owed?.toLocaleString()}` : "-"}
            </p>
            <p className="mt-3 text-xs font-medium text-slate-400">
              Outstanding balance across all unpaid invoices
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-medium text-slate-500">Unpaid Invoices</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {dashboard ? dashboard.unpaid_invoices_count : "-"}
            </p>
            <p className="mt-3 text-xs font-medium text-slate-400">
              Number of invoices not yet paid
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-medium text-slate-500">Recent Invoices</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {dashboard ? dashboard.recent_invoices.length : "-"}
            </p>
            <p className="mt-3 text-xs font-medium text-slate-400">
              Invoices issued recently
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900">Available pages</h3>
          <p className="mt-1 text-sm text-slate-500">
            Use these pages to work through the billing flow from customers to invoices, payments, summaries, and insights.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {summaryLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="rounded-xl border border-slate-200 px-4 py-4 text-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-[0_10px_24px_rgba(20,83,45,0.10)]"
              >
                <span className="block font-semibold text-slate-900">{link.label}</span>
                <span className="mt-1 block text-slate-500">{link.description}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Unpaid invoices with payment risk */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Unpaid Invoices — Payment Risk</h2>
            <p className="mt-1 text-sm text-slate-500">
              All unpaid invoices scored by likelihood of late payment. Higher score = higher risk.
              Send reminders to customers most likely to pay late.
            </p>
          </div>
          {riskReport && (
            <p className="shrink-0 text-xs text-slate-400">
              {invoiceRisks.length} invoice{invoiceRisks.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Risk legend */}
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
            High risk ≥ 0.70
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
            Medium risk 0.40–0.69
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Low risk &lt; 0.40
          </span>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Amount Due</th>
                <th className="px-4 py-3">Risk Score</th>
                <th className="px-4 py-3">Risk Level</th>
                <th className="px-4 py-3">Recommendation</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && invoiceRisks.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
                    No unpaid invoices found.
                  </td>
                </tr>
              )}
              {invoiceRisks.map((inv) => (
                <tr key={inv.invoice_id} className="text-sm text-slate-700 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{inv.invoice_number}</td>
                  <td className="px-4 py-3">{inv.customer_name}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {new Date(inv.due_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 tabular-nums">${inv.amount_due.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <RiskScoreBar score={inv.risk_score} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${riskBadge[inv.risk_level]}`}>
                      {riskLabel[inv.risk_level]}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs text-xs text-slate-500">
                    {inv.recommendation}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={remindedIds.has(inv.invoice_id)}
                      onClick={() => handleReminder(inv)}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {remindedIds.has(inv.invoice_id) ? "Reminded" : "Send Reminder"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

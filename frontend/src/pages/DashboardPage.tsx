import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDashboard } from "../services/insightService";

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

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      try {
        const data = await getDashboard();
        setDashboard(data);
      } catch (e) {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Dashboard summary</h2>
        <p className="mt-2 text-sm text-slate-500">
          A simplified overview of the core workflow pages available in the
          billing system.
        </p>
      </div>

      <section className="grid gap-5 md:grid-cols-3">
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

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900">
          Available pages
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Use these pages to work through the billing flow from customers to
          invoices, payments, summaries, and insights.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {summaryLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="rounded-xl border border-slate-200 px-4 py-4 text-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-[0_10px_24px_rgba(20,83,45,0.10)]"
            >
              <span className="block font-semibold text-slate-900">
                {link.label}
              </span>
              <span className="mt-1 block text-slate-500">
                {link.description}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

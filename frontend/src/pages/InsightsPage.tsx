import { useEffect, useState } from "react";
import {
  getLatePayers,
  getHighDebtCustomers,
  getFrequentCustomers,
  getPaymentTrends,
} from "../services/insightService";

export default function InsightsPage() {
  const [latePayers, setLatePayers] = useState([]);
  const [highDebt, setHighDebt] = useState([]);
  const [frequentCustomers, setFrequentCustomers] = useState([]);
  const [paymentTrends, setPaymentTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      setLoading(true);
      try {
        const [late, high, freq, trends] = await Promise.all([
          getLatePayers(),
          getHighDebtCustomers(),
          getFrequentCustomers(),
          getPaymentTrends(),
        ]);
        setLatePayers(late);
        setHighDebt(high);
        setFrequentCustomers(freq);
        setPaymentTrends(trends);
      } catch (e) {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Insights</h2>
        <p className="mt-2 text-sm text-slate-500">
          Advanced analytics and billing insights appear after the core workflow
          pages.
        </p>
      </section>

      {loading ? (
        <div className="text-center text-slate-500">Loading insights...</div>
      ) : (
        <>
          <section className="grid gap-5 md:grid-cols-3">
            <article className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Overdue invoices
              </p>
              <p className="mt-3 text-3xl font-bold text-slate-900">
                {latePayers.length}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Track unpaid invoices that need follow-up.
              </p>
            </article>
            <article className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Top customers
              </p>
              <p className="mt-3 text-3xl font-bold text-slate-900">
                {frequentCustomers.length}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Highlight your highest-value customer accounts.
              </p>
            </article>
            <article className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Payment trends
              </p>
              <p className="mt-3 text-3xl font-bold text-slate-900">
                {paymentTrends?.insight || "-"}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Review recent payment performance over time.
              </p>
            </article>
          </section>

          <section className="mt-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              High Debt Customers
            </h3>
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-5 py-3 text-xs uppercase text-slate-500">
                    Customer
                  </th>
                  <th className="text-left px-5 py-3 text-xs uppercase text-slate-500">
                    Total Balance
                  </th>
                  <th className="text-left px-5 py-3 text-xs uppercase text-slate-500">
                    Unpaid Invoices
                  </th>
                </tr>
              </thead>
              <tbody>
                {highDebt.map((c: any) => (
                  <tr key={c.customer_id} className="border-t border-slate-100">
                    <td className="px-5 py-3 text-sm text-slate-700">
                      {c.customer_name}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-800">
                      ${c.total_balance.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-700">
                      {c.unpaid_invoices_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="mt-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Late Payers
            </h3>
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-5 py-3 text-xs uppercase text-slate-500">
                    Customer
                  </th>
                  <th className="text-left px-5 py-3 text-xs uppercase text-slate-500">
                    Overdue Amount
                  </th>
                  <th className="text-left px-5 py-3 text-xs uppercase text-slate-500">
                    Days Overdue
                  </th>
                </tr>
              </thead>
              <tbody>
                {latePayers.map((c: any) => (
                  <tr key={c.customer_id} className="border-t border-slate-100">
                    <td className="px-5 py-3 text-sm text-slate-700">
                      {c.customer_name}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-800">
                      ${c.overdue_amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-700">
                      {c.days_overdue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}

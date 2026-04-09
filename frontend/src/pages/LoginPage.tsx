import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-[1.8rem] border border-slate-200 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
          thelaunchpad-pay&amp;bill
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Login</h1>
        <p className="mt-2 text-sm text-slate-500">
          This page should be the first step in the billing workflow so users
          authenticate before accessing customers, invoices, and payments.
        </p>

        <div className="mt-8 space-y-4">
          <input
            type="email"
            placeholder="business@example.com"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
          <button
            type="button"
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            Login
          </button>
        </div>

        <Link
          to="/customers"
          className="mt-6 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Continue to customer workflow →
        </Link>
      </div>
    </div>
  );
}

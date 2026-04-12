import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { register } from "../services/authService";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", organization: "" });
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        organization: form.organization || undefined,
      });
      toast.success("Account created! Please log in.");
      navigate("/login");
    } catch (err: any) {
      const message = err?.response?.data?.detail ?? "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-[1.8rem] border border-slate-200 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
          thelaunchpad-pay&amp;bill
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Create account</h1>
        <p className="mt-2 text-sm text-slate-500">
          Sign up to start managing your customers, invoices, and payments.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="email"
            name="email"
            placeholder="business@example.com"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
          <input
            type="text"
            name="organization"
            placeholder="Organization name (optional)"
            value={form.organization}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Log in →
          </Link>
        </p>
      </div>
    </div>
  );
}

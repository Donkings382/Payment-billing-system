import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { login, getMe } from "../services/authService";
import { AUTH_TOKEN_STORAGE_KEY, AUTH_USER_STORAGE_KEY } from "../services/api";

export default function LoginPage() {
	const navigate = useNavigate();
	const [form, setForm] = useState({ email: "", password: "" });
	const [loading, setLoading] = useState(false);

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		try {
			const { access_token } = await login({
				email: form.email,
				password: form.password,
			});
			localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, access_token);
			const user = await getMe();
			localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
			navigate("/dashboard");
		} catch (err: any) {
			const message =
				err?.response?.data?.detail ?? "Invalid email or password.";
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
				<h1 className="mt-3 text-3xl font-bold text-slate-900">Login</h1>
				<p className="mt-2 text-sm text-slate-500">
					This page should be the first step in the billing workflow so users
					authenticate before accessing customers, invoices, and payments.
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
						{loading ? "Logging in…" : "Login"}
					</button>
				</form>

				{/* <Link
          to="/customers"
          className="mt-6 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Continue to customer workflow →
        </Link> */}

				<p className="mt-4 text-sm text-slate-500">
					Don't have an account?{" "}
					<Link
						to="/register"
						className="font-semibold text-emerald-700 hover:text-emerald-800"
					>
						Create one →
					</Link>
				</p>
			</div>
		</div>
	);
}

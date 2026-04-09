import { NavLink } from "react-router-dom";
import {
  Login as LoginIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ReceiptLong as ReceiptIcon,
  Payments as PaymentsIcon,
  Insights as InsightsIcon,
} from "@mui/icons-material";

const mainItems = [
  {
    label: "Login",
    icon: <LoginIcon fontSize="small" />,
    path: "/login",
    status: "full",
  },
  {
    label: "Customers",
    icon: <PeopleIcon fontSize="small" />,
    path: "/customers",
    status: "full",
  },
  {
    label: "Invoices",
    icon: <ReceiptIcon fontSize="small" />,
    path: "/invoices",
    status: "partial",
  },
  {
    label: "Payments",
    icon: <PaymentsIcon fontSize="small" />,
    path: "/payments",
    status: "partial",
  },
  {
    label: "Dashboard",
    icon: <DashboardIcon fontSize="small" />,
    path: "/dashboard",
    status: "full",
  },
  {
    label: "Insights",
    icon: <InsightsIcon fontSize="small" />,
    path: "/insights",
    status: "full",
  },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = "w-64" }: SidebarProps) {
  return (
    <aside
      className={`${className} bg-white border-r border-slate-200 min-h-screen flex flex-col`}
    >
      {/* Logo */}
      <div className="h-16 px-6 border-b border-slate-200 flex items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
              <i className="text-white font-bold text-lg italic">LP</i>
            </div>
            <span className="text-slate-800 font-semibold text-lg">thelaunchpad-pay&bill</span>
          </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Menu
          </p>
          <ul className="space-y-1">
            {mainItems.map((item) => (
              <li key={item.label}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                      isActive
                        ? "bg-emerald-100 text-emerald-800 shadow-sm"
                        : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                    }`
                  }
                >
                  {item.icon}
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <span>{item.label}</span>
                    {item.status === "partial" && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                        Partial
                      </span>
                    )}
                  </div>
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
            <p className="font-semibold text-slate-700">Backend coverage</p>
            <p className="mt-1">Invoices: missing edit/delete endpoints.</p>
            <p className="mt-1">
              Payments: no general list-all payments endpoint yet.
            </p>
          </div>
        </div>
      </nav>

      {/* User section at bottom */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600">
            <span className="text-white font-medium">EC</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">
              Emeka chukwudi
            </p>
            <p className="text-xs text-slate-500 truncate">Emeka@gmail.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

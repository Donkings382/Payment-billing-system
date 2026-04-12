import { NavLink, useNavigate } from "react-router-dom";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ReceiptLong as ReceiptIcon,
  Payments as PaymentsIcon,
  Insights as InsightsIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { AUTH_TOKEN_STORAGE_KEY, AUTH_USER_STORAGE_KEY } from "../../services/api";

const mainItems = [
  {
    label: "Customers",
    icon: <PeopleIcon fontSize="small" />,
    path: "/customers",
  },
  {
    label: "Invoices",
    icon: <ReceiptIcon fontSize="small" />,
    path: "/invoices",
  },
  {
    label: "Payments",
    icon: <PaymentsIcon fontSize="small" />,
    path: "/payments",
  },
  {
    label: "Dashboard",
    icon: <DashboardIcon fontSize="small" />,
    path: "/dashboard",
  },
  {
    label: "Insights",
    icon: <InsightsIcon fontSize="small" />,
    path: "/insights",
  },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = "w-64" }: SidebarProps) {
  const navigate = useNavigate();

  function handleSignOut() {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_USER_STORAGE_KEY);
    navigate("/login");
  }

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
          <span className="text-slate-800 font-semibold text-lg">
            thelaunchpad-pay&bill
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
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
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-slate-200">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          <LogoutIcon fontSize="small" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

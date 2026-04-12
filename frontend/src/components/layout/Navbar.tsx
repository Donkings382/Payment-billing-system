import { useEffect, useState } from "react";
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { AUTH_USER_STORAGE_KEY } from "../../services/api";

interface AuthUser {
  email: string;
  organization?: string;
}

function getInitials(email: string): string {
  return email.slice(0, 2).toUpperCase();
}

interface NavbarProps {
  title: string;
  breadcrumb: string[];
  onAddClick?: () => void;
  addButtonText?: string;
  className?: string;
}

export default function Navbar({
  title,
  breadcrumb,
  onAddClick,
  addButtonText = "Add New",
  className = "h-16",
}: NavbarProps) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // ignore malformed data
      }
    }
  }, []);

  return (
    <header
      className={`bg-white border-b border-dashboard-border px-6 ${className} flex items-center justify-between`}
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {breadcrumb.length > 0 && (
          <nav className="flex items-center gap-2 mt-1 text-sm text-slate-500">
            {breadcrumb.map((item, index) => (
              <span key={index} className="flex items-center gap-2">
                {index > 0 && <span className="text-slate-400">›</span>}
                <span
                  className={
                    index === breadcrumb.length - 1
                      ? "text-primary-600 font-medium"
                      : ""
                  }
                >
                  {item}
                </span>
              </span>
            ))}
          </nav>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <SearchIcon className="w-5 h-5" />
        </button>

        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <NotificationsIcon className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {user && (
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 shrink-0">
              <span className="text-white font-medium">{getInitials(user.email)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {user.organization || "My Business"}
              </p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {onAddClick && (
          <button
            onClick={onAddClick}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg px-4 py-2 flex items-center gap-2 transition-colors"
          >
            <span>+</span>
            {addButtonText}
          </button>
        )}
      </div>
    </header>
  );
}

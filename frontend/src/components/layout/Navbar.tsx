import { Search as SearchIcon, Notifications as NotificationsIcon } from '@mui/icons-material';

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
  addButtonText = 'Add New',
  className = 'h-16'
}: NavbarProps) {
  return (
    <header className={`bg-white border-b border-dashboard-border px-6 ${className} flex items-center justify-between`}>
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {breadcrumb.length > 0 && (
          <nav className="flex items-center gap-2 mt-1 text-sm text-slate-500">
            {breadcrumb.map((item, index) => (
              <span key={index} className="flex items-center gap-2">
                {index > 0 && <span className="text-slate-400">›</span>}
                <span className={index === breadcrumb.length - 1 ? 'text-primary-600 font-medium' : ''}>
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

        {onAddClick && (
          <button onClick={onAddClick} className="btn-primary flex items-center gap-2">
            <span>+</span>
            {addButtonText}
          </button>
        )}
      </div>
    </header>
  );
}
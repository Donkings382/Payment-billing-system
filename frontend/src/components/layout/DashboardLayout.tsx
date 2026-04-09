import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout() {
  const { pathname } = useLocation();

  const pageConfig = (() => {
    if (pathname.startsWith("/login")) {
      return {
        title: "Authentication",
        breadcrumb: ["Workflow", "Login"],
        addButtonText: undefined,
      };
    }

    if (pathname.startsWith("/customers")) {
      return {
        title: "Customers",
        breadcrumb: ["Workflow", "Customers"],
        addButtonText: undefined,
      };
    }

    if (pathname.startsWith("/invoices")) {
      return {
        title: "Invoices",
        breadcrumb: ["Workflow", "Invoices"],
        addButtonText: "Create Invoice",
      };
    }

    if (pathname.startsWith("/payments")) {
      return {
        title: "Payments",
        breadcrumb: ["Workflow", "Payments"],
        addButtonText: "Record Payment",
      };
    }

    if (pathname.startsWith("/insights")) {
      return {
        title: "Insights",
        breadcrumb: ["Workflow", "Insights"],
        addButtonText: undefined,
      };
    }

    return {
      title: "Dashboard",
      breadcrumb: ["Workflow", "Dashboard"],
      addButtonText: undefined,
    };
  })();

  return (
    <div className="flex h-screen bg-dashboard-bg">
      <Sidebar className="w-64" />

      <div className="flex-1 flex flex-col">
        <Navbar
          title={pageConfig.title}
          breadcrumb={pageConfig.breadcrumb}
          onAddClick={
            pageConfig.addButtonText
              ? () => console.log(`${pageConfig.addButtonText} clicked`)
              : undefined
          }
          addButtonText={pageConfig.addButtonText}
          className="h-16"
        />

        <main className="flex-1 p-6 overflow-auto space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

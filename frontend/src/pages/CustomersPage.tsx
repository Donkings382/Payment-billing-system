import { useEffect, useMemo, useState } from "react";
import * as customerService from "../services/customerService";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

const emptyForm = { name: "", email: "", phone: "", address: "" };

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof emptyForm, string>>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.listCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return customers.filter(
      (customer) =>
        !query ||
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query),
    );
  }, [customers, searchTerm]);

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingId(customer.id);
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<keyof typeof emptyForm, string>> = {};
    const emailTrimmed = form.email.trim();
    const phoneTrimmed = form.phone.trim();
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!emailTrimmed) nextErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed))
      nextErrors.email = "Enter a valid email address.";
    if (phoneTrimmed && !/^[+()\-\d\s]{7,}$/.test(phoneTrimmed))
      nextErrors.phone = "Enter a valid phone number.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingId) {
        await customerService.updateCustomer(editingId, form);
        await loadCustomers();
      } else {
        await customerService.createCustomer(form);
        await loadCustomers();
      }
      closeModal();
    } catch (error) {
      console.error("Error saving customer:", error);
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Customers</h2>
          <p className="mt-1 text-sm text-slate-500">
            Add and manage customer contact records.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          Add Customer
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, email, or phone"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Customer list
          </h3>
          <span className="text-sm text-slate-500">
            {filteredCustomers.length} customers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Address</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="text-sm text-slate-700">
                  <td className="px-5 py-4 font-medium text-slate-900">
                    {customer.name}
                  </td>
                  <td className="px-5 py-4">{customer.email}</td>
                  <td className="px-5 py-4">{customer.phone}</td>
                  <td className="px-5 py-4">{customer.address}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => openEditModal(customer)}
                      className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm text-slate-500"
                  >
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
                {editingId ? "Edit Customer" : "Add Customer"}
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {editingId
                  ? "Update customer information"
                  : "Create a new customer"}
              </h3>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
                {errors.name && (
                  <p className="mt-2 text-xs text-rose-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email *
                </label>
                <input
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
                {errors.email && (
                  <p className="mt-2 text-xs text-rose-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Phone
                </label>
                <input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
                {errors.phone && (
                  <p className="mt-2 text-xs text-rose-500">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Address
                </label>
                <input
                  value={form.address}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, address: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

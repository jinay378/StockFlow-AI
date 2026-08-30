import { useEffect, useState } from "react";
import {
  getCustomers,
  deleteCustomer,
  type Customer,
} from "../services/customer.service";
import CustomerForm from "../components/forms/CustomerForm";
import EmptyState from "../components/common/EmptyState";
import { isStaff } from "../services/auth.service";
import { Users } from "lucide-react";

const CustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const fetchCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const filtered = customers.filter((customer) =>
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase()) ||
      customer.phone.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredCustomers(filtered);
  }, [search, customers]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this customer?")) return;

    try {
      await deleteCustomer(id);
      fetchCustomers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete customer.");
    }
  };

  const handleSuccess = () => {
    setShowForm(false);
    setSelectedCustomer(null);
    fetchCustomers();
  };

  return (
    <div className="space-y-8 p-2">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Customer Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your customer database, sales history, and contact profiles
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedCustomer(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition"
        >
          + Add Customer
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400">
            {filteredCustomers.length} registered customers
          </span>

          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-800 dark:text-white placeholder-slate-400 focus:border-emerald-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <tr>
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">Customer Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Phone</th>
                <th className="p-4 text-left">Address</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer, index) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="p-4 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      #{index + 1}
                    </td>

                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      {customer.name}
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {customer.email || "—"}
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {customer.phone || "—"}
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-400 text-xs">
                      {customer.address || "—"}
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowForm(true);
                          }}
                          className="px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 rounded-lg text-xs font-semibold transition"
                        >
                          Edit
                        </button>

                        {!isStaff() && (
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="px-3 py-1 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 rounded-lg text-xs font-semibold transition"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-4">
                    <EmptyState
                      icon={Users}
                      title={search ? "No matching customers found" : "No customers registered"}
                      description={
                        search
                          ? `No customers matched "${search}".`
                          : "Maintain a clean customer directory with phone, email, and billing address for sales orders."
                      }
                      actionText={search ? undefined : "Add Customer"}
                      onAction={
                        search
                          ? undefined
                          : () => {
                              setSelectedCustomer(null);
                              setShowForm(true);
                            }
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <CustomerForm
            customer={selectedCustomer}
            onSuccess={handleSuccess}
            onCancel={() => {
              setShowForm(false);
              setSelectedCustomer(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
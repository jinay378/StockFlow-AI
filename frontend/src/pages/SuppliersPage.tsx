import { useEffect, useState } from "react";
import SupplierForm from "../components/forms/SupplierForm";
import EmptyState from "../components/common/EmptyState";
import { Building2 } from "lucide-react";

import {
  getSuppliers,
  deleteSupplier,
} from "../services/supplier.service";

function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await getSuppliers();
      setSuppliers(response);
    } catch (error) {
      console.error(error);
      alert("Unable to fetch suppliers");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this supplier?"
    );

    if (!confirmDelete) return;

    try {
      await deleteSupplier(id);
      alert("Supplier deleted successfully!");
      fetchSuppliers();
    } catch (error) {
      console.error(error);
      alert("Unable to delete supplier.");
    }
  };

  const filteredSuppliers = suppliers.filter((supplier: any) => {
    return (
      supplier.name.toLowerCase().includes(search.toLowerCase()) ||
      supplier.email.toLowerCase().includes(search.toLowerCase()) ||
      supplier.phone.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-8 p-2">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Suppliers & Vendors
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage procurement partners, vendor contact records, and fulfillment details
          </p>
        </div>

        <button
          onClick={() => {
            setEditingSupplier(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition"
        >
          + Add Supplier
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400">
            {filteredSuppliers.length} suppliers registered
          </span>

          <input
            type="text"
            placeholder="Search suppliers..."
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
                <th className="p-4 text-left">Supplier Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Phone</th>
                <th className="p-4 text-left">Address</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((supplier: any, index: number) => (
                  <tr
                    key={supplier.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="p-4 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      #{index + 1}
                    </td>

                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      {supplier.name}
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {supplier.email || "—"}
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {supplier.phone || "—"}
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-400 text-xs">
                      {supplier.address || "—"}
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingSupplier(supplier);
                            setShowForm(true);
                          }}
                          className="px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 rounded-lg text-xs font-semibold transition"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(supplier.id)}
                          className="px-3 py-1 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 rounded-lg text-xs font-semibold transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-4">
                    <EmptyState
                      icon={Building2}
                      title={search ? "No matching suppliers found" : "No suppliers registered"}
                      description={
                        search
                          ? `No suppliers matched "${search}".`
                          : "Maintain a trusted vendor directory to create purchase orders and manage restocking."
                      }
                      actionText={search ? undefined : "Add Supplier"}
                      onAction={
                        search
                          ? undefined
                          : () => {
                              setEditingSupplier(null);
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

      {/* Supplier Form */}
      {showForm && (
        <SupplierForm
          supplier={editingSupplier}
          onClose={() => {
            setShowForm(false);
            setEditingSupplier(null);
          }}
          onSuccess={() => {
            fetchSuppliers();
            setShowForm(false);
            setEditingSupplier(null);
          }}
        />
      )}
    </div>
  );
}

export default SuppliersPage;
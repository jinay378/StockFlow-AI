import { useEffect, useState } from "react";
import CategoryForm from "../components/forms/CategoryForm";
import EmptyState from "../components/common/EmptyState";
import { Layers } from "lucide-react";
import { isStaff } from "../services/auth.service";
import {
  getCategories,
  deleteCategory,
} from "../services/category.service";

function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response);
    } catch (error) {
      console.error(error);
      alert("Unable to fetch categories");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (error) {
      console.error(error);
      alert("Unable to delete category");
    }
  };

  const filteredCategories = categories.filter((category: any) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 p-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Product Categories
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize catalog inventory items into structured product categories
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCategory(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition"
        >
          + Add Category
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400">
            {filteredCategories.length} categories found
          </span>

          <input
            type="text"
            placeholder="Search categories..."
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
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Description</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category: any, index: number) => (
                  <tr
                    key={category.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="p-4 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      #{index + 1}
                    </td>

                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      {category.name}
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {category.description || "—"}
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingCategory(category);
                            setShowForm(true);
                          }}
                          className="px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 rounded-lg text-xs font-semibold transition"
                        >
                          Edit
                        </button>

                        {!isStaff() && (
                          <button
                            onClick={() => handleDelete(category.id)}
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
                  <td colSpan={4} className="p-4">
                    <EmptyState
                      icon={Layers}
                      title={search ? "No matching categories found" : "No product categories"}
                      description={
                        search
                          ? `No categories matched "${search}".`
                          : "Create categories like Electronics, Clothing, or Groceries to organize catalog items."
                      }
                      actionText={search ? undefined : "Add Category"}
                      onAction={
                        search
                          ? undefined
                          : () => {
                              setEditingCategory(null);
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
        <CategoryForm
          category={editingCategory}
          onClose={() => {
            setShowForm(false);
            setEditingCategory(null);
          }}
          onSuccess={() => {
            fetchCategories();
            setShowForm(false);
            setEditingCategory(null);
          }}
        />
      )}
    </div>
  );
}

export default CategoriesPage;
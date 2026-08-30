import { useEffect, useState } from "react";
import {
  createCategory,
  updateCategory,
} from "../../services/category.service";

interface Props {
  category?: any;
  onClose: () => void;
  onSuccess: () => void;
}

function CategoryForm({
  category,
  onClose,
  onSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || "");
    }
  }, [category]);

  const handleSubmit = async () => {
    try {
      const payload = {
        name,
        description,
      };

      if (category) {
        await updateCategory(category.id, payload);
        alert("Category Updated Successfully");
      } else {
        await createCategory(payload);
        alert("Category Added Successfully");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Unable to save category");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-[450px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-7 shadow-2xl">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          {category ? "Edit Category" : "Add New Category"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Category Name
            </label>
            <input
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-800 dark:text-white placeholder-slate-400 focus:border-emerald-500"
              placeholder="e.g. Consumer Electronics"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Description (Optional)
            </label>
            <textarea
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-800 dark:text-white placeholder-slate-400 focus:border-emerald-500"
              placeholder="Provide a brief summary of what belongs in this category..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 px-5 py-2 text-xs font-semibold text-white shadow-sm transition"
          >
            {category ? "Update Category" : "Save Category"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CategoryForm;
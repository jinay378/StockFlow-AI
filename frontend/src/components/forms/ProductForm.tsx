import { useEffect, useState } from "react";
import {
  createProduct,
  updateProduct,
} from "../../services/product.service";
import { getCategories } from "../../services/category.service";

interface Props {
  product?: any;
  onClose: () => void;
  onSuccess: () => void;
}

interface CategoryOption {
  id: number;
  name: string;
}

function ProductForm({
  product,
  onClose,
  onSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [quantity, setQuantity] = useState<number | string>("");
  const [categoryId, setCategoryId] = useState<number | string>("");
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories()
      .then((cats) => {
        setCategories(cats);
        if (!product && cats.length > 0) {
          setCategoryId(cats[0].id);
        }
      })
      .catch((err) => console.error("Failed to load categories", err));
  }, []);

  useEffect(() => {
    if (product) {
      setName(product.name ?? "");
      setSku(product.sku ?? "");
      setPrice(product.price ?? 0);
      setQuantity(product.quantity ?? 0);
      setCategoryId(product.category_id ?? "");
    } else {
      setName("");
      setSku("");
      setPrice("");
      setQuantity("");
    }
  }, [product]);


  // =========================================================
  // SAVE / UPDATE PRODUCT
  // =========================================================

  const handleSubmit = async () => {

    if (!name.trim()) {
      alert("Product name is required.");
      return;
    }

    if (!sku.trim()) {
      alert("SKU is required.");
      return;
    }

    const numPrice = Number(price) || 0;
    const numQty = Number(quantity) || 0;

    if (numPrice < 0) {
      alert("Price cannot be negative.");
      return;
    }

    if (numQty < 0) {
      alert("Quantity cannot be negative.");
      return;
    }

    const payload = {
      name: name.trim(),
      sku: sku.trim(),
      price: numPrice,
      quantity: numQty,
      category_id: Number(categoryId),
    };


    try {

      setLoading(true);


      // -----------------------------------------------------
      // UPDATE
      // -----------------------------------------------------

      if (product) {

        console.log(
          "Updating product:",
          product.id,
          payload
        );

        const response = await updateProduct(
          product.id,
          payload
        );

        console.log(
          "Update response:",
          response
        );

        alert("Product Updated Successfully!");

      }

      // -----------------------------------------------------
      // CREATE
      // -----------------------------------------------------

      else {

        console.log(
          "Creating product:",
          payload
        );

        const response = await createProduct(
          payload
        );

        console.log(
          "Create response:",
          response
        );

        alert("Product Added Successfully!");

      }


      // Refresh products page
      onSuccess();

      // Close modal
      onClose();

    }

    catch (error: any) {

      console.error(
        "PRODUCT SAVE ERROR:",
        error
      );


      if (error.response) {

        console.error(
          "Status:",
          error.response.status
        );

        console.error(
          "Backend response:",
          error.response.data
        );


        alert(
          error.response.data?.detail ||
          error.response.data?.message ||
          `Request failed with status ${error.response.status}`
        );

      }

      else if (error.request) {

        alert(
          "Backend server is not responding."
        );

      }

      else {

        alert(
          error.message ||
          "Unable to save product."
        );

      }

    }

    finally {

      setLoading(false);

    }

  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-[460px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-7 shadow-2xl">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          {product ? "Edit Product" : "Add New Product"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Product Name
            </label>
            <input
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-800 dark:text-white placeholder-slate-400 focus:border-emerald-500"
              placeholder="e.g. Wireless Noise-Cancelling Headphones"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              SKU Code
            </label>
            <input
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-800 dark:text-white placeholder-slate-400 focus:border-emerald-500 font-mono"
              placeholder="e.g. ELEC-001"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Selling Price (₹)
              </label>
              <input
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-800 dark:text-white placeholder-slate-400 focus:border-emerald-500"
                type="number"
                min="0"
                placeholder="2499"
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Opening Stock
              </label>
              <input
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-800 dark:text-white placeholder-slate-400 focus:border-emerald-500"
                type="number"
                min="0"
                placeholder="50"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : "")}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Product Category
            </label>
            <select
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-800 dark:text-white focus:border-emerald-500"
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              required
            >
              <option value="" disabled>Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="dark:bg-slate-900">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 px-5 py-2 text-xs font-semibold text-white shadow-sm transition disabled:opacity-50"
          >
            {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductForm;
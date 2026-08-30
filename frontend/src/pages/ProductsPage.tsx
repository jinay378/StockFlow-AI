import { useEffect, useState } from "react";
import ProductForm from "../components/forms/ProductForm";
import EmptyState from "../components/common/EmptyState";
import { Package } from "lucide-react";
import { useToast } from "../contexts/ToastContext";
import { isStaff } from "../services/auth.service";
import {
  getProducts,
  deleteProduct,
} from "../services/product.service";

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
}

function ProductsPage() {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await getProducts();

      console.log("Products API response:", response);

      setProducts(Array.isArray(response) ? response : []);
    } catch (error: any) {
      console.error("Failed to load products:", error);

      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);

        alert(
          `Failed to load products.\nStatus: ${error.response.status}`
        );
      } else if (error.request) {
        console.error("No response received:", error.request);

        alert(
          "Backend is not responding. Please make sure FastAPI is running."
        );
      } else {
        console.error("Error:", error.message);

        alert(error.message || "Failed to load products.");
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD PRODUCTS WHEN PAGE OPENS
  // =========================================================

  useEffect(() => {
    fetchProducts();
  }, []);

  // =========================================================
  // DELETE PRODUCT
  // =========================================================

  const handleDelete = async (id: number) => {
    const product = products.find((item) => item.id === id);

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${product?.name ?? "this product"}"?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeletingId(id);

      await deleteProduct(id);

      // Immediately remove from UI
      setProducts((currentProducts) =>
        currentProducts.filter((item) => item.id !== id)
      );

      toast.success("Product deleted successfully!");
    } catch (error: any) {
      console.error("Delete product error:", error);
      toast.error("Unable to delete product.");

      // Refresh in case backend changed something
      await fetchProducts();
    } finally {
      setDeletingId(null);
    }
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const searchText = search.trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    return (
      product.name?.toLowerCase().includes(searchText) ||
      product.sku?.toLowerCase().includes(searchText)
    );
  });

  // =========================================================
  // OPEN ADD FORM
  // =========================================================

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  // =========================================================
  // OPEN EDIT FORM
  // =========================================================

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  // =========================================================
  // CLOSE FORM
  // =========================================================

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  // =========================================================
  // FORM SUCCESS
  // =========================================================

  const handleFormSuccess = async () => {
    await fetchProducts();

    setShowForm(false);
    setEditingProduct(null);
  };

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="space-y-8 p-2">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Catalog Products
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your inventory items, pricing, SKUs, and stock quantities
          </p>
        </div>

        <button
          onClick={handleAddProduct}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition"
        >
          + Add Product
        </button>
      </div>

      {/* SEARCH + TABLE CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400">
              {filteredProducts.length} of {products.length} products
            </span>

            <button
              onClick={fetchProducts}
              disabled={loading}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-800 dark:text-white placeholder-slate-400 focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <tr>
                <th className="p-4 text-left">SKU</th>
                <th className="p-4 text-left">Product Name</th>
                <th className="p-4 text-right">Price</th>
                <th className="p-4 text-center">Stock Level</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500 mb-2" />
                    <p className="text-sm">Loading products...</p>
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="p-4 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {product.sku || `#${product.id}`}
                    </td>

                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      {product.name}
                    </td>

                    <td className="p-4 text-right font-bold text-slate-900 dark:text-white">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          product.quantity <= 5
                            ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50"
                            : product.quantity <= 15
                            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50"
                            : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50"
                        }`}
                      >
                        {product.quantity} units
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 rounded-lg text-xs font-semibold transition"
                        >
                          Edit
                        </button>

                        {!isStaff() && (
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                            className="px-3 py-1 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                          >
                            {deletingId === product.id ? "..." : "Delete"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-4">
                    <EmptyState
                      icon={Package}
                      title={search ? "No matching products found" : "No products in your catalog"}
                      description={
                        search
                          ? `No items matched "${search}". Try adjusting your search query.`
                          : "Start adding products to manage inventory stock, set reorder points, and create sales orders."
                      }
                      actionText={search ? undefined : "Add First Product"}
                      onAction={search ? undefined : handleAddProduct}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRODUCT FORM MODAL */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}

export default ProductsPage;
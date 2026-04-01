import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Product, Category, Subcategory, Size } from "../../types";
import { HiTrash, HiPencil, HiPlus, HiX } from "react-icons/hi";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  category_id: string;
  subcategory_id: string;
  is_featured: boolean;
  is_active: boolean;
  selectedSizes: string[];
}

const EMPTY_FORM: ProductForm = {
  name: "",
  description: "",
  price: "",
  category_id: "",
  subcategory_id: "",
  is_featured: false,
  is_active: true,
  selectedSizes: [],
};

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    const [{ data: prod }, { data: cats }, { data: subs }, { data: sz }] =
      await Promise.all([
        supabase
          .from("products")
          .select(`*, categories(*), subcategories(*), product_sizes(sizes(*))`)
          .order("created_at", { ascending: false }),
        supabase.from("categories").select("*").order("name"),
        supabase.from("subcategories").select("*").order("name"),
        supabase.from("sizes").select("*").order("sort_order"),
      ]);

    setProducts(prod ?? []);
    setCategories(cats ?? []);
    setSubcategories(subs ?? []);
    setSizes(sz ?? []);
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchAll(); }, []);

  const filteredSubs = subcategories.filter(
    (s) => s.category_id === form.category_id
  );

  const openEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description ?? "",
      price: String(product.price),
      category_id: product.category_id ?? "",
      subcategory_id: product.subcategory_id ?? "",
      is_featured: product.is_featured,
      is_active: product.is_active,
      selectedSizes:
        product.product_sizes?.map((ps) => ps.sizes?.id).filter(Boolean) as string[] ?? [],
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return alert("Name and price are required.");
    setSaving(true);

    let image_url: string | undefined;

    // Upload image if new file selected
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("products")
        .upload(path, imageFile, { upsert: true });

      if (uploadErr) { alert(uploadErr.message); setSaving(false); return; }
      const { data: urlData } = supabase.storage.from("products").getPublicUrl(path);
      image_url = urlData.publicUrl;
    }

    const payload = {
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      category_id: form.category_id || null,
      subcategory_id: form.subcategory_id || null,
      is_featured: form.is_featured,
      is_active: form.is_active,
      ...(image_url ? { image_url } : {}),
    };

    let productId = editingId;

    if (editingId) {
      await supabase.from("products").update(payload).eq("id", editingId);
    } else {
      const { data } = await supabase.from("products").insert(payload).select().single();
      productId = data?.id;
    }

    // Update sizes
    if (productId) {
      await supabase.from("product_sizes").delete().eq("product_id", productId);
      if (form.selectedSizes.length > 0) {
        await supabase.from("product_sizes").insert(
          form.selectedSizes.map((size_id) => ({ product_id: productId, size_id }))
        );
      }
    }

    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    fetchAll();
  };

  const handleDelete = async (product: Product) => {
    if (!confirm("Delete this product?")) return;
    if (product.image_url) {
      const filePath = product.image_url.split("/products/")[1];
      if (filePath) await supabase.storage.from("products").remove([filePath]);
    }
    await supabase.from("product_sizes").delete().eq("product_id", product.id);
    await supabase.from("products").delete().eq("id", product.id);
    fetchAll();
  };

  const toggleSize = (sizeId: string) => {
    setForm((f) => ({
      ...f,
      selectedSizes: f.selectedSizes.includes(sizeId)
        ? f.selectedSizes.filter((s) => s !== sizeId)
        : [...f.selectedSizes, sizeId],
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">Products</h1>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}
          className="btn-primary flex items-center gap-2"
        >
          <HiPlus size={16} /> Add Product
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40">
          <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-bold text-primary">
                {editingId ? "Edit Product" : "Add Product"}
              </p>
              <button onClick={() => setShowForm(false)}>
                <HiX size={20} className="text-muted" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="label">Name *</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nike Air Max" />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Product description..." />
              </div>
              <div>
                <label className="label">Price (Rs.) *</label>
                <input className="input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="2500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value, subcategory_id: "" })}>
                    <option value="">None</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Subcategory</label>
                  <select className="input" value={form.subcategory_id} onChange={(e) => setForm({ ...form, subcategory_id: e.target.value })} disabled={!form.category_id}>
                    <option value="">None</option>
                    {filteredSubs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="label">Available Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => toggleSize(size.id)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        form.selectedSizes.includes(size.id)
                          ? "bg-primary text-white border-primary"
                          : "border-gray-200 text-muted"
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image */}
              <div>
                <label className="label">Product Image</label>
                <input type="file" accept="image/*" className="input" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
              </div>

              {/* Toggles */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-primary cursor-pointer">
                  <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="rounded" />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm text-primary cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
                  Active
                </label>
              </div>

              <div className="flex gap-3 mt-2">
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                  {saving ? "Saving..." : "Save Product"}
                </button>
                <button onClick={() => setShowForm(false)} className="btn-outline flex-1">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products list */}
      {loading ? (
        <p className="text-muted text-sm">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-muted text-sm">No products yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex items-center gap-3">
              <img
                src={product.image_url ?? "https://placehold.co/80x80?text=No+Image"}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary truncate">{product.name}</p>
                <p className="text-xs text-muted">Rs. {Number(product.price).toLocaleString()}</p>
                <div className="flex gap-1 mt-1">
                  {product.is_featured && (
                    <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">Featured</span>
                  )}
                  {!product.is_active && (
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">Inactive</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEdit(product)} className="p-2 text-primary hover:bg-gray-50 rounded-lg">
                  <HiPencil size={16} />
                </button>
                <button onClick={() => handleDelete(product)} className="p-2 text-accent hover:bg-red-50 rounded-lg">
                  <HiTrash size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
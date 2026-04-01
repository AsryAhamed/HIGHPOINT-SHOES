import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Size, Subcategory, Category } from "../../types";
import { HiTrash, HiPlus } from "react-icons/hi";

const SizesSubcategories: React.FC = () => {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [newSize, setNewSize] = useState("");
  const [newSubName, setNewSubName] = useState("");
  const [newSubCat, setNewSubCat] = useState("");

  const fetchAll = async () => {
    const [{ data: sz }, { data: sub }, { data: cats }] = await Promise.all([
      supabase.from("sizes").select("*").order("sort_order"),
      supabase.from("subcategories").select("*").order("name"),
      supabase.from("categories").select("*").order("name"),
    ]);
    setSizes(sz ?? []);
    setSubcategories(sub ?? []);
    setCategories(cats ?? []);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchAll(); }, []);

  const addSize = async () => {
    if (!newSize.trim()) return;
    await supabase.from("sizes").insert({ label: newSize.trim(), sort_order: sizes.length });
    setNewSize("");
    fetchAll();
  };

  const deleteSize = async (id: string) => {
    if (!confirm("Delete this size?")) return;
    await supabase.from("sizes").delete().eq("id", id);
    fetchAll();
  };

  const addSubcategory = async () => {
    if (!newSubName.trim() || !newSubCat) return;
    const slug = newSubName.toLowerCase().replace(/\s+/g, "-");
    await supabase.from("subcategories").insert({
      name: newSubName.trim(),
      slug,
      category_id: newSubCat,
    });
    setNewSubName("");
    fetchAll();
  };

  const deleteSubcategory = async (id: string) => {
    if (!confirm("Delete this subcategory?")) return;
    await supabase.from("subcategories").delete().eq("id", id);
    fetchAll();
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="section-title">Sizes & Subcategories</h1>

      {/* Sizes */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-primary mb-4">Sizes</h2>

        <div className="flex gap-2 mb-4">
          <input
            className="input flex-1"
            placeholder="e.g. UK 7"
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSize()}
          />
          <button onClick={addSize} className="btn-primary flex items-center gap-1">
            <HiPlus size={16} /> Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <div
              key={size.id}
              className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2.5 py-1"
            >
              <span className="text-sm text-primary">{size.label}</span>
              <button
                onClick={() => deleteSize(size.id)}
                className="text-muted hover:text-accent transition-colors"
              >
                <HiTrash size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Subcategories */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-primary mb-4">Subcategories</h2>

        <div className="flex flex-col gap-3 mb-4">
          <div>
            <label className="label">Category</label>
            <select
              className="input"
              value={newSubCat}
              onChange={(e) => setNewSubCat(e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="e.g. Loafers"
              value={newSubName}
              onChange={(e) => setNewSubName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSubcategory()}
            />
            <button onClick={addSubcategory} className="btn-primary flex items-center gap-1">
              <HiPlus size={16} /> Add
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {categories.map((cat) => {
            const subs = subcategories.filter((s) => s.category_id === cat.id);
            if (!subs.length) return null;
            return (
              <div key={cat.id}>
                <p className="text-xs font-medium text-muted mb-1.5">{cat.name}</p>
                <div className="flex flex-wrap gap-2">
                  {subs.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2.5 py-1"
                    >
                      <span className="text-sm text-primary">{sub.name}</span>
                      <button
                        onClick={() => deleteSubcategory(sub.id)}
                        className="text-muted hover:text-accent transition-colors"
                      >
                        <HiTrash size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SizesSubcategories;
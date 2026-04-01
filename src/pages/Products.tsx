import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Category, Subcategory, Size, Product } from "../types";
import ProductCard from "../components/ProductCard";

const ProductsPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") ?? ""
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");

  // Fetch filter data
  useEffect(() => {
    const fetchFilters = async () => {
      const [{ data: cats }, { data: subs }, { data: sz }] = await Promise.all([
        supabase.from("categories").select("*").order("name"),
        supabase.from("subcategories").select("*").order("name"),
        supabase.from("sizes").select("*").order("sort_order"),
      ]);
      setCategories(cats ?? []);
      setSubcategories(subs ?? []);
      setSizes(sz ?? []);
    };
    fetchFilters();
  }, []);

  // Fetch products whenever filters change
  const fetchProducts = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from("products")
      .select(`*, categories(*), subcategories(*), product_sizes(sizes(*))`)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (selectedCategory) {
      const cat = categories.find(
        (c) => c.slug === selectedCategory || c.name.toLowerCase() === selectedCategory
      );
      if (cat) query = query.eq("category_id", cat.id);
    }

    if (selectedSubcategory) {
      const sub = subcategories.find((s) => s.id === selectedSubcategory);
      if (sub) query = query.eq("subcategory_id", sub.id);
    }

    if (selectedSize) {
      // Filter by size via a subquery approach
      const { data: ps } = await supabase
        .from("product_sizes")
        .select("product_id")
        .eq("size_id", selectedSize);
      const productIds = (ps ?? []).map((r) => r.product_id);
      if (productIds.length > 0) {
        query = query.in("id", productIds);
      } else {
        setProducts([]);
        setLoading(false);
        return;
      }
    }

    const { data } = await query;
    setProducts(data ?? []);
    setLoading(false);
  }, [selectedCategory, selectedSubcategory, selectedSize, categories, subcategories]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (categories.length > 0) fetchProducts();
  }, [fetchProducts, categories]);

  // Filtered subcategories for selected category
  const filteredSubcategories = subcategories.filter((s) => {
    const cat = categories.find(
      (c) => c.slug === selectedCategory || c.name.toLowerCase() === selectedCategory
    );
    return cat ? s.category_id === cat.id : true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="section-title mb-4">All Products</h1>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
        {/* Category */}
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedSubcategory("");
          }}
          className="input flex-shrink-0 w-auto text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Subcategory */}
        {selectedCategory && filteredSubcategories.length > 0 && (
          <select
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            className="input flex-shrink-0 w-auto text-sm"
          >
            <option value="">All Types</option>
            {filteredSubcategories.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}

        {/* Size */}
        <select
          value={selectedSize}
          onChange={(e) => setSelectedSize(e.target.value)}
          className="input flex-shrink-0 w-auto text-sm"
        >
          <option value="">All Sizes</option>
          {sizes.map((sz) => (
            <option key={sz.id} value={sz.id}>
              {sz.label}
            </option>
          ))}
        </select>

        {/* Reset */}
        {(selectedCategory || selectedSubcategory || selectedSize) && (
          <button
            onClick={() => {
              setSelectedCategory("");
              setSelectedSubcategory("");
              setSelectedSize("");
            }}
            className="btn-outline flex-shrink-0 text-xs"
          >
            Reset
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-muted text-sm">
          No products found. Try different filters.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
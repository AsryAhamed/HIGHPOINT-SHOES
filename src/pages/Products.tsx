import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Category, Subcategory, Size, Product } from "../types";
import ProductCard from "../components/ProductCard";
import { HiSearch, HiX } from "react-icons/hi";

// ── Sort options ───────────────────────────────────────────────────────────
type SortOption = "newest" | "price_asc" | "price_desc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest",     label: "Newest First" },
  { value: "price_asc",  label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories]       = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [sizes, setSizes]                 = useState<Size[]>([]);
  const [products, setProducts]           = useState<Product[]>([]);
  const [loading, setLoading]             = useState(true);

  const [selectedCategory, setSelectedCategory]       = useState<string>(searchParams.get("category") ?? "");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [selectedSize, setSelectedSize]               = useState<string>("");
  const [searchQuery, setSearchQuery]                 = useState<string>(searchParams.get("search") ?? "");

  // ── NEW: sort state ────────────────────────────────────────────────────
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Sync search param from URL
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchQuery(searchParams.get("search") ?? "");
  }, [searchParams]);

  // Fetch filter data once
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

  // Fetch products whenever any filter or sort changes
  const fetchProducts = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from("products")
      .select(`*, categories(*), subcategories(*), product_sizes(sizes(*))`)
      .eq("is_active", true);

    // ── NEW: apply sort order ──────────────────────────────────────────
    if (sortBy === "price_asc") {
      query = query.order("price", { ascending: true });
    } else if (sortBy === "price_desc") {
      query = query.order("price", { ascending: false });
    } else {
      // newest first (default)
      query = query.order("created_at", { ascending: false });
    }

    // Search filter
    if (searchQuery.trim()) {
      query = query.or(
        `name.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%`
      );
    }

    // Category filter
    if (selectedCategory) {
      const cat = categories.find(
        (c) => c.slug === selectedCategory || c.name.toLowerCase() === selectedCategory
      );
      if (cat) query = query.eq("category_id", cat.id);
    }

    // Subcategory filter
    if (selectedSubcategory) {
      const sub = subcategories.find((s) => s.id === selectedSubcategory);
      if (sub) query = query.eq("subcategory_id", sub.id);
    }

    // Size filter
    if (selectedSize) {
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
  }, [
    sortBy,               // ── NEW dependency
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    selectedSize,
    categories,
    subcategories,
  ]);

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

  const hasFilters = selectedCategory || selectedSubcategory || selectedSize || searchQuery;

  const resetAll = () => {
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedSize("");
    setSearchQuery("");
    setSortBy("newest");   // ── NEW: reset sort too
    setSearchParams({});
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">

      {/* Page title */}
      <div className="mb-4">
        <h1 className="section-title">
          {searchQuery ? `Results for "${searchQuery}"` : "All Products"}
        </h1>
        {!loading && products.length > 0 && (
          <p className="text-xs text-muted mt-0.5">
            {products.length} product{products.length !== 1 ? "s" : ""} found
          </p>
        )}
      </div>

      {/* Inline search bar */}
      <div className="relative mb-4">
        <HiSearch
          size={17}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search products..."
          className="input pl-9 pr-9 w-full"
        />
        {searchQuery && (
          <button
            onClick={() => handleSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
          >
            <HiX size={16} />
          </button>
        )}
      </div>

      {/* ── Filters + Sort row ─────────────────────────────────────────────── */}
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
            <option key={c.id} value={c.slug}>{c.name}</option>
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
              <option key={s.id} value={s.id}>{s.name}</option>
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
            <option key={sz.id} value={sz.id}>{sz.label}</option>
          ))}
        </select>

        {/* ── NEW: Sort selector ──────────────────────────────────────── */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="input flex-shrink-0 w-auto text-sm ml-auto"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Reset */}
        {(hasFilters || sortBy !== "newest") && (
          <button
            onClick={resetAll}
            className="btn-outline flex-shrink-0 text-xs flex items-center gap-1"
          >
            <HiX size={12} /> Reset
          </button>
        )}
      </div>

      {/* Active search tag */}
      {searchQuery && !loading && (
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-accent/10 text-accent text-xs font-medium
                           px-3 py-1 rounded-full flex items-center gap-1.5">
            <HiSearch size={11} />
            {searchQuery}
            <button onClick={() => handleSearchChange("")} className="ml-1 hover:text-primary">
              <HiX size={11} />
            </button>
          </span>
          <span className="text-xs text-muted">
            {products.length} result{products.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* ── NEW: Active sort indicator (only when not default) ───────────── */}
      {sortBy !== "newest" && !loading && (
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-primary/10 text-primary text-xs font-medium
                           px-3 py-1 rounded-full flex items-center gap-1.5">
            {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
            <button
              onClick={() => setSortBy("newest")}
              className="ml-1 hover:text-accent"
            >
              <HiX size={11} />
            </button>
          </span>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden">
              <div className="aspect-square bg-gray-100 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
            <HiSearch size={26} className="text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-primary">
            {searchQuery ? `No products found for "${searchQuery}"` : "No products found"}
          </p>
          <p className="text-xs text-muted">
            Try different keywords or adjust your filters.
          </p>
          {(hasFilters || sortBy !== "newest") && (
            <button onClick={resetAll} className="btn-primary text-xs px-5 py-2 mt-1">
              Clear All Filters
            </button>
          )}
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
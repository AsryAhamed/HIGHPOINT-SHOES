import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { HiSearch, HiX, HiArrowRight, HiOutlineLightningBolt } from "react-icons/hi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchProduct {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  is_featured: boolean;
  categories?: { name: string }[] | null;
  subcategories?: { name: string }[] | null;
}

const SearchOverlay: React.FC<Props> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("");
      setResults([]);
      setShowResults(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const searchProducts = useCallback(async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    setShowResults(true);

    const { data } = await supabase
      .from("products")
      .select(`
        id, name, price, image_url, is_featured,
        categories(name),
        subcategories(name)
      `)
      .eq("is_active", true)
      .or(`name.ilike.%${term}%,description.ilike.%${term}%`)
      .order("is_featured", { ascending: false })
      .limit(8);

    setResults((data as SearchProduct[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchProducts(query), 300);
    return () => clearTimeout(timer);
  }, [query, searchProducts]);

  const handleSelectProduct = (product: SearchProduct) => {
    onClose();
    navigate(`/products/${product.id}`);
  };

  const handleViewAll = () => {
    if (!query.trim()) return;
    onClose();
    navigate(`/products?search=${encodeURIComponent(query.trim())}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col transition-all duration-300">
      {/* Backdrop */}
      <div 
        className="hidden md:block absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose} 
      />

      {/* Main Panel */}
      <div className="relative bg-white w-full shadow-2xl flex flex-col h-full md:h-auto md:max-h-[90vh] animate-in slide-in-from-top duration-300">
        
        {/* Search Bar Header */}
        <div className="border-b border-gray-100 shrink-0">
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between gap-3 py-4 md:py-6">
            
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <HiSearch size={22} className="text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleViewAll()}
                placeholder="Search shoes, brands..."
                className="flex-1 text-lg md:text-2xl outline-none bg-transparent font-light placeholder:text-gray-300 min-w-0"
              />
              
              {query && (
                <button 
                  onClick={() => { setQuery(""); setResults([]); setShowResults(false); }}
                  className="p-1 hover:bg-gray-100 rounded-full shrink-0"
                >
                  <HiX size={20} className="text-gray-500" />
                </button>
              )}
            </div>
            
            <button 
              onClick={onClose}
              className="shrink-0 text-sm font-bold uppercase tracking-widest text-gray-900 hover:text-red-600 ml-2 whitespace-nowrap"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto bg-gray-50/30 flex-1">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
            
            {loading && (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
              </div>
            )}

            {/* Quick Search Suggestions */}
            {!query && !loading && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                  <HiOutlineLightningBolt /> Quick Search
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["Running", "Basketball", "Jordan", "New Arrivals"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm hover:border-black transition-all"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results Section */}
            {!loading && showResults && (
              <div className="animate-in fade-in duration-300">
                <div className="flex justify-between items-end mb-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Product Results ({results.length})
                  </h4>
                  {results.length > 0 && (
                    <button 
                      onClick={handleViewAll}
                      className="text-sm font-semibold text-black hover:underline flex items-center gap-1"
                    >
                      View All <HiArrowRight size={14} />
                    </button>
                  )}
                </div>

                {results.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-gray-500">No products found for "{query}"</p>
                  </div>
                ) : (
                  /* RESPONSIVE LAYOUT: 
                     Mobile: flex flex-col (Vertical List)
                     PC: md:grid md:grid-cols-4 (Grid)
                  */
                  <div className="flex flex-col md:grid md:grid-cols-4 gap-4 md:gap-6 pb-10">
                    {results.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleSelectProduct(product)}
                        /* RESPONSIVE CARD:
                           Mobile: flex-row (Image left, text right)
                           PC: md:flex-col (Stacked)
                        */
                        className="group text-left bg-white p-3 rounded-xl border border-transparent hover:border-gray-100 hover:shadow-lg transition-all flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-0"
                      >
                        {/* Image Container */}
                        <div className="w-20 h-20 md:w-full md:aspect-[4/5] overflow-hidden rounded-lg bg-gray-100 md:mb-4 shrink-0">
                          <img
                            src={product.image_url ?? "https://placehold.co/400x500?text=No+Image"}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="min-w-0 flex-1 px-1">
                          <p className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">
                            {product.categories?.[0]?.name || "Footwear"}
                          </p>
                          <h3 className="font-medium text-gray-900 truncate md:whitespace-normal md:line-clamp-1">
                            <HighlightMatch text={product.name} query={query} />
                          </h3>
                          <p className="mt-1 font-bold text-lg text-black">
                            Rs. {Number(product.price).toLocaleString()}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const HighlightMatch: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-100 text-black px-0.5 rounded">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

export default SearchOverlay;
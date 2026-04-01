import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Product, Size } from "../types";
import { useCart } from "../context/CartContext";
import { FaWhatsapp } from "react-icons/fa";
import {
  HiArrowLeft,
  HiShoppingCart,
  HiCheck,
  HiTag,
} from "react-icons/hi";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const wa = import.meta.env.VITE_WHATSAPP_NUMBER;

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase
        .from("products")
        .select(`
          *,
          categories(*),
          subcategories(*),
          product_sizes(sizes(*))
        `)
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (!data) {
        navigate("/products");
        return;
      }

      setProduct(data);

      // Auto-select first available size
      const sizes = data.product_sizes
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ?.map((ps: any) => ps.sizes)
        .filter(Boolean);
      if (sizes?.length > 0) {
        setSelectedSize(sizes[0]);
      }

      setLoading(false);
    };

    if (id) fetchProduct();
  }, [id, navigate]);

  const sizes: Size[] =
    product?.product_sizes?.map((ps) => ps.sizes).filter(Boolean) ?? [];

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize && sizes.length > 0) {
      alert("Please select a size.");
      return;
    }
    addToCart(product, selectedSize!, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleWhatsAppOrder = () => {
    if (!product) return;
    if (!selectedSize && sizes.length > 0) {
      alert("Please select a size.");
      return;
    }
    const msg = encodeURIComponent(
      `Hi! I'd like to order:\n\n` +
        `👟 *Product:* ${product.name}\n` +
        `📏 *Size:* ${selectedSize?.label ?? "N/A"}\n` +
        `🔢 *Quantity:* ${quantity}\n` +
        `💰 *Price:* Rs. ${(product.price * quantity).toLocaleString()}\n\n` +
        `Please confirm availability. Thank you!`
    );
    window.open(`https://wa.me/${wa}?text=${msg}`, "_blank");
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="md:grid md:grid-cols-2 md:gap-10">
          <div className="aspect-square bg-gray-100 rounded-2xl animate-pulse mb-4 md:mb-0" />
          <div className="space-y-4 mt-2">
            <div className="h-6 bg-gray-100 rounded animate-pulse w-3/4" />
            <div className="h-8 bg-gray-100 rounded animate-pulse w-1/3" />
            <div className="flex gap-2 flex-wrap mt-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-16 h-11 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
            <div className="h-12 bg-gray-100 rounded-xl animate-pulse mt-4" />
            <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    // No pb-32 — no fixed bottom bar anymore
    <div className="max-w-4xl mx-auto px-4 py-4 pb-10">

      {/* ── Back button ──────────────────────────────────────────────────── */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-primary 
                   transition-colors mb-4"
      >
        <HiArrowLeft size={18} />
        Back
      </button>

      {/* ── Two column on desktop, single on mobile ───────────────────────── */}
      <div className="md:grid md:grid-cols-2 md:gap-10">

        {/* ── LEFT: Product Image ───────────────────────────────────────── */}
        <div className="mb-5 md:mb-0">
          <div className="w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden 
                          border border-gray-100 shadow-sm">
            <img
              src={
                product.image_url ??
                "https://placehold.co/600x600?text=No+Image"
              }
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* ── RIGHT: Product Info ───────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Category breadcrumb */}
          {(product.categories || product.subcategories) && (
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <HiTag size={12} />
              <span>{product.categories?.name}</span>
              {product.subcategories && (
                <>
                  <span>›</span>
                  <span>{product.subcategories.name}</span>
                </>
              )}
            </div>
          )}

          {/* Product Name */}
          <h1 className="text-xl md:text-2xl font-bold text-primary leading-tight">
            {product.name}
          </h1>

          {/* Price */}
          <div>
            <p className="text-3xl font-bold text-accent">
              Rs. {Number(product.price).toLocaleString()}
            </p>
            <p className="text-xs text-muted mt-1">
              Price excludes delivery · Cash on Delivery available
            </p>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-muted leading-relaxed border-t border-gray-100 pt-3">
              {product.description}
            </p>
          )}

          {/* ── Size Selector ──────────────────────────────────────────── */}
          {sizes.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-primary mb-2">
                {sizes.length} Size{sizes.length > 1 ? "s" : ""}
                {selectedSize && (
                  <span className="text-muted font-normal ml-1">
                    : {selectedSize.label}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[52px] h-11 px-3 rounded-xl border-2 text-sm
                                font-semibold transition-all duration-150 active:scale-95
                                ${
                                  selectedSize?.id === size.id
                                    ? "bg-primary text-white border-primary shadow-sm"
                                    : "bg-white text-primary border-gray-200 hover:border-primary"
                                }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Quantity Selector ──────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-primary">Quantity</p>
            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center text-muted
                           hover:bg-gray-50 active:scale-95 text-lg font-bold"
              >
                −
              </button>
              <span className="w-10 text-center text-base font-bold text-primary">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 flex items-center justify-center text-muted
                           hover:bg-gray-50 active:scale-95 text-lg font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* ── Total price row ────────────────────────────────────────── */}
          <div className="flex items-center justify-between bg-surface 
                          rounded-xl px-4 py-3 border border-gray-100">
            <span className="text-sm text-muted">Total</span>
            <span className="text-xl font-bold text-accent">
              Rs. {(product.price * quantity).toLocaleString()}
            </span>
          </div>

          {/* ── Action Buttons — ALWAYS INSIDE THE PAGE, never fixed ───── */}
          <div className="flex flex-col gap-3 mt-1">

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className={`w-full flex items-center justify-center gap-2
                          text-base font-semibold px-6 py-3.5 rounded-xl
                          transition-all duration-300 active:scale-95
                          ${
                            added
                              ? "bg-green-500 text-white"
                              : "bg-primary text-white hover:bg-primary/90"
                          }`}
            >
              {added ? (
                <>
                  <HiCheck size={20} />
                  Added to Cart!
                </>
              ) : (
                <>
                  <HiShoppingCart size={20} />
                  Add to Cart
                </>
              )}
            </button>

            {/* WhatsApp Order */}
            <button
              onClick={handleWhatsAppOrder}
              className="w-full btn-whatsapp justify-center py-3.5 text-base font-semibold"
            >
              <FaWhatsapp size={20} />
              Order via WhatsApp
            </button>

          </div>
          {/* ── End Action Buttons ─────────────────────────────────────── */}

        </div>
        {/* ── End RIGHT column ─────────────────────────────────────────── */}

      </div>
      {/* ── End grid ─────────────────────────────────────────────────────── */}

    </div>
  );
};

export default ProductDetail;
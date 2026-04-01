import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { HiTrash, HiShoppingBag, HiArrowRight } from "react-icons/hi";

const Cart: React.FC = () => {
  const { items, totalItems, totalPrice, removeFromCart, updateQuantity, clearCart } =
    useCart();
  const navigate = useNavigate();

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center gap-4 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
          <HiShoppingBag size={36} className="text-gray-300" />
        </div>
        <h1 className="text-xl font-bold text-primary">Your cart is empty</h1>
        <p className="text-sm text-muted">Add some shoes to get started!</p>
        <Link to="/products" className="btn-primary px-8 mt-2">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="section-title">My Cart</h1>
          <p className="text-xs text-muted mt-0.5">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </p>
        </div>
        <button
          onClick={() => { if (confirm("Clear all items?")) clearCart(); }}
          className="text-xs text-accent flex items-center gap-1 hover:underline"
        >
          <HiTrash size={13} /> Clear all
        </button>
      </div>

      {/* ── Cart Items ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 mb-5">
        {items.map((item) => (
          <div
            key={`${item.product.id}-${item.selectedSize.id}`}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex gap-3"
          >
            {/* Image */}
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
              <img
                src={item.product.image_url ?? "https://placehold.co/80x80?text=?"}
                alt={item.product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary line-clamp-2 leading-tight">
                {item.product.name}
              </p>
              <p className="text-xs text-muted mt-0.5">
                Size:{" "}
                <span className="font-medium text-primary">
                  {item.selectedSize.label}
                </span>
              </p>
              <p className="text-accent font-bold text-sm mt-1">
                Rs. {(item.product.price * item.quantity).toLocaleString()}
              </p>

              {/* Quantity + Remove */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() =>
                      updateQuantity(item.product.id, item.selectedSize.id, item.quantity - 1)
                    }
                    className="px-2.5 py-1 text-muted hover:bg-gray-50 text-sm active:scale-95"
                  >
                    −
                  </button>
                  <span className="px-3 text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(item.product.id, item.selectedSize.id, item.quantity + 1)
                    }
                    className="px-2.5 py-1 text-muted hover:bg-gray-50 text-sm active:scale-95"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.product.id, item.selectedSize.id)}
                  className="p-1.5 text-accent hover:bg-red-50 rounded-lg transition-colors"
                >
                  <HiTrash size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Order Summary + Checkout — ALL INSIDE ONE BOX ─────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Summary rows */}
        <div className="p-4 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-primary">Order Summary</h2>

          <div className="flex justify-between text-sm">
            <span className="text-muted">Subtotal ({totalItems} items)</span>
            <span className="font-medium">Rs. {totalPrice.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted">Delivery</span>
            <span className="text-green-600 font-medium">To be confirmed</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted">Payment</span>
            <span className="font-medium">Cash on Delivery</span>
          </div>

          <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
            <span className="font-bold text-primary text-base">Total</span>
            <span className="font-bold text-accent text-xl">
              Rs. {totalPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Checkout button — INSIDE the box, full width at bottom */}
        <div className="px-4 pb-4">
          <button
            onClick={() => navigate("/checkout")}
            className="w-full bg-primary text-white font-semibold text-base 
                       py-3.5 rounded-xl flex items-center justify-center gap-2
                       active:scale-95 transition-all duration-150 hover:bg-primary/90"
          >
            Checkout
            <HiArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Bottom spacing so WhatsApp button doesn't overlap */}
      <div className="h-24" />

    </div>
  );
};

export default Cart;
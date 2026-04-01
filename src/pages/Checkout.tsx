import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";
import {
  HiShoppingCart,
  HiUser,
  HiPhone,
  HiLocationMarker,
  HiCash,
  HiChevronDown,
  HiChevronUp,
  HiArrowRight,
} from "react-icons/hi";

interface CustomerForm {
  name: string;
  phone: string;
  address: string;
  notes: string;
}

const EMPTY_FORM: CustomerForm = {
  name: "",
  phone: "",
  address: "",
  notes: "",
};

const Checkout: React.FC = () => {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState<CustomerForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<CustomerForm>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showItems, setShowItems] = useState(false);

  // ✅ FIX 1: Only redirect if cart is empty AND we aren't currently submitting
  useEffect(() => {
    if (items.length === 0 && !submitting) {
      navigate("/cart", { replace: true });
    }
  }, [items.length, navigate, submitting]);

  if (items.length === 0 && !submitting) return null;

  const validate = (): boolean => {
    const newErrors: Partial<CustomerForm> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9+\s-]{7,15}$/.test(form.phone.trim())) {
      newErrors.phone = "Enter a valid phone number";
    }
    if (!form.address.trim()) newErrors.address = "Delivery address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    setSubmitting(true);

    try {
      // 1. Handle Customer logic
      let customerId: string | null = null;
      const { data: existing } = await supabase
        .from("customers")
        .select("id")
        .eq("phone", form.phone.trim())
        .maybeSingle();

      if (existing) {
        customerId = existing.id;
        await supabase
          .from("customers")
          .update({
            name: form.name.trim(),
            address: form.address.trim(),
          })
          .eq("id", customerId);
      } else {
        const { data: newCust } = await supabase
          .from("customers")
          .insert({
            name: form.name.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
          })
          .select()
          .single();
        customerId = newCust?.id ?? null;
      }

      // 2. Insert order rows
      const orderRows = items.map((item) => ({
        customer_id: customerId,
        product_id: item.product.id,
        size_id: item.selectedSize.id,
        quantity: item.quantity,
        status: "pending",
        notes: form.notes.trim() || null,
      }));

      const { error: orderError } = await supabase
        .from("orders")
        .insert(orderRows);

      if (orderError) throw orderError;

      // ✅ FIX 2: Store data before clearing the cart
      const successData = {
        customerName: form.name.trim(),
        totalItems,
        totalPrice,
      };

      // ✅ FIX 3: Clear cart FIRST, but because 'submitting' is true, 
      // the useEffect won't trigger the redirect to /cart.
      clearCart();

      // ✅ FIX 4: Navigate to success
      navigate("/order-success", {
        replace: true,
        state: successData,
      });

    } catch (err) {
      console.error("Order error:", err);
      alert("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const inputClass = (field: keyof CustomerForm) =>
    `input ${errors[field] ? "border-accent ring-1 ring-accent/20" : ""}`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="section-title mb-1 text-2xl font-bold">Checkout</h1>
      <p className="text-xs text-muted mb-5">
        Cash on Delivery · Fill in your details below
      </p>

      {/* Order Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 overflow-hidden">
        <button
          onClick={() => setShowItems((s) => !s)}
          className="w-full flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-2">
            <HiShoppingCart size={17} className="text-accent" />
            <span className="text-sm font-semibold text-primary">
              {totalItems} {totalItems === 1 ? "item" : "items"} in cart
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-accent">
              Rs. {totalPrice.toLocaleString()}
            </span>
            {showItems ? <HiChevronUp size={17} /> : <HiChevronDown size={17} />}
          </div>
        </button>

        {showItems && (
          <div className="border-t border-gray-100 divide-y divide-gray-50">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.selectedSize.id}`} className="flex items-center gap-3 px-4 py-3">
                <img
                  src={item.product.image_url ?? "https://placehold.co/60x60?text=?"}
                  alt={item.product.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">{item.product.name}</p>
                  <p className="text-xs text-muted">Size: {item.selectedSize.label} · Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-accent">
                  Rs. {(item.product.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <h2 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
          <HiUser size={15} className="text-accent" />
          Your Details
        </h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-muted mb-1 block">Full Name *</label>
            <div className="relative">
              <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} />
              <input
                type="text"
                className={`${inputClass("name")} w-full pl-9 p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-accent transition-all`}
                placeholder="e.g. Kamal Perera"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            {errors.name && <p className="text-[10px] text-accent mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-muted mb-1 block">Phone Number *</label>
            <div className="relative">
              <HiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} />
              <input
                type="tel"
                className={`${inputClass("phone")} w-full pl-9 p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-accent transition-all`}
                placeholder="e.g. 077 123 4567"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            {errors.phone && <p className="text-[10px] text-accent mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-muted mb-1 block">Delivery Address *</label>
            <div className="relative">
              <HiLocationMarker className="absolute left-3 top-3.5 text-muted" size={15} />
              <textarea
                rows={3}
                className={`${inputClass("address")} w-full pl-9 p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-accent transition-all resize-none`}
                placeholder="House no, Street, City"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            {errors.address && <p className="text-[10px] text-accent mt-1">{errors.address}</p>}
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <h2 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
          <HiCash size={15} className="text-accent" />
          Payment Method
        </h2>
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
          <div className="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-primary">Cash on Delivery</p>
            <p className="text-xs text-muted">Pay when your order arrives</p>
          </div>
          <HiCash size={22} className="text-green-500" />
        </div>
      </div>

      {/* Bottom Summary & Button */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-24">
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-primary">Total</span>
          <span className="font-bold text-accent text-xl">Rs. {totalPrice.toLocaleString()}</span>
        </div>
        
        <button
          onClick={handlePlaceOrder}
          disabled={submitting}
          className="w-full bg-primary text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95"
        >
          {submitting ? "Placing Order..." : (
            <>
              Place Order <HiArrowRight size={18} />
            </>
          )}
        </button>
        <p className="text-center text-[10px] text-muted mt-2">
           Cash on Delivery · Free review by our team
        </p>
      </div>
    </div>
  );
};

export default Checkout;
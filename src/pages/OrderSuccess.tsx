import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiCheckCircle, HiShoppingBag, HiPhone, HiChevronRight } from "react-icons/hi";
import confetti from "canvas-confetti";

interface LocationState {
  customerName?: string;
  totalItems?: number;
  totalPrice?: number;
}

const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const wa = import.meta.env.VITE_WHATSAPP_NUMBER;

  // 1. Guard the route & Trigger celebration
  useEffect(() => {
    if (!state) {
      // If no order data exists, redirect to home immediately
      navigate("/", { replace: true });
      return;
    }

    // Success celebration
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ef4444", "#000000", "#22c55e"], // Brand colors
    });
  }, [state, navigate]);

  // Don't render anything if redirecting
  if (!state) return null;

  const steps = [
    {
      step: "1",
      title: "Order Received",
      text: "Your order has been saved and our team will review it shortly.",
      color: "bg-blue-100 text-blue-600",
    },
    {
      step: "2",
      title: "We'll Contact You",
      text: "Our team will call or message you to confirm your order and delivery.",
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      step: "3",
      title: "Delivered to You",
      text: "Your shoes will be delivered. Pay cash when it arrives at your door!",
      color: "bg-green-100 text-green-600",
    },
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-12 flex flex-col items-center text-center gap-5">
      
      {/* Animated Success icon */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-25"></div>
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center relative">
          <HiCheckCircle size={56} className="text-green-500" />
        </div>
      </div>

      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Order Placed!</h1>
        <p className="text-muted text-sm mt-1">
          Thank you,{" "}
          <span className="font-semibold text-primary">{state.customerName || "Customer"}</span>!
        </p>
      </div>

      {/* What's next card */}
      <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left">
        <h2 className="text-sm font-semibold text-primary mb-5">What happens next?</h2>
        <div className="flex flex-col gap-6">
          {steps.map(({ step, title, text, color }, index) => (
            <div key={step} className="flex items-start gap-4 relative">
              {/* Visual Connector line between steps */}
              {index !== steps.length - 1 && (
                <div className="absolute left-[14px] top-8 w-[1.5px] h-6 bg-gray-100" />
              )}
              
              <div
                className={`w-7 h-7 rounded-full ${color} flex items-center justify-center 
                            text-xs font-bold flex-shrink-0 z-10`}
              >
                {step}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-primary leading-none mb-1">{title}</p>
                <p className="text-xs text-muted leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary line */}
        <div className="border-t border-gray-100 mt-6 pt-4 flex justify-between items-center">
          <span className="text-xs text-muted font-medium uppercase tracking-wider">
            {state.totalItems} {state.totalItems === 1 ? "item" : "items"} Total
          </span>
          <span className="text-base font-bold text-accent">
            Rs. {state.totalPrice?.toLocaleString()}
          </span>
        </div>
      </div>

      {/* COD reminder */}
      <div className="w-full bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3">
        <span className="text-2xl">💵</span>
        <div className="text-left">
          <p className="text-sm font-semibold text-primary">Cash on Delivery</p>
          <p className="text-xs text-muted leading-snug">
            No online payment needed — pay when your order arrives!
          </p>
        </div>
      </div>

      {/* Contact us */}
      <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 group">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
          <HiPhone size={18} className="text-primary" />
        </div>
        <div className="text-left flex-1">
          <p className="text-sm font-semibold text-primary">Have questions?</p>
          <p className="text-xs text-muted">Call us for quick help</p>
        </div>
        <a
          href={`tel:${wa?.replace(/\s/g, "")}`}
          className="bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
        >
          Call Us
        </a>
      </div>

      {/* Action buttons */}
      <div className="w-full flex flex-col gap-3 mt-2">
        <Link
          to="/products"
          className="w-full bg-primary text-white font-bold text-sm py-4 
                     rounded-xl flex items-center justify-center gap-2
                     shadow-lg shadow-primary/10 active:scale-[0.98] transition-all"
        >
          <HiShoppingBag size={18} />
          Continue Shopping
          <HiChevronRight size={18} />
        </Link>
        <Link
          to="/"
          className="text-sm font-medium text-muted hover:text-primary transition-colors"
        >
          Back to Home
        </Link>
      </div>

      <div className="h-8" />
    </div>
  );
};

export default OrderSuccess;
import React from "react";
import { FaWhatsapp } from "react-icons/fa";

const WhatsAppButton: React.FC = () => {
  const wa = import.meta.env.VITE_WHATSAPP_NUMBER;
  const message = encodeURIComponent("Hi! I'd like to order from Highpoint Shoes.");

  return (
    <a
      href={`https://wa.me/${wa}?text=${message}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-4 z-50 bg-[#25D366] text-white 
                 rounded-full shadow-lg p-3.5 flex items-center gap-2
                 active:scale-95 transition-all duration-150"
      aria-label="Order via WhatsApp"
    >
      <FaWhatsapp size={24} />
      <span className="text-sm font-semibold pr-1 hidden sm:block">Order Now</span>
    </a>
  );
};

export default WhatsAppButton;
import React from "react";
import { FaWhatsapp, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const Contact: React.FC = () => {
  const wa = import.meta.env.VITE_WHATSAPP_NUMBER;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="section-title mb-6">Contact Us</h1>

      <div className="space-y-4 mb-8">
        {/* Phone */}
        <a
          href={`tel:+${wa}`}
          className="flex items-center gap-4 p-4 bg-surface rounded-2xl border border-gray-100 active:scale-95 transition-all"
        >
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <FaPhone className="text-white" size={16} />
          </div>
          <div>
            <p className="text-xs text-muted font-medium">Call Us</p>
            <p className="text-sm font-semibold text-primary">+{wa}</p>
          </div>
        </a>

        {/* WhatsApp */}
        <a
          href={`https://wa.me/${wa}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-4 p-4 bg-[#25D366]/10 rounded-2xl border border-[#25D366]/20 active:scale-95 transition-all"
        >
          <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center flex-shrink-0">
            <FaWhatsapp className="text-white" size={18} />
          </div>
          <div>
            <p className="text-xs text-muted font-medium">WhatsApp</p>
            <p className="text-sm font-semibold text-primary">Chat with us</p>
          </div>
        </a>

        {/* Address */}
        <div className="flex items-center gap-4 p-4 bg-surface rounded-2xl border border-gray-100">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
            <FaMapMarkerAlt className="text-white" size={16} />
          </div>
          <div>
            <p className="text-xs text-muted font-medium">Location</p>
            <p className="text-sm font-semibold text-primary">
              123 Main Street, Colombo, Sri Lanka
            </p>
          </div>
        </div>
      </div>

      {/* Google Maps embed */}
      <div className="w-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        <iframe
          title="Highpoint Shoes Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63371.80385629744!2d79.82118625!3d6.9218385!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae253d10f7a7003%3A0x320b2e4d32d3838d!2sColombo%2C%20Sri%20Lanka!5e0!3m2!1sen!2slk!4v1699999999999"
          width="100%"
          height="250"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
};

export default Contact;
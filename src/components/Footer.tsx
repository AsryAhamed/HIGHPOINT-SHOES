import React from "react";
import { Link } from "react-router-dom";
import {
  FaWhatsapp,
  FaInstagram,
  FaFacebook,
  FaMapMarkerAlt,
} from "react-icons/fa";

const Footer: React.FC = () => {
  const wa = import.meta.env.VITE_WHATSAPP_NUMBER;

  return (
    <footer className="bg-[#0f0e0d] text-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="text-xl font-bold mb-2">
              Highpoint <span className="text-red-500">Shoes</span>
            </p>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Quality footwear for every step of your journey.
            </p>

            {/* Socials */}
            <div className="flex gap-4 mt-5">
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-[#25D366] transition"
              >
                <FaWhatsapp size={20} />
              </a>
              <a
                href="https://instagram.com/highpoint_shoes"
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-white transition"
              >
                <FaInstagram size={20} />
              </a>
              <a
                href="https://facebook.com/highpoint_shoes"
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-white transition"
              >
                <FaFacebook size={20} />
              </a>
            </div>
          </div>

          {/* Pages */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
              Pages
            </p>
            <div className="flex flex-col gap-3">
              {[
                { name: "Home", path: "/" },
                { name: "Products", path: "/products" },
                { name: "Gallery", path: "/gallery" },
                { name: "About", path: "/about" },
                { name: "Contact", path: "/contact" },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-sm text-gray-300 hover:text-white transition"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
              Contact
            </p>

            <div className="flex flex-col gap-4 text-sm">

              {/* Phone */}
              <a
                href={`tel:+${wa}`}
                className="text-gray-300 hover:text-white transition"
              >
                +{wa}
              </a>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noreferrer"
                className="text-gray-300 hover:text-[#25D366] transition"
              >
                WhatsApp Us
              </a>

              {/* Location */}
              <a
                href="https://maps.google.com/?q=22+Galle+Road+Dehiwala+10350"
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 text-gray-300 hover:text-white transition"
              >
                <FaMapMarkerAlt
                  className="mt-1 text-red-500 shrink-0"
                  size={16}
                />
                <div className="leading-relaxed">
                  <p>22 Galle Road,</p>
                  <p className="text-xs text-gray-400">
                    Dehiwala 10350
                  </p>
                </div>
              </a>

            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Highpoint Shoes. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
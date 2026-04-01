import React from "react";
import { HiCheckCircle, HiCash, HiTruck } from "react-icons/hi";

const About: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="section-title mb-6">About Us</h1>

      {/* Store image */}
      <div className="w-full aspect-video bg-gray-100 rounded-2xl overflow-hidden mb-6">
        <img
          src="https://res.cloudinary.com/dljdrc6li/image/upload/v1775068186/A_luxury_sneaker_boutique_interior_with_elegant_display_shelves_soft_golden_lighting_premium_atmosphere_minimal_design_high-end_fashion_store_look_ultra_realistic_clean_and_sophisticated_style_dculat.jpg"
          alt="Highpoint Shoes Store Interior"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
        <p>
          Welcome to <strong>Highpoint Shoes</strong> — your go-to destination for quality
          footwear in Sri Lanka. We believe that the right pair of shoes can make all the
          difference, whether you're heading to the office, a night out, or a casual day
          with family.
        </p>
        <p>
          Founded with a passion for style and comfort, Highpoint Shoes offers a curated
          collection for men, women, and kids. From classic formal wear to trendy sneakers
          and comfortable sandals, we have something for every occasion and every budget.
        </p>
        <p>
          We source our footwear from trusted suppliers to ensure the highest quality at
          competitive prices. Our team is dedicated to providing excellent customer service
          — whether you're shopping in-store or ordering through WhatsApp.
        </p>
        <p>
          Visit us, browse our collection, and find your perfect pair. We're here to help
          you step up in style!
        </p>
      </div>

      {/* Values */}
      <div className="grid grid-cols-3 gap-3 mt-8">
        {[
          { icon: <HiCheckCircle className="text-2xl text-primary" />, label: "Quality" },
          { icon: <HiCash className="text-2xl text-primary" />, label: "Affordable" },
          { icon: <HiTruck className="text-2xl text-primary" />, label: "Fast Delivery" },
        ].map((v) => (
          <div
            key={v.label}
            className="flex flex-col items-center bg-surface rounded-2xl py-5 gap-2 border border-gray-100"
          >
            {v.icon}
            <span className="text-xs font-semibold text-primary">{v.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
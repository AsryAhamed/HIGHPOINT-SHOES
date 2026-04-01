import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Banner, Product } from "../types";
import BannerCarousel from "../components/BannerCarousel";
import ProductCard from "../components/ProductCard";
import {
  HiArrowRight,
  HiStar,
  HiTruck,
  HiPhone,
} from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import {
  GiRunningShoe,
  GiHighHeel,
  GiConverseShoe,
} from "react-icons/gi";

/* DEFAULT BANNERS */
const DEFAULT_BANNERS: Banner[] = [
  {
    id: "default-1",
    title: "Step Into Style",
    subtitle: "New Season Arrivals",
    description: "Discover premium sneakers for every occasion.",
    image_url: "/banners/pc-banner.jpg",
    link: "/products",
    sort_order: 0,
    is_active: true,
    created_at: "",
  },
];

/* CATEGORIES */
const CATEGORIES = [
  { label: "Men", slug: "men", icon: GiRunningShoe, bg: "bg-blue-50", border: "border-blue-100" },
  { label: "Women", slug: "women", icon: GiHighHeel, bg: "bg-pink-50", border: "border-pink-100" },
  { label: "Kids", slug: "kids", icon: GiConverseShoe, bg: "bg-yellow-50", border: "border-yellow-100" },
];

/* FEATURES */
const FEATURES = [
  { icon: HiTruck, label: "Fast Delivery", sub: "Island-wide" },
  { icon: HiStar, label: "Top Quality", sub: "Trusted brands" },
  { icon: HiPhone, label: "Easy Returns", sub: "24/7 support" },
];

/* TESTIMONIALS DATA */
const TESTIMONIALS = [
  {
    id: 1,
    name: "Ahamed",
    comment: "The quality of the shoes is amazing. Fast delivery too!",
    rating: 5,
  },
  {
    id: 2,
    name: "Sara",
    comment: "Very comfortable and stylish. Highly recommend Highpoint!",
    rating: 5,
  },
  {
    id: 3,
    name: "Rizwan",
    comment: "Best customer service and original brands. Will buy again.",
    rating: 4,
  },
];

const Home: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>(DEFAULT_BANNERS);
  const [featured, setFeatured] = useState<Product[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const wa = import.meta.env.VITE_WHATSAPP_NUMBER ?? "94771234567";

  useEffect(() => {
    const fetchData = async () => {
      // 1. Banners
      const { data: bannersData } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (bannersData?.length) setBanners(bannersData);

      // 2. Featured Products
      const { data: productsData } = await supabase
        .from("products")
        .select(`*, categories(*), subcategories(*), product_sizes(sizes(*))`)
        .eq("is_featured", true)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(10);
      setFeatured(productsData ?? []);

      // 3. Gallery Images (Limit 2 for Home)
      const { data: galleryData } = await supabase
        .from("gallery")
        .select("image_url")
        .limit(2);
      if (galleryData) setGalleryImages(galleryData);

      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="pb-28 bg-white">
      {/* BANNER SECTION */}
      <BannerCarousel banners={banners} />

      {/* TRUST FEATURES */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-3 divide-x">
          {FEATURES.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="text-center">
              <Icon className="mx-auto text-accent" size={20} />
              <p className="text-xs font-semibold">{label}</p>
              <p className="text-[10px] text-gray-400">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURED PRODUCTS */}
      <section className="px-4 pt-6 max-w-6xl mx-auto">
        <div className="flex justify-between mb-4">
          <h2 className="section-title">Featured Products</h2>
          <Link to="/products" className="text-sm text-accent flex items-center gap-1 font-medium">
            View all <HiArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3].map((n) => (
              <div key={n} className="w-44 h-64 bg-gray-100 animate-pulse rounded-2xl flex-shrink-0" />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {featured.map((p) => (
              <div key={p.id} className="w-44 flex-shrink-0">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CATEGORY SECTION */}
      <section className="px-4 py-8 max-w-6xl mx-auto">
        <h2 className="section-title mb-4">Shop by Category</h2>
        <div className="grid grid-cols-3 gap-3">
          {CATEGORIES.map(({ label, slug, icon: Icon, bg, border }) => (
            <Link
              key={label}
              to={`/products?category=${slug}`}
              className={`flex flex-col items-center bg-white border ${border} rounded-2xl py-5 shadow-sm active:scale-95 transition-transform`}
            >
              <div className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center text-primary`}>
                <Icon size={24} />
              </div>
              <span className="text-sm font-semibold mt-2">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* DYNAMIC GALLERY SECTION */}
      {galleryImages.length > 0 && (
        <section className="px-4 pb-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-2 gap-3">
            {galleryImages.map((img, index) => (
              <div key={index} className="rounded-2xl overflow-hidden h-40 shadow-sm border border-gray-100">
                <img 
                  src={img.image_url} 
                  alt="Gallery" 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TESTIMONIALS SECTION */}
      <section className="px-4 py-8 max-w-6xl mx-auto bg-gray-50/50 rounded-t-[40px]">
        <h2 className="section-title mb-6 text-center text-lg">What Our Customers Say</h2>
        
        {/* Mobile: Horizontal Scroll | PC: 3-Column Grid */}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-hidden md:pb-0 no-scrollbar">
          {TESTIMONIALS.map((t) => (
            <div 
              key={t.id} 
              className="min-w-[85%] md:min-w-0 bg-white p-6 rounded-2xl border border-gray-100 snap-center shadow-sm"
            >
              <div className="flex gap-1 mb-3 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <HiStar key={i} size={14} className={i < t.rating ? "fill-current" : "text-gray-200"} />
                ))}
              </div>
              <p className="text-gray-600 italic text-sm mb-4 leading-relaxed">"{t.comment}"</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold text-xs uppercase">
                  {t.name.charAt(0)}
                </div>
                <span className="font-semibold text-sm text-primary">{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHATSAPP CTA */}
      <section className="px-4 py-8 max-w-6xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-primary shadow-lg">
          <img
            src="/banners/mobile-banner.jpg"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
            alt="CTA Background"
          />
          <div className="relative z-10 text-center py-12 px-4">
            <h3 className="text-white text-xl font-bold mb-4">
              Order via WhatsApp
            </h3>
            <a
              href={`https://wa.me/${wa}?text=${encodeURIComponent(
                "Hi! I'd like to place an order from Highpoint Shoes."
              )}`}
              target="_blank"
              rel="noreferrer"
              className="bg-[#25D366] text-white px-8 py-3.5 rounded-full inline-flex items-center gap-2 font-bold shadow-md active:scale-95 transition-transform"
            >
              <FaWhatsapp size={20} />
              Order Now
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
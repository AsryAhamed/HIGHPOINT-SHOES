import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { HiShoppingBag, HiPhotograph, HiCollection, HiClipboardList } from "react-icons/hi";

interface Stats {
  products: number;
  banners: number;
  gallery: number;
  orders: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({ products: 0, banners: 0, gallery: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [p, b, g, o] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("banners").select("id", { count: "exact", head: true }),
        supabase.from("gallery").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        products: p.count ?? 0,
        banners: b.count ?? 0,
        gallery: g.count ?? 0,
        orders: o.count ?? 0,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Products", value: stats.products, icon: HiShoppingBag, color: "bg-blue-50 text-blue-600" },
    { label: "Banners", value: stats.banners, icon: HiPhotograph, color: "bg-purple-50 text-purple-600" },
    { label: "Gallery", value: stats.gallery, icon: HiCollection, color: "bg-green-50 text-green-600" },
    { label: "Orders", value: stats.orders, icon: HiClipboardList, color: "bg-orange-50 text-orange-600" },
  ];

  return (
    <div>
      <h1 className="section-title mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-primary">
              {loading ? "—" : value}
            </p>
            <p className="text-xs text-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-primary mb-2">Quick Tips</h2>
        <ul className="text-xs text-muted space-y-1 list-disc list-inside">
          <li>Add banners for the homepage carousel via the Banners section.</li>
          <li>Mark products as "Featured" to show on the homepage.</li>
          <li>Upload gallery images to showcase your store.</li>
          <li>Update order status as orders come in via WhatsApp.</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
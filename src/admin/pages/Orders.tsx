import React, { useEffect, useState } from "react";
import { Search, MessageCircle, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { Order } from "../../types";

// Define the exact status type to match your Database/Order type
type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

const STATUSES: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select(`*, customers(*), products(name, image_url), sizes(label)`)
      .order("created_at", { ascending: false });
    setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    // Cast the string from the event to the specific OrderStatus type
    const newStatus = status as OrderStatus;
    
    await supabase.from("orders").update({ status: newStatus }).eq("id", id);
    
    // Refresh local list
    fetchOrders();
    
    // Update the drawer if it's open for this specific order
    if (selectedOrder?.id === id) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const customerName = o.customers?.name?.toLowerCase() || "";
    const phone = o.customers?.phone || "";
    const matchesSearch = customerName.includes(search.toLowerCase()) || phone.includes(search);
    const matchesStatus = filterStatus === "all" || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 p-4">
      <header>
        <h1 className="text-2xl font-semibold text-gray-800">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">{orders.length} total orders</p>
      </header>

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 text-xs font-medium uppercase rounded-md border transition-all ${
              filterStatus === "all" ? "bg-gray-800 text-white" : "bg-white text-gray-500 border-gray-200"
            }`}
          >
            All
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-xs font-medium uppercase rounded-md border transition-all ${
                filterStatus === s ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-500 border-gray-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Loading...</td></tr>
            ) : filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <button onClick={() => setSelectedOrder(order)} className="text-blue-600 font-medium hover:underline block">
                    {order.customers?.name || "Unknown"}
                  </button>
                  <span className="text-xs text-gray-400">{order.customers?.phone}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-700">{order.products?.name}</div>
                  <div className="text-xs text-gray-400">Qty: {order.quantity}</div>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-md font-medium border-none focus:ring-1 ${STATUS_COLORS[order.status as OrderStatus]}`}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                  </select>
                </td>
                <td className="px-6 py-4 text-gray-400 text-xs">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <a 
                    href={`https://wa.me/${order.customers?.phone?.replace(/\D/g,'')}`}
                    target="_blank" rel="noreferrer"
                    className="inline-flex p-2 text-gray-400 hover:text-green-500"
                  >
                    <MessageCircle size={18} />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-6">
              <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Customer</h3>
                <p className="font-semibold">{selectedOrder.customers?.name}</p>
                <p className="text-sm text-gray-500">{selectedOrder.customers?.phone}</p>
                <p className="text-sm bg-gray-50 p-3 mt-2 rounded">{selectedOrder.customers?.address}</p>
              </section>

              <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Item</h3>
                <div className="flex gap-4 items-center border p-3 rounded-lg">
                  {/* Fixed src logic: using || undefined or a fallback string */}
                  <img 
                    src={selectedOrder.products?.image_url || ""} 
                    className="w-16 h-16 object-cover rounded" 
                    alt={selectedOrder.products?.name || "Product"} 
                  />
                  <div>
                    <p className="font-bold">{selectedOrder.products?.name}</p>
                    <p className="text-sm text-gray-500">Size: {selectedOrder.sizes?.label}</p>
                  </div>
                </div>
              </section>

              <a 
                href={`https://wa.me/${selectedOrder.customers?.phone?.replace(/\D/g,'')}`}
                target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white font-bold rounded-lg"
              >
                <MessageCircle size={18} /> Message Customer
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Banner } from "../../types";
import { HiTrash, HiPlus } from "react-icons/hi";

const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const fetchBanners = async () => {
    const { data } = await supabase.from("banners").select("*").order("sort_order");
    setBanners(data ?? []);
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchBanners(); }, []);

  const handleUpload = async () => {
    if (!file) return alert("Please select an image.");
    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("banners")
      .upload(path, file, { upsert: true });

    if (uploadError) { alert(uploadError.message); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from("banners").getPublicUrl(path);

    await supabase.from("banners").insert({
      title: title || null,
      image_url: urlData.publicUrl,
      sort_order: banners.length,
      is_active: true,
    });

    setTitle("");
    setFile(null);
    setUploading(false);
    fetchBanners();
  };

  const handleDelete = async (banner: Banner) => {
    if (!confirm("Delete this banner?")) return;
    const filePath = banner.image_url.split("/banners/")[1];
    await supabase.storage.from("banners").remove([filePath]);
    await supabase.from("banners").delete().eq("id", banner.id);
    fetchBanners();
  };

  return (
    <div>
      <h1 className="section-title mb-6">Banners</h1>

      {/* Upload form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-6">
        <h2 className="text-sm font-semibold text-primary mb-4">Add New Banner</h2>
        <div className="flex flex-col gap-3">
          <div>
            <label className="label">Title (optional)</label>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summer Sale 2024"
            />
          </div>
          <div>
            <label className="label">Image</label>
            <input
              type="file"
              accept="image/*"
              className="input"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="btn-primary flex items-center gap-2 w-fit"
          >
            <HiPlus size={16} /> {uploading ? "Uploading..." : "Add Banner"}
          </button>
        </div>
      </div>

      {/* Banners list */}
      {loading ? (
        <p className="text-muted text-sm">Loading...</p>
      ) : banners.length === 0 ? (
        <p className="text-muted text-sm">No banners yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex items-center gap-4 p-3"
            >
              <img
                src={banner.image_url}
                alt={banner.title ?? "Banner"}
                className="w-24 h-16 object-cover rounded-xl flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary truncate">
                  {banner.title ?? "No title"}
                </p>
              </div>
              <button
                onClick={() => handleDelete(banner)}
                className="p-2 text-accent hover:bg-red-50 rounded-lg flex-shrink-0"
              >
                <HiTrash size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
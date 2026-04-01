import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { GalleryImage } from "../../types";
import { HiTrash, HiPlus } from "react-icons/hi";

const AdminGallery: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const fetchImages = async () => {
    const { data } = await supabase.from("gallery").select("*").order("sort_order");
    setImages(data ?? []);
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchImages(); }, []);

  const handleUpload = async () => {
    if (!file) return alert("Please select an image.");
    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("gallery")
      .upload(path, file, { upsert: true });

    if (uploadError) { alert(uploadError.message); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(path);

    await supabase.from("gallery").insert({
      image_url: urlData.publicUrl,
      caption: caption || null,
      sort_order: images.length,
    });

    setCaption("");
    setFile(null);
    setUploading(false);
    fetchImages();
  };

  const handleDelete = async (img: GalleryImage) => {
    if (!confirm("Delete this image?")) return;
    const filePath = img.image_url.split("/gallery/")[1];
    await supabase.storage.from("gallery").remove([filePath]);
    await supabase.from("gallery").delete().eq("id", img.id);
    fetchImages();
  };

  return (
    <div>
      <h1 className="section-title mb-6">Gallery</h1>

      {/* Upload */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-6">
        <h2 className="text-sm font-semibold text-primary mb-4">Add Image</h2>
        <div className="flex flex-col gap-3">
          <div>
            <label className="label">Caption (optional)</label>
            <input
              className="input"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="New collection..."
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
          <button onClick={handleUpload} disabled={uploading} className="btn-primary flex items-center gap-2 w-fit">
            <HiPlus size={16} /> {uploading ? "Uploading..." : "Add Image"}
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <p className="text-muted text-sm">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((img) => (
            <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100">
              <img src={img.image_url} alt={img.caption ?? ""} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDelete(img)}
                  className="p-2 bg-accent text-white rounded-full"
                >
                  <HiTrash size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
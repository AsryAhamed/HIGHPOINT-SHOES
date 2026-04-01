import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { GalleryImage } from "../types";
import Lightbox from "../components/Lightbox";

const GalleryPage: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from("gallery")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        setImages(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="section-title mb-4">Gallery</h1>

      {loading ? (
        <div className="grid grid-cols-2 gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <p className="text-muted text-sm text-center py-16">No gallery images yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setLightboxIndex(i)}
              className="aspect-square overflow-hidden rounded-xl bg-gray-100 active:scale-95 transition-all duration-150"
            >
              <img
                src={img.image_url}
                alt={img.caption ?? "Gallery image"}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNext={() => setLightboxIndex((i) => (i! + 1) % images.length)}
          onPrev={() =>
            setLightboxIndex((i) => (i! - 1 + images.length) % images.length)
          }
        />
      )}
    </div>
  );
};

export default GalleryPage;
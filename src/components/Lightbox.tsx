import React, { useEffect } from "react";
import { HiX, HiChevronLeft, HiChevronRight } from "react-icons/hi";
import type { GalleryImage } from "../types";

interface Props {
  images: GalleryImage[];
  index: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const Lightbox: React.FC<Props> = ({ images, index, onClose, onNext, onPrev }) => {
  const image = images[index];

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onNext, onPrev]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
        onClick={onClose}
      >
        <HiX size={28} />
      </button>

      {/* Prev */}
      <button
        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10 bg-black/30 rounded-full p-1"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
      >
        <HiChevronLeft size={32} />
      </button>

      {/* Image */}
      <div
        className="max-w-sm md:max-w-xl w-full mx-6"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.image_url}
          alt={image.caption ?? "Gallery"}
          className="w-full aspect-square object-cover rounded-xl"
        />
        {image.caption && (
          <p className="text-white/80 text-sm text-center mt-3">{image.caption}</p>
        )}
        <p className="text-white/40 text-xs text-center mt-1">
          {index + 1} / {images.length}
        </p>
      </div>

      {/* Next */}
      <button
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10 bg-black/30 rounded-full p-1"
        onClick={(e) => { e.stopPropagation(); onNext(); }}
      >
        <HiChevronRight size={32} />
      </button>
    </div>
  );
};

export default Lightbox;
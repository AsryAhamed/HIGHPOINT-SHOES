import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import type { Banner } from "../types";
import { Link } from "react-router-dom";

interface Props {
  banners: Banner[];
}

const BannerCarousel: React.FC<Props> = ({ banners }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4500, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  if (!banners.length) return null;

  const getMobileUrl = (url: string) =>
    url.includes("pc-banner")
      ? url.replace("pc-banner", "mobile-banner")
      : url;

  return (
    <div className="relative w-full overflow-hidden">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {banners.map((banner) => (
            <div key={banner.id} className="embla__slide">
              <div className="relative w-full">

                {/* MOBILE IMAGE */}
                <div className="block md:hidden w-full">
                  <img
                    src={getMobileUrl(banner.image_url)}
                    alt={banner.title ?? "Banner"}
                    draggable={false}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = banner.image_url;
                    }}
                    className="w-full h-auto object-cover"
                  />
                </div>

                {/* DESKTOP IMAGE */}
                <div className="hidden md:block w-full">
                  <img
                    src={banner.image_url}
                    alt={banner.title ?? "Banner"}
                    draggable={false}
                    className="w-full h-[520px] object-cover"
                  />
                </div>

                {/* DARK GRADIENT */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* TEXT CONTENT */}
                <div className="absolute inset-0 flex items-end md:items-center">
                  <div className="w-full px-4 md:px-10 pb-6 md:pb-0 md:max-w-2xl">

                    {/* SUBTITLE */}
                    {banner.subtitle && (
                      <p className="text-white/80 text-xs md:text-sm mb-1 uppercase tracking-wide">
                        {banner.subtitle}
                      </p>
                    )}

                    {/* TITLE */}
                    {banner.title && (
                      <h2 className="text-white font-bold text-lg md:text-4xl leading-tight drop-shadow-lg">
                        {banner.title}
                      </h2>
                    )}

                    {/* DESCRIPTION */}
                    {banner.description && (
                      <p className="text-white/80 text-xs md:text-base mt-2 max-w-md">
                        {banner.description}
                      </p>
                    )}

                    {/* CTA */}
                    {banner.link && (
                      <Link
                        to={banner.link}
                        className="inline-block mt-4 bg-white text-primary 
                                   px-5 py-2 rounded-full text-xs md:text-sm 
                                   font-semibold shadow-lg hover:scale-105 
                                   transition-all duration-200"
                      >
                        Shop Now →
                      </Link>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DOT INDICATORS */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 right-4 flex gap-1.5 z-10">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === selectedIndex ? "bg-white w-5" : "bg-white/50 w-1.5"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;
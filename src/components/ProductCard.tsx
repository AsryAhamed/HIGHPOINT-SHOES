import React from "react";
import { useNavigate } from "react-router-dom";
import type { Product } from "../types";

interface Props {
  product: Product;
}

const ProductCard: React.FC<Props> = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="cursor-pointer group bg-white rounded-2xl overflow-hidden 
                 border border-gray-100 shadow-sm active:scale-95 
                 transition-all duration-150"
    >
      {/* Product image — bigger, square */}
      <div className="w-full aspect-square bg-gray-50 overflow-hidden relative">
        <img
          src={
            product.image_url ??
            "https://placehold.co/500x500?text=No+Image"
          }
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 
                     transition-transform duration-300"
          loading="lazy"
        />
        {/* Featured badge */}
        {product.is_featured && (
          <span className="absolute top-2 left-2 bg-accent text-white 
                           text-[10px] font-bold px-2 py-0.5 rounded-full">
            Featured
          </span>
        )}
      </div>

      {/* Name + price section */}
      <div className="px-3 py-2.5">
        <p 
          className="text-sm font-semibold text-primary leading-tight truncate"
          title={product.name}
        >
          {product.name}
        </p>
        <p className="text-accent font-bold text-base mt-1">
          Rs. {Number(product.price).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
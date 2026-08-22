import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, Check } from 'lucide-react';
import { Product } from '../types';
import { formatNPR } from '../services/fonepayService';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
  onAddToCart: (p: Product, selectedColor?: string, selectedSize?: string) => void;
  onQuickView: (p: Product) => void;
  onExpressBuy?: (p: Product, selectedColor?: string, selectedSize?: string) => void;
  onEditProduct?: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onQuickView,
}) => {
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);

  const activeColor =
    product.colors && product.colors.length > 0 ? product.colors[selectedColorIdx] : undefined;
  const activeSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined;

  // Clean uppercase product name
  const displayName = product.name.toUpperCase();

  return (
    <div className="group bg-white dark:bg-stone-950 flex flex-col font-sans transition-all duration-200">
      {/* 1. Studio Product Image Frame */}
      <div
        onClick={() => onQuickView(product)}
        className="relative aspect-[4/5] w-full bg-[#f6f6f6] dark:bg-stone-900 overflow-hidden cursor-pointer flex items-center justify-center border border-stone-100 dark:border-stone-800/80"
      >
        {/* Model Photography / Studio Item Image */}
        <img
          src={product.images[0]}
          alt={displayName}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Left Green Badge (New Arrival / Trending) */}
        <div className="absolute top-3 left-3 z-10">
          {product.badge === 'New Arrival' || product.isNewArrival ? (
            <span className="bg-[#16a34a] text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-[3px] uppercase tracking-wide shadow-xs">
              New Arrival
            </span>
          ) : product.badge === 'Trending' || product.isTrending ? (
            <span className="bg-stone-900 dark:bg-stone-800 text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-[3px] uppercase tracking-wide shadow-xs">
              Trending
            </span>
          ) : product.isBestSeller ? (
            <span className="bg-amber-600 text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-[3px] uppercase tracking-wide shadow-xs">
              Best Seller
            </span>
          ) : null}
        </div>

        {/* Top Right Brand Watermark */}
        <div className="absolute top-3 right-3 z-10">
          <span className="text-[10px] font-black uppercase tracking-wider text-stone-700 dark:text-stone-300 select-none opacity-80">
            GT
          </span>
        </div>

        {/* Wishlist & Quick Actions Hover Overlay */}
        <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            className={`p-2 rounded-full shadow-md backdrop-blur-xs transition-all cursor-pointer ${
              isWishlisted
                ? 'bg-[#16a34a] text-white'
                : 'bg-white/90 dark:bg-stone-800/90 text-stone-700 dark:text-stone-200 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-stone-700'
            }`}
            title="Wishlist"
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product, activeColor?.name, activeSize);
            }}
            className="p-2 rounded-full bg-white/90 dark:bg-stone-800/90 hover:bg-white dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 hover:text-black dark:hover:text-white shadow-md backdrop-blur-xs transition-all cursor-pointer"
            title="Quick Add to Bag"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>

        {/* Quick View banner on hover */}
        <div className="absolute inset-x-0 bottom-0 py-2 bg-black/60 dark:bg-black/80 text-white text-[11px] font-bold uppercase tracking-widest text-center opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
          <Eye className="w-3.5 h-3.5" />
          <span>Quick View</span>
        </div>
      </div>

      {/* 2. Product Details (Title, Price, Color Swatches) */}
      <div className="pt-3.5 pb-2 flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Product Title + Seasonal Tag */}
          <h3
            onClick={() => onQuickView(product)}
            className="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-[13px] leading-snug uppercase line-clamp-2 hover:text-[#16a34a] dark:hover:text-[#22c55e] transition-colors cursor-pointer tracking-tight"
            title={displayName}
          >
            {displayName}
          </h3>

          {/* NPR Price Display (e.g. Rs. 5,825.00) */}
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-sm sm:text-base font-black text-black dark:text-white tracking-tight">
              {formatNPR(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-stone-400 dark:text-stone-500 line-through">
                {formatNPR(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Color Swatches (Matches Screenshot 1 circles below price) */}
        {product.colors && product.colors.length > 0 && (
          <div className="pt-1.5 flex items-center gap-2">
            {product.colors.map((color, idx) => {
              const isSelected = selectedColorIdx === idx;
              return (
                <button
                  key={color.name}
                  onClick={() => setSelectedColorIdx(idx)}
                  className={`w-5 h-5 rounded-full border transition-all cursor-pointer relative flex items-center justify-center ${
                    isSelected
                      ? 'ring-2 ring-stone-900 dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-stone-950 scale-110 border-white dark:border-stone-900'
                      : 'border-stone-300 dark:border-stone-700 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                  aria-label={color.name}
                >
                  {isSelected && (
                    <Check
                      className={`w-2.5 h-2.5 ${
                        color.hex === '#FFFFFF' ||
                        color.hex === '#CBB296' ||
                        color.hex === '#C2B280'
                          ? 'text-black'
                          : 'text-white'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

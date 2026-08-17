import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, Check, Edit } from 'lucide-react';
import { Product } from '../types';
import { formatNPR } from '../services/fonepayService';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
  onAddToCart: (p: Product, selectedColor?: string, selectedSize?: string) => void;
  onQuickView: (p: Product) => void;
  onExpressBuy: (p: Product, selectedColor?: string, selectedSize?: string) => void;
  onEditProduct?: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onQuickView,
  onExpressBuy,
  onEditProduct,
}) => {
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);

  const activeColor = product.colors && product.colors.length > 0 ? product.colors[selectedColorIdx] : undefined;
  const activeSize = product.sizes && product.sizes.length > 0 ? product.sizes[selectedSizeIdx] : undefined;

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 hover:border-black dark:hover:border-stone-500 transition-all duration-300 flex flex-col overflow-hidden relative font-sans">
      {/* Product Image Container */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden bg-stone-50 dark:bg-stone-900 cursor-pointer"
        onClick={() => onQuickView(product)}
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Minimal Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
          {product.badge ? (
            <span className="bg-black dark:bg-white text-white dark:text-black text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider">
              {product.badge}
            </span>
          ) : product.isNewArrival ? (
            <span className="bg-black dark:bg-white text-white dark:text-black text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider">
              NEW
            </span>
          ) : product.isBestSeller ? (
            <span className="bg-stone-900 dark:bg-stone-200 text-white dark:text-black text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider">
              BESTSELLER
            </span>
          ) : null}

          {discountPercent > 0 && (
            <span className="bg-stone-800 dark:bg-stone-800 text-white text-[9px] font-bold px-2 py-0.5 uppercase">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Top Right Action Buttons */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
          {onEditProduct && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditProduct(product);
              }}
              className="p-1.5 bg-white/90 dark:bg-stone-900/90 text-stone-700 dark:text-stone-300 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black backdrop-blur-md transition-all shadow-xs cursor-pointer border border-stone-200/60 dark:border-stone-700/60"
              title="Admin: Edit Product"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            className={`p-1.5 backdrop-blur-md transition-all shadow-xs cursor-pointer border ${
              isWishlisted
                ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                : 'bg-white/90 dark:bg-stone-900/90 text-stone-700 dark:text-stone-300 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black border-stone-200/60 dark:border-stone-700/60'
            }`}
            title="Save to Wishlist"
            aria-label="Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Quick View Hover Strip */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center pointer-events-none">
          <span className="bg-white dark:bg-stone-900 text-black dark:text-white border border-stone-200 dark:border-stone-700 text-[10px] font-extrabold tracking-widest uppercase px-3 py-1.5 shadow-md flex items-center gap-1.5">
            <Eye className="w-3 h-3" />
            <span>QUICK VIEW</span>
          </span>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5 bg-white dark:bg-stone-950 transition-colors">
        <div>
          {/* Style Code & Category Subtitle */}
          <div className="flex items-center justify-between text-[10px] text-stone-400 dark:text-stone-500 font-semibold uppercase tracking-wider mb-1">
            <span>GEARTRADE</span>
            <span className="font-mono text-stone-500 dark:text-stone-400">{product.styleCode}</span>
          </div>

          {/* Product Title in Sharp Minimalist Uppercase */}
          <h3
            onClick={() => onQuickView(product)}
            className="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-[13px] leading-snug uppercase line-clamp-2 hover:text-stone-600 dark:hover:text-stone-300 transition-colors cursor-pointer tracking-tight"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Price Formatting (e.g. Rs. 5,825.00) */}
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-sm sm:text-base font-black text-black dark:text-white">
              {formatNPR(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-stone-400 dark:text-stone-500 line-through">
                {formatNPR(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Interactive Color Swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="pt-1.5 border-t border-stone-100 dark:border-stone-850 flex items-center justify-between">
            <span className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wider font-medium">
              {activeColor?.name || 'Color'}
            </span>
            <div className="flex items-center gap-1">
              {product.colors.map((color, idx) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColorIdx(idx)}
                  className={`w-4 h-4 rounded-full border transition-all cursor-pointer relative flex items-center justify-center ${
                    selectedColorIdx === idx
                      ? 'ring-1 ring-black dark:ring-white ring-offset-1 dark:ring-offset-stone-950 border-white dark:border-stone-950 scale-110'
                      : 'border-stone-300 dark:border-stone-700 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                >
                  {selectedColorIdx === idx && (
                    <Check
                      className={`w-2 h-2 ${
                        color.hex === '#FFFFFF' || color.hex === '#CBB296' || color.hex === '#C2B280'
                          ? 'text-black'
                          : 'text-white'
                      }`}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Minimalist Action Button */}
        <div className="pt-2">
          <button
            onClick={() => onAddToCart(product, activeColor?.name, activeSize)}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold uppercase tracking-wider bg-black dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-black transition-colors cursor-pointer shadow-xs"
          >
            <ShoppingBag className="w-3 h-3" />
            <span>ADD TO BAG</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Star, Heart, ShoppingBag, Eye, Zap, Check, Edit } from 'lucide-react';
import { Product } from '../types';
import { formatNPR } from '../services/fonepayService';
import { GeartradeLogo } from './GeartradeLogo';

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
    <div className="group bg-white rounded-2xl border border-stone-200 hover:border-stone-400/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative font-sans">
      {/* Product Image Container */}
      <div
        className="relative aspect-4/3 sm:aspect-square w-full overflow-hidden bg-stone-100 cursor-pointer"
        onClick={() => onQuickView(product)}
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges (Green "New Arrival" / "Best Seller" matching Image 2) */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5 items-start">
          {product.badge ? (
            <span className="bg-emerald-600 text-white text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded shadow-sm uppercase tracking-wider">
              {product.badge}
            </span>
          ) : product.isNewArrival ? (
            <span className="bg-emerald-600 text-white text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded shadow-sm uppercase tracking-wider">
              New Arrival
            </span>
          ) : null}

          {discountPercent > 0 && (
            <span className="bg-[#DE4B56] text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm uppercase">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Top Right Mini GEARTRADE Brand Indicator & Action Buttons */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
          {onEditProduct && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditProduct(product);
              }}
              className="p-2 rounded-full bg-white/90 text-stone-700 hover:bg-[#102A45] hover:text-white backdrop-blur-md transition-all shadow-sm cursor-pointer"
              title="Admin: Edit Product & Photos"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all shadow-sm cursor-pointer ${
              isWishlisted
                ? 'bg-[#DE4B56] text-white hover:bg-rose-700'
                : 'bg-white/85 text-stone-700 hover:bg-white hover:text-[#DE4B56]'
            }`}
            title="Save to Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Quick View Hover Indicator */}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white/95 text-[#102A45] text-xs font-extrabold px-3.5 py-2 rounded-xl shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5 text-[#DE4B56]" />
            <span>Quick View</span>
          </span>
        </div>
      </div>

      {/* Product Content Details (Matching Image 2 Layout) */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Brand & Style Code Subtitle */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-semibold mb-1">
            <span className="text-[#102A45] font-black uppercase tracking-wider">GEARTRADE</span>
            <span className="text-stone-500 font-mono font-bold bg-stone-100 px-1.5 py-0.5 rounded text-[10px]">
              {product.styleCode}
            </span>
          </div>

          {/* Product Title in Uppercase */}
          <h3
            onClick={() => onQuickView(product)}
            className="font-black text-stone-900 text-xs sm:text-sm leading-snug uppercase line-clamp-2 hover:text-[#DE4B56] transition-colors cursor-pointer"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Price Formatting matching Image 2 (e.g. Rs. 5,825.00) */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-base sm:text-lg font-black text-[#102A45]">
              {formatNPR(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-stone-400 line-through">
                {formatNPR(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Interactive Color Swatches (Exact feature from Image 2) */}
        {product.colors && product.colors.length > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-stone-100">
            <div className="flex items-center justify-between text-[10px] text-stone-500">
              <span className="font-medium">Color:</span>
              <span className="font-bold text-stone-800">{activeColor?.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {product.colors.map((color, idx) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColorIdx(idx)}
                  className={`w-5 h-5 rounded-full border transition-all cursor-pointer relative flex items-center justify-center ${
                    selectedColorIdx === idx
                      ? 'ring-2 ring-[#102A45] ring-offset-1 border-white scale-110'
                      : 'border-stone-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                >
                  {selectedColorIdx === idx && (
                    <Check
                      className={`w-2.5 h-2.5 ${
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

        {/* Action Buttons: Minimal Add to Bag */}
        <div className="pt-2">
          <button
            onClick={() => onAddToCart(product, activeColor?.name, activeSize)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-stone-900 hover:bg-[#102A45] text-white transition-colors cursor-pointer shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Bag</span>
          </button>
        </div>
      </div>
    </div>
  );
};

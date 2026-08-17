import React, { useState } from 'react';
import { X, Star, Heart, ShoppingBag, ShieldCheck, MapPin, Truck, Check, Zap, Share2, Edit } from 'lucide-react';
import { Product } from '../types';
import { formatNPR } from '../services/fonepayService';
import { GeartradeLogo } from './GeartradeLogo';

interface ProductDetailModalProps {
  product: Product | null;
  isWishlisted: boolean;
  onClose: () => void;
  onToggleWishlist: (p: Product) => void;
  onAddToCart: (p: Product, qty: number, color?: string, size?: string) => void;
  onExpressBuy: (p: Product, qty: number, color?: string, size?: string) => void;
  onEditProduct?: (p: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isWishlisted,
  onClose,
  onToggleWishlist,
  onAddToCart,
  onExpressBuy,
  onEditProduct,
}) => {
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'specs' | 'features' | 'shipping'>('features');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!product) return null;

  const selectedColor = product.colors && product.colors.length > 0 ? product.colors[selectedColorIdx] : undefined;
  const selectedSize = product.sizes && product.sizes.length > 0 ? product.sizes[selectedSizeIdx] : undefined;

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xs animate-fadeIn font-sans">
      <div
        className="bg-white dark:bg-stone-950 w-full max-w-4xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden max-h-[90vh] flex flex-col relative animate-scaleUp text-stone-900 dark:text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
          <div className="flex items-center gap-3">
            <GeartradeLogo variant="full" theme="auto" size="sm" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[10px] font-bold bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 px-2 py-0.5 uppercase tracking-wider">
                {product.collection || 'SS2026'}
              </span>
              <span className="text-xs text-stone-400 dark:text-stone-500 font-mono font-bold">
                {product.styleCode}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEditProduct && (
              <button
                onClick={() => {
                  onEditProduct(product);
                  onClose();
                }}
                className="px-2.5 py-1 bg-stone-900 dark:bg-stone-100 hover:bg-black dark:hover:bg-white text-white dark:text-black transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
                title="Edit this product in Admin Hub"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit (Admin)</span>
              </button>
            )}
            <button
              onClick={handleShare}
              className="p-2 text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Share gear"
            >
              <Share2 className="w-4 h-4" />
              {copiedLink && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Image Gallery */}
          <div className="md:col-span-6 space-y-4">
            <div className="aspect-square w-full overflow-hidden bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 relative">
              <img
                src={product.images[selectedImageIdx] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              {discountPercent > 0 && (
                <span className="absolute top-3 left-3 bg-black dark:bg-white text-white dark:text-black font-bold text-[10px] px-2 py-0.5 uppercase tracking-wider">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail Selectors */}
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIdx(i)}
                    className={`w-16 h-16 overflow-hidden border transition-all cursor-pointer ${
                      selectedImageIdx === i
                        ? 'border-black dark:border-white ring-1 ring-black dark:ring-white'
                        : 'border-stone-200 dark:border-stone-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Brand Assurance Box */}
            <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
              <div className="flex items-center gap-2 font-bold text-black dark:text-white uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-stone-800 dark:text-stone-200" />
                <span>Himalayan Tested Guarantee</span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed font-light">
                All GEARTRADE apparel and technical gears are precision tested in high altitude conditions for wind resistance, tear strength, and thermal breathability.
              </p>
            </div>
          </div>

          {/* Right Column: Details, Color/Size Selectors, and Actions */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-5">
            <div>
              {/* Rating & Stock */}
              <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-2">
                <div className="flex items-center text-stone-900 dark:text-stone-100 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current mr-1" />
                  <span>{product.rating}</span>
                </div>
                <span>•</span>
                <span className="text-stone-500 dark:text-stone-400">{product.reviewCount} reviews</span>
                <span>•</span>
                <span className="text-black dark:text-white font-bold uppercase text-[10px] tracking-wider bg-stone-100 dark:bg-stone-900 px-2 py-0.5">
                  {product.inStock ? `IN STOCK (${product.stockCount})` : 'OUT OF STOCK'}
                </span>
              </div>

              {/* Title & Style Code */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-stone-400 dark:text-stone-500 tracking-[0.2em]">
                  GEARTRADE • {product.styleCode}
                </span>
                <h1 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white uppercase leading-snug tracking-tight">
                  {product.name}
                </h1>
              </div>

              {/* Price */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl font-black text-black dark:text-white">
                  {formatNPR(product.price * quantity)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-stone-400 dark:text-stone-500 line-through">
                    {formatNPR(product.originalPrice * quantity)}
                  </span>
                )}
                <span className="text-[11px] text-stone-400 dark:text-stone-500 uppercase font-medium">
                  ({formatNPR(product.price)} / unit)
                </span>
              </div>

              {/* Color Swatches Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider text-[11px]">COLOR:</span>
                    <span className="font-bold text-stone-600 dark:text-stone-400 uppercase text-[11px]">{selectedColor?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {product.colors.map((color, idx) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColorIdx(idx)}
                        className={`w-6 h-6 rounded-full border transition-all cursor-pointer relative flex items-center justify-center ${
                          selectedColorIdx === idx
                            ? 'ring-1 ring-black dark:ring-white ring-offset-2 dark:ring-offset-stone-950 scale-110 border-white dark:border-stone-950'
                            : 'border-stone-300 dark:border-stone-700 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {selectedColorIdx === idx && (
                          <Check
                            className={`w-3 h-3 ${
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

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider text-[11px]">SIZE:</span>
                    <span className="font-bold text-stone-600 dark:text-stone-400 uppercase text-[11px]">{selectedSize}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((sz, idx) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSizeIdx(idx)}
                        className={`px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer border uppercase tracking-wider ${
                          selectedSizeIdx === idx
                            ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                            : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:border-black dark:hover:border-white'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab Navigation */}
              <div className="mt-6 border-b border-stone-200 dark:border-stone-800 flex gap-6 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('features')}
                  className={`pb-2 border-b-2 transition-colors cursor-pointer uppercase tracking-[0.14em] text-[11px] ${
                    activeTab === 'features'
                      ? 'border-black dark:border-white text-black dark:text-white'
                      : 'border-transparent text-stone-400 dark:text-stone-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  Features
                </button>
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`pb-2 border-b-2 transition-colors cursor-pointer uppercase tracking-[0.14em] text-[11px] ${
                    activeTab === 'specs'
                      ? 'border-black dark:border-white text-black dark:text-white'
                      : 'border-transparent text-stone-400 dark:text-stone-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  Specs
                </button>
                <button
                  onClick={() => setActiveTab('shipping')}
                  className={`pb-2 border-b-2 transition-colors cursor-pointer uppercase tracking-[0.14em] text-[11px] ${
                    activeTab === 'shipping'
                      ? 'border-black dark:border-white text-black dark:text-white'
                      : 'border-transparent text-stone-400 dark:text-stone-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  Delivery
                </button>
              </div>

              {/* Tab Content */}
              <div className="py-3 text-xs text-stone-600 dark:text-stone-400 leading-relaxed min-h-[90px]">
                {activeTab === 'features' && (
                  <div className="space-y-2">
                    <p className="font-light">{product.description}</p>
                    <div className="space-y-1 pt-1">
                      {product.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-stone-800 dark:text-stone-200 font-medium text-[11px]">
                          <Check className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === 'specs' && (
                  <div className="grid grid-cols-2 gap-2 bg-stone-50 dark:bg-stone-900 p-3 border border-stone-200 dark:border-stone-800 text-[11px]">
                    {Object.entries(product.specifications).map(([k, v]) => (
                      <div key={k}>
                        <span className="font-bold text-black dark:text-white uppercase tracking-wider text-[10px]">{k}: </span>
                        <span className="text-stone-600 dark:text-stone-400">{v}</span>
                      </div>
                    ))}
                    <div>
                      <span className="font-bold text-black dark:text-white uppercase tracking-wider text-[10px]">Weight: </span>
                      <span className="text-stone-600 dark:text-stone-400">{product.weight}</span>
                    </div>
                  </div>
                )}
                {activeTab === 'shipping' && (
                  <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400 font-light">
                    <div className="flex items-center gap-2 text-black dark:text-white font-bold uppercase tracking-wider text-[11px]">
                      <Truck className="w-3.5 h-3.5 text-black dark:text-white" />
                      <span>Nationwide Nepal Delivery</span>
                    </div>
                    <p>• Fast delivery across Kathmandu Valley (24-48 hrs) and 7 Provinces</p>
                    <p>• Fonepay EMVCo QR, eSewa, Khalti or Cash on Delivery</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Selector & Checkout Actions */}
            <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider text-[11px]">QUANTITY</span>
                <div className="flex items-center border border-stone-300 dark:border-stone-700 overflow-hidden bg-white dark:bg-stone-900">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-xs font-bold text-stone-900 dark:text-stone-100 border-x border-stone-200 dark:border-stone-700 min-w-[36px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                    className="px-3 py-1 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    onAddToCart(product, quantity, selectedColor?.name, selectedSize);
                    onClose();
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 text-black dark:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border border-stone-300 dark:border-stone-700"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>

                <button
                  onClick={() => {
                    onExpressBuy(product, quantity, selectedColor?.name, selectedSize);
                    onClose();
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-black dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-black font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                >
                  <span>Buy Now</span>
                </button>
              </div>

              <button
                onClick={() => onToggleWishlist(product)}
                className="w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white py-1 cursor-pointer"
              >
                <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-black dark:fill-white text-black dark:text-white' : ''}`} />
                <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

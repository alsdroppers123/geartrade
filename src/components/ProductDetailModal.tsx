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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xs animate-fadeIn font-sans">
      <div
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col relative animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-stone-200 bg-[#102A45] text-white">
          <div className="flex items-center gap-3">
            <GeartradeLogo variant="badge" size="sm" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-[#DE4B56] text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {product.collection || 'SS2026 Collection'}
              </span>
              <span className="text-xs text-slate-300 font-mono font-bold">
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
                className="px-2.5 py-1 bg-[#DE4B56] hover:bg-[#c93f4a] text-white rounded-lg transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
                title="Edit this product in Admin Hub"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit (Admin)</span>
              </button>
            )}
            <button
              onClick={handleShare}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Share gear"
            >
              <Share2 className="w-4 h-4" />
              {copiedLink && <span className="text-xs text-emerald-400 font-bold">Copied!</span>}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Image Gallery */}
          <div className="md:col-span-6 space-y-4">
            <div className="aspect-square w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-inner relative">
              <img
                src={product.images[selectedImageIdx] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              {discountPercent > 0 && (
                <span className="absolute top-3 left-3 bg-[#DE4B56] text-white font-black text-xs px-2.5 py-1 rounded shadow">
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
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImageIdx === i
                        ? 'border-[#102A45] ring-2 ring-slate-300'
                        : 'border-stone-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Brand Assurance Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2 font-black text-[#102A45]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Himalayan Tested Performance Guarantee</span>
              </div>
              <p>
                All GEARTRADE apparel and technical gears are precision tested in high altitude conditions for wind resistance, tear strength, and thermal breathability.
              </p>
            </div>
          </div>

          {/* Right Column: Details, Color/Size Selectors, and Actions */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-5">
            <div>
              {/* Rating & Stock */}
              <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                <div className="flex items-center text-[#F5A623]">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="ml-1 font-bold text-stone-900">{product.rating}</span>
                </div>
                <span>•</span>
                <span className="underline">{product.reviewCount} reviews</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  {product.inStock ? `In Stock (${product.stockCount} left)` : 'Out of Stock'}
                </span>
              </div>

              {/* Title & Style Code */}
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase text-[#102A45] tracking-wider">
                  GEARTRADE {product.styleCode}
                </span>
                <h1 className="text-lg sm:text-xl font-black text-stone-900 uppercase leading-snug">
                  {product.name}
                </h1>
              </div>

              {/* Price */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-[#102A45]">
                  {formatNPR(product.price * quantity)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-stone-400 line-through">
                    {formatNPR(product.originalPrice * quantity)}
                  </span>
                )}
                <span className="text-xs text-stone-500 font-medium">
                  ({formatNPR(product.price)} each • NPR)
                </span>
              </div>

              {/* Color Swatches Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-800">Select Color:</span>
                    <span className="font-extrabold text-[#102A45]">{selectedColor?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {product.colors.map((color, idx) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColorIdx(idx)}
                        className={`w-7 h-7 rounded-full border transition-all cursor-pointer relative flex items-center justify-center ${
                          selectedColorIdx === idx
                            ? 'ring-2 ring-[#102A45] ring-offset-2 scale-110'
                            : 'border-stone-300 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {selectedColorIdx === idx && (
                          <Check
                            className={`w-3.5 h-3.5 ${
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
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-800">Select Size:</span>
                    <span className="font-extrabold text-[#102A45]">{selectedSize}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((sz, idx) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSizeIdx(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          selectedSizeIdx === idx
                            ? 'bg-[#102A45] text-white border-[#102A45] shadow-sm'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab Navigation */}
              <div className="mt-6 border-b border-stone-200 flex gap-4 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('features')}
                  className={`pb-2 border-b-2 transition-colors cursor-pointer uppercase tracking-wider ${
                    activeTab === 'features'
                      ? 'border-[#102A45] text-[#102A45]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Features & Details
                </button>
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`pb-2 border-b-2 transition-colors cursor-pointer uppercase tracking-wider ${
                    activeTab === 'specs'
                      ? 'border-[#102A45] text-[#102A45]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Specifications
                </button>
                <button
                  onClick={() => setActiveTab('shipping')}
                  className={`pb-2 border-b-2 transition-colors cursor-pointer uppercase tracking-wider ${
                    activeTab === 'shipping'
                      ? 'border-[#102A45] text-[#102A45]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Nepal Shipping
                </button>
              </div>

              {/* Tab Content */}
              <div className="py-3 text-xs text-stone-600 leading-relaxed min-h-[90px]">
                {activeTab === 'features' && (
                  <div className="space-y-2">
                    <p>{product.description}</p>
                    <div className="space-y-1 pt-1">
                      {product.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-stone-800 font-medium">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === 'specs' && (
                  <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                    {Object.entries(product.specifications).map(([k, v]) => (
                      <div key={k}>
                        <span className="font-bold text-stone-800">{k}: </span>
                        <span className="text-stone-600">{v}</span>
                      </div>
                    ))}
                    <div>
                      <span className="font-bold text-stone-800">Weight: </span>
                      <span className="text-stone-600">{product.weight}</span>
                    </div>
                  </div>
                )}
                {activeTab === 'shipping' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-stone-800 font-bold">
                      <Truck className="w-4 h-4 text-[#DE4B56]" />
                      <span>Delivery throughout 7 Provinces of Nepal</span>
                    </div>
                    <p>• Fast dispatch across Kathmandu Valley and nationwide delivery</p>
                    <p>• Secure checkout via Fonepay QR or Cash on Delivery</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Selector & Checkout Actions */}
            <div className="pt-4 border-t border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700">Quantity</span>
                <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-1.5 text-stone-600 hover:bg-stone-100 font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold text-stone-900 border-x border-stone-200 min-w-[36px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                    className="px-3.5 py-1.5 text-stone-600 hover:bg-stone-100 font-bold cursor-pointer"
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
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-[#102A45]" />
                  <span>Add to Bag</span>
                </button>

                <button
                  onClick={() => {
                    onExpressBuy(product, quantity, selectedColor?.name, selectedSize);
                    onClose();
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#102A45] hover:bg-[#162B4D] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <span>Buy Now</span>
                </button>
              </div>

              <button
                onClick={() => onToggleWishlist(product)}
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-stone-600 hover:text-[#DE4B56] py-1 cursor-pointer"
              >
                <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-[#DE4B56] text-[#DE4B56]' : ''}`} />
                <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

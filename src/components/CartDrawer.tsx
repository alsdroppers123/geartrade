import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Truck, ShieldCheck, Sparkles } from 'lucide-react';
import { CartItem } from '../types';
import { NEPAL_PROVINCES, POPULAR_COUPONS } from '../data/nepalLocations';
import { formatNPR } from '../services/fonepayService';
import { GeartradeLogo } from './GeartradeLogo';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, qty: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  selectedProvinceId: number;
  onSelectProvince: (provId: number) => void;
  appliedCoupon: string | null;
  onApplyCoupon: (code: string) => { success: boolean; message: string };
  onRemoveCoupon: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  selectedProvinceId,
  onSelectProvince,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  onProceedToCheckout,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success?: boolean; text: string } | null>(null);

  if (!isOpen) return null;

  const currentProvince = NEPAL_PROVINCES.find((p) => p.id === selectedProvinceId) || NEPAL_PROVINCES[2];

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  let discount = 0;
  if (appliedCoupon && POPULAR_COUPONS[appliedCoupon]) {
    const coupon = POPULAR_COUPONS[appliedCoupon];
    if (coupon.discountPercent) {
      discount = Math.round((subtotal * coupon.discountPercent) / 100);
    } else if (coupon.discountFlat) {
      discount = Math.min(subtotal, coupon.discountFlat);
    }
  }

  const deliveryCharge = items.length > 0 ? currentProvince.deliveryFee : 0;
  const taxableAmount = Math.max(0, subtotal - discount);
  const vatAmount = Math.round(taxableAmount * 0.13);
  const grandTotal = Math.max(0, taxableAmount + deliveryCharge);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = onApplyCoupon(couponInput.trim().toUpperCase());
    setCouponFeedback({ success: res.success, text: res.message });
    if (res.success) {
      setCouponInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn font-sans">
      <div
        className="w-full max-w-md bg-white text-stone-900 h-full flex flex-col shadow-2xl border-l border-stone-200 animate-slideLeft"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-[#102A45] text-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#F5A623]" />
            <h2 className="font-extrabold text-sm uppercase tracking-wider text-white">
              Shopping Bag ({items.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <ShoppingBag className="w-8 h-8 text-[#102A45]" />
            </div>
            <div>
              <p className="font-extrabold text-slate-800 text-base">Your shopping bag is empty</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Explore GEARTRADE technical windcheaters, flex pants, trekking backpacks, and trail footwear.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#102A45] hover:bg-[#162B4D] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer"
            >
              Shop SS2026 Collection
            </button>
          </div>
        ) : (
          <>
            {/* Scrollable Item List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map(({ product, quantity, selectedColor, selectedSize }) => (
                <div
                  key={product.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex gap-3 items-center group hover:border-[#102A45]/40 transition-all"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-stone-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-[10px] text-[#102A45] font-bold">
                      <span>GEARTRADE</span>
                      <span>•</span>
                      <span className="font-mono">{product.styleCode}</span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#102A45]">
                      {product.name}
                    </h3>

                    {/* Variant tags */}
                    {(selectedColor || selectedSize) && (
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500">
                        {selectedColor && (
                          <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                            {selectedColor}
                          </span>
                        )}
                        {selectedSize && (
                          <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                            {selectedSize}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center bg-white border border-slate-300 rounded-lg">
                        <button
                          onClick={() => onUpdateQuantity(product.id, Math.max(1, quantity - 1))}
                          className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-bold text-slate-900 border-x border-slate-200">
                          {quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(product.id, Math.min(product.stockCount, quantity + 1))}
                          className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100 font-bold"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-black text-xs text-[#102A45]">
                        {formatNPR(product.price * quantity)}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(product.id)}
                    className="text-slate-400 hover:text-[#DE4B56] p-1.5 rounded-lg transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Delivery Province Selector */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#DE4B56]" />
                    <span>Nepal Delivery Province</span>
                  </span>
                  <span className="text-[#102A45] font-black">
                    {formatNPR(currentProvince.deliveryFee)}
                  </span>
                </div>
                <select
                  value={selectedProvinceId}
                  onChange={(e) => onSelectProvince(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#102A45]"
                >
                  {NEPAL_PROVINCES.map((prov) => (
                    <option key={prov.id} value={prov.id}>
                      {prov.name} ({formatNPR(prov.deliveryFee)} - {prov.estimatedDays})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500">
                  Estimated Delivery: {currentProvince.estimatedDays} across Nepal.
                </p>
              </div>

              {/* Coupon Code Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span>Coupon / Promo Code</span>
                  </span>
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 text-emerald-900 px-3 py-2 rounded-xl">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{appliedCoupon} Applied ({POPULAR_COUPONS[appliedCoupon]?.description})</span>
                    </div>
                    <button
                      onClick={onRemoveCoupon}
                      className="text-emerald-700 hover:text-emerald-900 text-[10px] underline ml-2 cursor-pointer font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="e.g. FONEPAY10 or DASHAIN500"
                      className="flex-1 bg-white border border-slate-300 text-slate-900 uppercase text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#102A45]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#102A45] hover:bg-[#162B4D] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponFeedback && (
                  <p
                    className={`text-[10px] ${
                      couponFeedback.success ? 'text-emerald-600 font-bold' : 'text-rose-600'
                    }`}
                  >
                    {couponFeedback.text}
                  </p>
                )}

                {!appliedCoupon && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {Object.keys(POPULAR_COUPONS).map((code) => (
                      <button
                        key={code}
                        onClick={() => {
                          onApplyCoupon(code);
                          setCouponFeedback({ success: true, text: `Applied code ${code}` });
                        }}
                        className="text-[10px] bg-white hover:bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-300 cursor-pointer font-medium"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer & Checkout Action */}
            <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-900 font-bold">{formatNPR(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount ({appliedCoupon})</span>
                    <span>-{formatNPR(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery ({currentProvince.name.split(' ')[0]})</span>
                  <span className="text-slate-900 font-bold">{formatNPR(deliveryCharge)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                  <span>VAT (13% Included in price)</span>
                  <span>{formatNPR(vatAmount)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-300">
                  <span>Grand Total</span>
                  <span className="text-[#102A45]">{formatNPR(grandTotal)}</span>
                </div>
              </div>

              {/* Checkout Trigger */}
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 bg-[#102A45] hover:bg-[#162B4D] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Secure Checkout • Fonepay & Cash on Delivery</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
